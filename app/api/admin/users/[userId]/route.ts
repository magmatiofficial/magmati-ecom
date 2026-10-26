/**
 * @file app/api/admin/users/[userId]/route.ts
 * @description Admin API endpoint for individual user operations:
 * - GET: Read single user (safe projection via toAdminUserView)
 * - PATCH: Role update (setRole), suspension toggle (setSuspended), or details update (updateDetails)
 * - DELETE: Delete user from Firestore and Firebase Auth
 * Protected by admin auth guard, super admin checks, last-admin protection, and audit logs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { isUserRole, USER_EMAIL_PATTERN } from '@/lib/users/userFilters';
import { toAdminUserView, getSuperAdminEmails } from '@/lib/users/userServerView';
import { adminAuth } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_users',
      limit: 120,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    const { userId: rawUserId } = await context.params;
    if (!rawUserId || typeof rawUserId !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid user ID.' }, { status: 400 });
    }

    let targetUserId = '';
    try {
      targetUserId = decodeURIComponent(rawUserId).trim().toLowerCase();
    } catch {
      targetUserId = rawUserId.trim().toLowerCase();
    }

    if (!USER_EMAIL_PATTERN.test(targetUserId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID.' }, { status: 400 });
    }

    const docSnap = await guard.db.collection('users').doc(targetUserId).get();
    if (!docSnap.exists) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        user: toAdminUserView(docSnap.id, docSnap.data() as Record<string, unknown>),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    console.error('[AdminUserItemAPI] Error loading user');
    return NextResponse.json(
      { success: false, error: 'Failed to load user.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_users_write',
      limit: 60,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    const { userId: rawUserId } = await context.params;
    if (!rawUserId || typeof rawUserId !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid user ID.' }, { status: 400 });
    }

    let targetUserId = '';
    try {
      targetUserId = decodeURIComponent(rawUserId).trim().toLowerCase();
    } catch {
      targetUserId = rawUserId.trim().toLowerCase();
    }

    if (!USER_EMAIL_PATTERN.test(targetUserId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID.' }, { status: 400 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const callerEmail = (guard.email || '').trim().toLowerCase();
    const superAdminEmails = getSuperAdminEmails();
    const isCallerSuperAdmin = superAdminEmails.includes(callerEmail);

    const action = body.action || (
      'role' in body ? 'setRole' :
      ('suspended' in body || 'isSuspended' in body) ? 'setSuspended' :
      'updateDetails'
    );

    const userRef = guard.db.collection('users').doc(targetUserId);
    const docSnap = await userRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }
    const currentData = (docSnap.data() || {}) as Record<string, unknown>;
    const currentRole = currentData.role === 'admin' ? 'admin' : 'customer';
    const nowIso = new Date().toISOString();

    // 1. setRole
    if (action === 'setRole') {
      const newRole = body.role;
      if (!isUserRole(newRole)) {
        return NextResponse.json({ success: false, error: 'Invalid role.' }, { status: 400 });
      }

      if (!isCallerSuperAdmin) {
        return NextResponse.json({ success: false, error: 'Only the main admin can change roles.' }, { status: 403 });
      }

      if (targetUserId === callerEmail) {
        return NextResponse.json({ success: false, error: 'Cannot change your own role.' }, { status: 400 });
      }

      if (superAdminEmails.includes(targetUserId)) {
        return NextResponse.json({ success: false, error: 'This account is protected.' }, { status: 400 });
      }

      if (currentRole === 'admin' && newRole === 'customer') {
        const adminCountSnap = await guard.db.collection('users').where('role', '==', 'admin').count().get();
        const count = adminCountSnap.data().count;
        if (count <= 1) {
          return NextResponse.json({ success: false, error: 'At least one admin must remain.' }, { status: 409 });
        }
      }

      await userRef.update({
        role: newRole,
        updatedAt: nowIso,
      });

      try {
        await guard.db.collection('admin_audit_logs').add({
          action: 'users.setRole',
          adminEmail: guard.email,
          targetEmail: targetUserId,
          targetId: targetUserId,
          oldRole: currentRole,
          newRole,
          at: FieldValue.serverTimestamp(),
          createdAt: nowIso,
        });
      } catch {
        console.error('[AdminUserItemAPI] Audit log write failed');
      }

      return NextResponse.json(
        {
          success: true,
          user: toAdminUserView(targetUserId, { ...currentData, role: newRole }),
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    // 2. setSuspended
    if (action === 'setSuspended') {
      const suspended = typeof body.suspended === 'boolean' ? body.suspended : Boolean(body.isSuspended);

      if (suspended) {
        if (targetUserId === callerEmail) {
          return NextResponse.json({ success: false, error: 'Cannot suspend your own account.' }, { status: 400 });
        }
        if (superAdminEmails.includes(targetUserId)) {
          return NextResponse.json({ success: false, error: 'This account is protected.' }, { status: 400 });
        }

        if (currentRole === 'admin') {
          const adminsSnap = await guard.db.collection('users').where('role', '==', 'admin').get();
          const activeAdmins = adminsSnap.docs.filter(
            (d) => d.id !== targetUserId && !d.data()?.isSuspended
          );
          if (activeAdmins.length === 0) {
            return NextResponse.json({ success: false, error: 'At least one active admin must remain.' }, { status: 409 });
          }
        }
      }

      await userRef.update({
        isSuspended: suspended,
        updatedAt: nowIso,
      });

      try {
        await guard.db.collection('admin_audit_logs').add({
          action: suspended ? 'users.suspend' : 'users.reactivate',
          adminEmail: guard.email,
          targetEmail: targetUserId,
          targetId: targetUserId,
          suspended,
          at: FieldValue.serverTimestamp(),
          createdAt: nowIso,
        });
      } catch {
        console.error('[AdminUserItemAPI] Audit log write failed');
      }

      return NextResponse.json(
        {
          success: true,
          user: toAdminUserView(targetUserId, { ...currentData, isSuspended: suspended }),
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    // 3. updateDetails
    if (action === 'updateDetails') {
      const payload = (body.data && typeof body.data === 'object' ? body.data : body) as Record<string, unknown>;
      const updateFields: Record<string, unknown> = {};

      if (typeof payload.name === 'string') {
        const trimmedName = payload.name.trim();
        if (!trimmedName || trimmedName.length > 100) {
          return NextResponse.json({ success: false, error: 'Invalid name.' }, { status: 400 });
        }
        updateFields.name = trimmedName;
        const parts = trimmedName.split(/\s+/).filter(Boolean);
        updateFields.avatarLetter = (parts.map((p: string) => p[0]).join('').slice(0, 2) || trimmedName[0] || 'U').toUpperCase();
      }

      if (typeof payload.phone === 'string') {
        const trimmedPhone = payload.phone.trim();
        if (trimmedPhone.length > 30) {
          return NextResponse.json({ success: false, error: 'Phone number is too long.' }, { status: 400 });
        }
        updateFields.phone = trimmedPhone;
      }

      if (typeof payload.address === 'string') {
        const trimmedAddress = payload.address.trim();
        if (trimmedAddress.length > 300) {
          return NextResponse.json({ success: false, error: 'Address is too long.' }, { status: 400 });
        }
        updateFields.address = trimmedAddress;
      }

      if (typeof payload.avatarUrl === 'string') {
        const trimmedUrl = payload.avatarUrl.trim();
        if (trimmedUrl.length > 500) {
          return NextResponse.json({ success: false, error: 'Avatar URL is too long.' }, { status: 400 });
        }
        updateFields.avatarUrl = trimmedUrl;
      }

      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json({ success: false, error: 'No valid fields provided for update.' }, { status: 400 });
      }

      updateFields.updatedAt = nowIso;
      await userRef.update(updateFields);

      try {
        await guard.db.collection('admin_audit_logs').add({
          action: 'users.updateDetails',
          adminEmail: guard.email,
          targetEmail: targetUserId,
          targetId: targetUserId,
          fieldsUpdated: Object.keys(updateFields).filter((k) => k !== 'updatedAt'),
          at: FieldValue.serverTimestamp(),
          createdAt: nowIso,
        });
      } catch {
        console.error('[AdminUserItemAPI] Audit log write failed');
      }

      return NextResponse.json(
        {
          success: true,
          user: toAdminUserView(targetUserId, { ...currentData, ...updateFields }),
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    return NextResponse.json({ success: false, error: 'Unsupported action.' }, { status: 400 });
  } catch {
    console.error('[AdminUserItemAPI] Error updating user');
    return NextResponse.json(
      { success: false, error: 'Failed to update user.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_users_write',
      limit: 60,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    const { userId: rawUserId } = await context.params;
    if (!rawUserId || typeof rawUserId !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid user ID.' }, { status: 400 });
    }

    let targetUserId = '';
    try {
      targetUserId = decodeURIComponent(rawUserId).trim().toLowerCase();
    } catch {
      targetUserId = rawUserId.trim().toLowerCase();
    }

    if (!USER_EMAIL_PATTERN.test(targetUserId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID.' }, { status: 400 });
    }

    const callerEmail = (guard.email || '').trim().toLowerCase();
    const superAdminEmails = getSuperAdminEmails();
    const isCallerSuperAdmin = superAdminEmails.includes(callerEmail);

    if (!isCallerSuperAdmin) {
      return NextResponse.json({ success: false, error: 'Only the main admin can delete users.' }, { status: 403 });
    }

    if (targetUserId === callerEmail) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own account.' }, { status: 400 });
    }

    if (superAdminEmails.includes(targetUserId)) {
      return NextResponse.json({ success: false, error: 'This account is protected.' }, { status: 400 });
    }

    const userRef = guard.db.collection('users').doc(targetUserId);
    const docSnap = await userRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const currentData = (docSnap.data() || {}) as Record<string, unknown>;
    const currentRole = currentData.role === 'admin' ? 'admin' : 'customer';

    if (currentRole === 'admin') {
      const adminCountSnap = await guard.db.collection('users').where('role', '==', 'admin').count().get();
      if (adminCountSnap.data().count <= 1) {
        return NextResponse.json({ success: false, error: 'At least one admin must remain.' }, { status: 409 });
      }
    }

    // Delete Firestore document
    await userRef.delete();

    // Delete from Firebase Auth if user exists
    try {
      const authUser = await adminAuth.getUserByEmail(targetUserId);
      if (authUser?.uid) {
        await adminAuth.deleteUser(authUser.uid);
      }
    } catch (authErr: unknown) {
      const errCode = (authErr as { code?: string })?.code;
      if (errCode !== 'auth/user-not-found') {
        const errMsg = authErr instanceof Error ? authErr.message : String(authErr);
        console.warn('[AdminUserItemAPI] Auth delete warning:', errMsg);
      }
    }

    const nowIso = new Date().toISOString();
    try {
      await guard.db.collection('admin_audit_logs').add({
        action: 'users.delete',
        adminEmail: guard.email,
        targetEmail: targetUserId,
        targetId: targetUserId,
        deletedRole: currentRole,
        at: FieldValue.serverTimestamp(),
        createdAt: nowIso,
      });
    } catch {
      console.error('[AdminUserItemAPI] Audit log write failed');
    }

    return NextResponse.json(
      {
        success: true,
        id: targetUserId,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch {
    console.error('[AdminUserItemAPI] Error deleting user');
    return NextResponse.json(
      { success: false, error: 'Failed to delete user.' },
      { status: 500 }
    );
  }
}

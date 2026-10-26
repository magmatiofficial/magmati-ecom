/**
 * @file app/api/admin/users/route.ts
 * @description Admin-only, read-only paged API for user accounts using FieldPath.documentId() ascending order.
 * Strictly projects safe fields and never returns sensitive credentials or private data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { isUserRole, USER_EMAIL_PATTERN, AdminUserView, UserRole } from '@/lib/users/userFilters';
import { toAdminUserView, getSuperAdminEmails } from '@/lib/users/userServerView';
import { normalizePhoneQuery } from '@/lib/orders/orderFilters';
import { FieldPath, FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_users',
      limit: 120,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }
    const adminDb = guard.db;

    const { searchParams } = new URL(req.url);

    // Parse limit (1-50, default 25)
    let limitNum = 25;
    const limitParam = searchParams.get('limit');
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 50) {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
      limitNum = parsed;
    }

    // Parse role
    const roleParam = searchParams.get('role');
    if (roleParam && !isUserRole(roleParam)) {
      return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
    }

    // Parse q (search query, max 60 chars)
    const qParam = searchParams.get('q');
    let searchQuery = '';
    if (qParam !== null) {
      searchQuery = qParam.trim();
      if (searchQuery.length > 60) {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
    }

    // Parse cursor (JSON { i: string } encoded with base64url)
    let startAfterId: string | null = null;
    const cursorParam = searchParams.get('cursor');
    if (cursorParam) {
      try {
        const decodedStr = Buffer.from(cursorParam, 'base64url').toString('utf8');
        const parsed = JSON.parse(decodedStr);
        if (
          parsed &&
          typeof parsed.i === 'string' &&
          USER_EMAIL_PATTERN.test(parsed.i)
        ) {
          startAfterId = parsed.i;
        } else {
          return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid query.' }, { status: 400 });
      }
    }

    const usersRef = adminDb.collection('users');
    let matchedUsers: Array<{ id: string; data: Record<string, unknown> }> = [];

    // Handle search query `q` if present
    if (searchQuery) {
      const isPhoneLike = /^[\s\d+-]+$/.test(searchQuery);
      const digitsOnly = normalizePhoneQuery(searchQuery);

      if (searchQuery.includes('@')) {
        const emailLower = searchQuery.toLowerCase();
        const docSnap = await usersRef.doc(emailLower).get();
        if (docSnap.exists) {
          matchedUsers.push({ id: docSnap.id, data: (docSnap.data() || {}) as Record<string, unknown> });
        }
      } else if (USER_EMAIL_PATTERN.test(searchQuery)) {
        const docSnap = await usersRef.doc(searchQuery).get();
        if (docSnap.exists) {
          matchedUsers.push({ id: docSnap.id, data: (docSnap.data() || {}) as Record<string, unknown> });
        }
      }

      if (isPhoneLike && digitsOnly.length >= 10) {
        const phoneSnap1 = await usersRef.where('phone', '==', digitsOnly).limit(50).get();
        for (const docSnap of phoneSnap1.docs) {
          matchedUsers.push({ id: docSnap.id, data: (docSnap.data() || {}) as Record<string, unknown> });
        }
        if (/^\d{10}$/.test(digitsOnly) && !digitsOnly.startsWith('0')) {
          const phoneSnap2 = await usersRef.where('phone', '==', '0' + digitsOnly).limit(50).get();
          for (const docSnap of phoneSnap2.docs) {
            matchedUsers.push({ id: docSnap.id, data: (docSnap.data() || {}) as Record<string, unknown> });
          }
        }
      }

      // De-duplicate by id
      const seenIds = new Set<string>();
      const uniqueUsers: Array<{ id: string; data: Record<string, unknown> }> = [];
      for (const u of matchedUsers) {
        if (u && u.id && !seenIds.has(u.id)) {
          seenIds.add(u.id);
          uniqueUsers.push(u);
        }
      }

      let filteredUsers = uniqueUsers;
      if (roleParam) {
        filteredUsers = filteredUsers.filter((u) => {
          const r = u.data?.role === 'admin' ? 'admin' : 'customer';
          return r === roleParam;
        });
      }

      // Sort ascending by document id
      filteredUsers.sort((a, b) => a.id.localeCompare(b.id));

      const sliced = filteredUsers.slice(0, limitNum);
      const usersList: AdminUserView[] = sliced.map((u) => toAdminUserView(u.id, u.data));

      return NextResponse.json(
        {
          success: true,
          users: usersList,
          nextCursor: null,
          hasMore: false,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Normal paginated query (no q)
    let qRef: FirebaseFirestore.Query = usersRef;

    if (roleParam) {
      qRef = qRef.where('role', '==', roleParam);
    }

    qRef = qRef.orderBy(FieldPath.documentId(), 'asc');

    if (startAfterId) {
      qRef = qRef.startAfter(startAfterId);
    }

    qRef = qRef.limit(limitNum + 1);

    const snapshot = await qRef.get();
    const docs = snapshot.docs;
    const hasMore = docs.length > limitNum;
    const pageDocs = hasMore ? docs.slice(0, limitNum) : docs;

    const usersList: AdminUserView[] = pageDocs.map((d) =>
      toAdminUserView(d.id, d.data() as Record<string, unknown>)
    );

    let nextCursor: string | null = null;
    if (hasMore && pageDocs.length > 0) {
      const lastDoc = pageDocs[pageDocs.length - 1];
      const cursorObj = { i: lastDoc.id };
      nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString('base64url');
    }

    return NextResponse.json(
      {
        success: true,
        users: usersList,
        nextCursor,
        hasMore,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    console.error('[AdminUsersAPI] Error loading users');
    return NextResponse.json(
      { success: false, error: 'Failed to load users.' },
      { status: 500 }
    );
  }
}

const PHONE_REGEX = /^[0-9+\-\s]{7,20}$/;
const sanitizeStr = (s: unknown) => (typeof s === 'string' ? s.replace(/[\u0000-\u001F\u007F]/g, '').trim() : '');

export async function POST(req: NextRequest) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_users_write',
      limit: 60,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!emailRaw || !emailRaw.includes('@') || !USER_EMAIL_PATTERN.test(emailRaw)) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const nameRaw = sanitizeStr(body.name);
    if (!nameRaw || nameRaw.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name is required (max 100 characters).' },
        { status: 400 }
      );
    }

    let role: UserRole = 'customer';
    if (body.role !== undefined && body.role !== null) {
      if (!isUserRole(body.role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role.' },
          { status: 400 }
        );
      }
      role = body.role;
    }

    if (role === 'admin') {
      const superAdminEmails = getSuperAdminEmails();
      if (!superAdminEmails.includes((guard.email || '').toLowerCase().trim())) {
        return NextResponse.json(
          { success: false, error: 'Only the main admin can assign the admin role.' },
          { status: 403 }
        );
      }
    }

    const phoneRaw = sanitizeStr(body.phone);
    let phone = '';
    if (phoneRaw) {
      if (!PHONE_REGEX.test(phoneRaw) || phoneRaw.length > 30) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone format.' },
          { status: 400 }
        );
      }
      phone = phoneRaw;
    }

    const address = sanitizeStr(body.address);
    if (address.length > 300) {
      return NextResponse.json(
        { success: false, error: 'Address is too long.' },
        { status: 400 }
      );
    }

    const userRef = guard.db.collection('users').doc(emailRaw);

    const parts = nameRaw.split(/\s+/).filter(Boolean);
    const avatarLetter = (parts.map((p: string) => p[0]).join('').slice(0, 2) || nameRaw[0] || 'U').toUpperCase();

    const nowIso = new Date().toISOString();
    const newUserData = {
      id: `usr-${Date.now()}`,
      name: nameRaw,
      email: emailRaw,
      role,
      phone,
      address,
      avatarLetter,
      isSuspended: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await userRef.create(newUserData);
    } catch (err: unknown) {
      const errCode = (err as { code?: unknown })?.code;
      const errMsg = String((err as { message?: unknown })?.message || '').toLowerCase();
      if (errCode === 6 || errCode === 'already-exists' || errMsg.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists.' },
          { status: 409 }
        );
      }
      throw err;
    }

    try {
      await guard.db.collection('admin_audit_logs').add({
        action: 'users.create',
        adminEmail: guard.email,
        targetEmail: emailRaw,
        targetId: emailRaw,
        role: newUserData.role,
        at: FieldValue.serverTimestamp(),
        createdAt: nowIso,
      });
    } catch {
      console.error('[AdminUsersAPI] Audit log write failed');
    }

    return NextResponse.json(
      {
        success: true,
        user: toAdminUserView(emailRaw, newUserData),
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    console.error('[AdminUsersAPI] Error creating user');
    return NextResponse.json(
      { success: false, error: 'Failed to create user.' },
      { status: 500 }
    );
  }
}

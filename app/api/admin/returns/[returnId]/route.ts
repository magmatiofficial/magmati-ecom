/**
 * @file app/api/admin/returns/[returnId]/route.ts
 * @description Admin API endpoint to read, patch (setStatus or resolveShipping), and delete a single return request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminRequest } from '@/lib/api/adminGuard';
import { RETURN_ID_PATTERN, isReturnStatus } from '@/lib/returns/returnFilters';
import { computeRefundForStatus, computeShippingResolution } from '@/lib/returns/returnRefund';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ returnId: string }> }
) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_return_item',
      limit: 120,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    const { returnId } = await context.params;

    if (!returnId || typeof returnId !== 'string' || !RETURN_ID_PATTERN.test(returnId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid return id.' },
        { status: 400 }
      );
    }

    const docSnap = await guard.db.collection('returns').doc(returnId).get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Return not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        returnRequest: {
          id: docSnap.id,
          ...docSnap.data(),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    console.error('[AdminReturnItemAPI] Error loading return');
    return NextResponse.json(
      { success: false, error: 'Request failed.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ returnId: string }> }
) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_return_item',
      limit: 120,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    const { returnId } = await context.params;

    if (!returnId || typeof returnId !== 'string' || !RETURN_ID_PATTERN.test(returnId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid return id.' },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 }
      );
    }

    const { action } = body;
    if (action !== 'setStatus' && action !== 'resolveShipping') {
      return NextResponse.json(
        { success: false, error: 'Invalid request.' },
        { status: 400 }
      );
    }

    let newStatus: string | undefined;
    let adminNotes: string | undefined;
    let shippingDecision: 'waived' | 'applied' | undefined;

    if (action === 'setStatus') {
      if (!body.status || !isReturnStatus(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid request.' },
          { status: 400 }
        );
      }
      newStatus = body.status;
      if (body.adminNotes !== undefined) {
        if (typeof body.adminNotes !== 'string' || body.adminNotes.trim().length > 2000) {
          return NextResponse.json(
            { success: false, error: 'Invalid request.' },
            { status: 400 }
          );
        }
        adminNotes = body.adminNotes.trim();
      }
    } else {
      if (body.decision !== 'waived' && body.decision !== 'applied') {
        return NextResponse.json(
          { success: false, error: 'Invalid request.' },
          { status: 400 }
        );
      }
      shippingDecision = body.decision;
    }

    const db = guard.db;
    const adminEmail = guard.email;
    const returnRef = db.collection('returns').doc(returnId);

    let updatedReturnData: any = null;
    let auditLogPayload: any = null;

    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(returnRef);
      if (!docSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const currentData = docSnap.data() || {};
      const currentStatus = currentData.status;

      if (currentStatus === 'Completed') {
        throw new Error('COMPLETED_LOCKED');
      }

      if (action === 'resolveShipping' && currentStatus === 'Rejected') {
        throw new Error('REJECTED_LOCKED');
      }

      let updateFields: any = {};

      if (action === 'setStatus') {
        const computedRefund = computeRefundForStatus(currentData, newStatus!);
        updateFields = {
          status: newStatus,
          refundTotal: computedRefund,
        };
        if (adminNotes !== undefined) {
          updateFields.adminNotes = adminNotes;
        }

        auditLogPayload = {
          action: 'returns.setStatus',
          adminEmail,
          returnId,
          orderId: currentData.orderId || '',
          fromStatus: currentStatus || '',
          toStatus: newStatus || '',
        };
      } else {
        const resolution = computeShippingResolution(currentData, shippingDecision!);
        updateFields = {
          shippingReview: resolution.shippingReview,
          shippingDeduction: resolution.shippingDeduction,
          refundTotal: resolution.refundTotal,
          refundSubtotal: resolution.refundSubtotal,
        };

        auditLogPayload = {
          action: 'returns.resolveShipping',
          adminEmail,
          returnId,
          orderId: currentData.orderId || '',
          decision: shippingDecision,
        };
      }

      transaction.update(returnRef, updateFields);

      updatedReturnData = {
        id: docSnap.id,
        ...currentData,
        ...updateFields,
      };
    });

    // Write audit log outside transaction
    if (auditLogPayload) {
      try {
        await db.collection('admin_audit_logs').add({
          ...auditLogPayload,
          at: FieldValue.serverTimestamp(),
        });
      } catch {
        console.error('[AdminReturnItemAPI] Audit log write failed');
      }
    }

    return NextResponse.json(
      {
        success: true,
        returnRequest: updatedReturnData,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Return not found.' },
        { status: 404 }
      );
    }
    if (err?.message === 'COMPLETED_LOCKED') {
      return NextResponse.json(
        { success: false, error: 'Return is completed and locked.' },
        { status: 409 }
      );
    }
    if (err?.message === 'REJECTED_LOCKED') {
      return NextResponse.json(
        { success: false, error: 'Return is rejected and locked.' },
        { status: 409 }
      );
    }

    console.error('[AdminReturnItemAPI] Error updating return');
    return NextResponse.json(
      { success: false, error: 'Request failed.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ returnId: string }> }
) {
  try {
    const guard = await guardAdminRequest(req, {
      rateKeyPrefix: 'admin_return_item',
      limit: 120,
      windowMs: 60000,
    });
    if (!guard.ok) {
      return guard.response;
    }

    const { returnId } = await context.params;

    if (!returnId || typeof returnId !== 'string' || !RETURN_ID_PATTERN.test(returnId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid return id.' },
        { status: 400 }
      );
    }

    const db = guard.db;
    const adminEmail = guard.email;
    const returnRef = db.collection('returns').doc(returnId);

    let orderIdVal = '';
    let statusVal = '';

    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(returnRef);
      if (!docSnap.exists) {
        throw new Error('NOT_FOUND');
      }
      const data = docSnap.data() || {};
      orderIdVal = data.orderId || '';
      statusVal = data.status || '';

      transaction.delete(returnRef);
    });

    try {
      await db.collection('admin_audit_logs').add({
        action: 'returns.delete',
        adminEmail,
        returnId,
        orderId: orderIdVal,
        status: statusVal,
        at: FieldValue.serverTimestamp(),
      });
    } catch {
      console.error('[AdminReturnItemAPI] Audit log write failed');
    }

    return NextResponse.json(
      {
        success: true,
        id: returnId,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Return not found.' },
        { status: 404 }
      );
    }

    console.error('[AdminReturnItemAPI] Error deleting return');
    return NextResponse.json(
      { success: false, error: 'Request failed.' },
      { status: 500 }
    );
  }
}

// ============================================
// Leave Approval API
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/leave/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeNumber: true,
            department: { select: { name: true } },
          },
        },
        leaveType: true,
        approver: {
          select: { fullName: true },
        },
      },
    });

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(leave);
  } catch (error) {
    console.error('Error fetching leave request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave request' },
      { status: 500 }
    );
  }
}

// PUT /api/leave/[id] - Approve or reject leave
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, approvedBy, rejectedReason } = body;

    if (!action || !approvedBy) {
      return NextResponse.json(
        { error: 'Action and approver ID are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Leave request has already been processed' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const year = existing.startDate.getFullYear();

    const result = await prisma.$transaction(async (tx) => {
      // Update leave request
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: newStatus,
          approvedBy,
          approvedAt: new Date(),
          rejectedReason: action === 'reject' ? rejectedReason : undefined,
        },
      });

      // Update leave balance
      if (action === 'approve') {
        await tx.leaveBalance.update({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: existing.employeeId,
              leaveTypeId: existing.leaveTypeId,
              year,
            },
          },
          data: {
            usedDays: { increment: existing.totalDays },
            pendingDays: { decrement: existing.totalDays },
          },
        });
      } else {
        // Return pending days if rejected
        await tx.leaveBalance.update({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: existing.employeeId,
              leaveTypeId: existing.leaveTypeId,
              year,
            },
          },
          data: {
            pendingDays: { decrement: existing.totalDays },
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      message: `Leave request ${action}d successfully`,
      data: result,
    });
  } catch (error) {
    console.error('Error processing leave request:', error);
    return NextResponse.json(
      { error: 'Failed to process leave request' },
      { status: 500 }
    );
  }
}

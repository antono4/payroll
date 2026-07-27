// ============================================
// Leave Management API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/leave
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const year = searchParams.get('year');

    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (type) where.leaveTypeId = type;
    if (status) where.status = status;
    if (year) {
      where.startDate = {
        gte: new Date(parseInt(year), 0, 1),
        lte: new Date(parseInt(year), 11, 31),
      };
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
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
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

// POST /api/leave
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, leaveTypeId, startDate, endDate, reason } = body;

    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Employee ID, leave type, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const year = start.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year,
        },
      },
    });

    if (balance && balance.remainingDays < totalDays) {
      return NextResponse.json(
        { error: `Insufficient leave balance. Available: ${balance.remainingDays} days` },
        { status: 400 }
      );
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        status: 'pending',
      },
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
        leaveType: true,
      },
    });

    // Update pending days in balance
    if (balance) {
      await prisma.leaveBalance.update({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId,
            leaveTypeId,
            year,
          },
        },
        data: {
          pendingDays: { increment: totalDays },
        },
      });
    }

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}

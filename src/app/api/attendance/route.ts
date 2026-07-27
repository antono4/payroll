// ============================================
// Attendance API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ATTENDANCE_STATUS } from '@/lib/constants';

// GET /api/attendance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              fullName: true,
              employeeNumber: true,
              department: { select: { name: true } },
            },
          },
        },
        orderBy: [{ date: 'desc' }, { employee: { fullName: 'asc' } }],
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return NextResponse.json({
      data: attendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, clockIn, clockOut, status, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json(
        { error: 'Employee ID and date are required' },
        { status: 400 }
      );
    }

    // Check for existing attendance
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Attendance already exists for this date' },
        { status: 400 }
      );
    }

    // Calculate work hours and late minutes
    let workHour = 0;
    let lateMinutes = 0;
    let earlyOutMinutes = 0;

    if (clockIn && clockOut) {
      const start = new Date(clockIn);
      const end = new Date(clockOut);
      const diffMs = end.getTime() - start.getTime();
      workHour = diffMs / (1000 * 60 * 60);

      // Assume standard work start is 9:00 AM
      const standardStart = new Date(start);
      standardStart.setHours(9, 0, 0, 0);
      
      if (start > standardStart) {
        lateMinutes = Math.round((start.getTime() - standardStart.getTime()) / (1000 * 60));
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        clockIn: clockIn ? new Date(clockIn) : null,
        clockOut: clockOut ? new Date(clockOut) : null,
        workHour,
        status: status || ATTENDANCE_STATUS.PRESENT,
        lateMinutes,
        earlyOutMinutes,
        notes,
      },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeNumber: true,
          },
        },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance' },
      { status: 500 }
    );
  }
}

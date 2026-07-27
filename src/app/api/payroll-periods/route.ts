// ============================================
// Payroll Periods API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PAYROLL_STATUS } from '@/lib/constants';

// GET /api/payroll-periods - List payroll periods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    const where: any = {};
    if (year) where.year = parseInt(year);
    if (status) where.status = status;

    const periods = await prisma.payrollPeriod.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        _count: {
          select: { headers: true },
        },
      },
    });

    return NextResponse.json(periods);
  } catch (error) {
    console.error('Error fetching payroll periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll periods' },
      { status: 500 }
    );
  }
}

// POST /api/payroll-periods - Create new payroll period
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { year, month, createdBy } = body;

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    // Check if period already exists
    const existing = await prisma.payrollPeriod.findUnique({
      where: {
        year_month: { year, month },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Payroll period already exists' },
        { status: 400 }
      );
    }

    // Calculate period dates
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0); // Last day of month

    // Generate period name
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const periodName = `${monthNames[month - 1]} ${year}`;

    const period = await prisma.payrollPeriod.create({
      data: {
        name: periodName,
        periodStart,
        periodEnd,
        year,
        month,
        status: PAYROLL_STATUS.DRAFT,
        createdBy,
      },
    });

    return NextResponse.json(period, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll period:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll period' },
      { status: 500 }
    );
  }
}

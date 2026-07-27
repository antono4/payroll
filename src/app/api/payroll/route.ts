// ============================================
// Payroll Processing API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { processPayroll, approvePayroll, markPayrollAsPaid, getPayrollSummary } from '@/services/payroll.service';

// POST /api/payroll - Process payroll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodId, employeeIds } = body;

    if (!periodId) {
      return NextResponse.json(
        { error: 'Period ID is required' },
        { status: 400 }
      );
    }

    const result = await processPayroll({
      periodId,
      employeeIds,
    });

    return NextResponse.json({
      message: 'Payroll processed successfully',
      summary: result,
    });
  } catch (error: any) {
    console.error('Error processing payroll:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payroll' },
      { status: 500 }
    );
  }
}

// GET /api/payroll - Get payroll summaries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('periodId');

    if (!periodId) {
      return NextResponse.json(
        { error: 'Period ID is required' },
        { status: 400 }
      );
    }

    const summary = await getPayrollSummary(periodId);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payroll' },
      { status: 500 }
    );
  }
}

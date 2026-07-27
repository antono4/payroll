// ============================================
// Payslips API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePayslipHTML } from '@/lib/pdf/payslip';

// GET /api/payslips - List payslips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const periodId = searchParams.get('periodId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (periodId) where.payrollPeriodId = periodId;

    const skip = (page - 1) * limit;

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
        include: {
          employee: {
            select: {
              fullName: true,
              employeeNumber: true,
              department: { select: { name: true } },
            },
          },
          payrollHeader: {
            include: {
              payrollPeriod: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payslip.count({ where }),
    ]);

    return NextResponse.json({
      data: payslips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payslips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payslips' },
      { status: 500 }
    );
  }
}

// POST /api/payslips - Generate payslip HTML
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payrollHeaderId } = body;

    if (!payrollHeaderId) {
      return NextResponse.json(
        { error: 'Payroll header ID is required' },
        { status: 400 }
      );
    }

    // Get payroll data
    const header = await prisma.payrollHeader.findUnique({
      where: { id: payrollHeaderId },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
        details: {
          include: {
            component: true,
          },
        },
        payrollPeriod: true,
        overtimePays: true,
      },
    });

    if (!header) {
      return NextResponse.json(
        { error: 'Payroll header not found' },
        { status: 404 }
      );
    }

    // Get company info
    const company = await prisma.company.findFirst();

    // Separate earnings and deductions
    const earnings = header.details
      .filter(d => d.componentType === 'earning')
      .map(d => ({
        name: d.description || d.component.name,
        amount: d.totalAmount,
      }));

    const deductions = header.details
      .filter(d => d.componentType === 'deduction')
      .map(d => ({
        name: d.description || d.component.name,
        amount: Math.abs(d.totalAmount),
      }));

    // Format data
    const payslipData = {
      companyName: company?.name || 'PT Perusahaan',
      companyAddress: company?.address || '',
      companyPhone: company?.phone || '',
      companyEmail: company?.email || '',
      employeeName: header.employee.fullName,
      employeeNumber: header.employee.employeeNumber,
      department: header.employee.department?.name || '-',
      position: header.employee.position?.title || '-',
      joinDate: new Date(header.employee.joinDate).toLocaleDateString('id-ID'),
      npwp: header.employee.npwp || '-',
      bpjsNumber: header.employee.bpjsKesehatanNumber || header.employee.bpjsKetenagakerjaNumber || '-',
      periodName: header.payrollPeriod.name,
      periodMonth: header.payrollPeriod.month,
      periodYear: header.payrollPeriod.year,
      paymentDate: header.paidDate 
        ? new Date(header.paidDate).toLocaleDateString('id-ID')
        : '-',
      earnings,
      totalEarnings: header.totalEarnings,
      deductions,
      totalDeductions: header.totalDeductions,
      taxAmount: header.totalTax,
      netSalary: header.netSalary,
      bankName: header.employee.bankName || '-',
      bankAccount: header.employee.bankAccount || '-',
    };

    // Generate HTML
    const html = generatePayslipHTML(payslipData);

    return NextResponse.json({
      html,
      data: payslipData,
    });
  } catch (error) {
    console.error('Error generating payslip:', error);
    return NextResponse.json(
      { error: 'Failed to generate payslip' },
      { status: 500 }
    );
  }
}

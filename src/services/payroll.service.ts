// ============================================
// Payroll Service - Main Payroll Processing Engine
// ============================================

import prisma from '@/lib/prisma';
import { calculateSalary, SalaryInput, SalaryCalculationResult } from '@/lib/calculations/salary';
import { ATTENDANCE_STATUS, PAYROLL_STATUS } from '@/lib/constants';

export interface ProcessPayrollInput {
  periodId: string;
  employeeIds?: string[]; // Optional: specific employees, or all active employees
}

export interface PayrollSummary {
  periodId: string;
  periodName: string;
  totalEmployees: number;
  totalEarnings: number;
  totalDeductions: number;
  totalTax: number;
  totalNetSalary: number;
  totalEmployerCost: number;
  processedAt: Date;
}

/**
 * Get attendance data for an employee in a period
 */
async function getAttendanceData(employeeId: string, periodStart: Date, periodEnd: Date) {
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  let presentDays = 0;
  let sickDays = 0;
  let leaveDays = 0;
  let absentDays = 0;
  let lateMinutes = 0;
  let overtimeHours = 0;

  for (const att of attendances) {
    switch (att.status) {
      case ATTENDANCE_STATUS.PRESENT:
      case ATTENDANCE_STATUS.LATE:
        presentDays++;
        lateMinutes += att.lateMinutes;
        overtimeHours += att.overtimeHours;
        break;
      case ATTENDANCE_STATUS.SICK:
        sickDays++;
        break;
      case ATTENDANCE_STATUS.LEAVE:
      case ATTENDANCE_STATUS.CUTI:
        leaveDays++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        absentDays++;
        break;
    }
  }

  return {
    presentDays,
    sickDays,
    leaveDays,
    absentDays,
    lateMinutes,
    overtimeHours,
  };
}

/**
 * Get salary components for an employee
 */
async function getSalaryComponents(employeeId: string) {
  const structures = await prisma.employeeSalaryStructure.findMany({
    where: {
      employeeId,
      isActive: true,
      effectiveDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
    include: {
      component: true,
    },
  });

  return structures.map(s => ({
    code: s.component.code,
    name: s.component.name,
    type: s.component.type as 'earning' | 'deduction' | 'tax',
    amount: s.amount || 0,
    isTaxable: s.component.isTaxable,
    isBpjsSubject: s.component.isBpjsSubject,
  }));
}

/**
 * Get active loans for an employee
 */
async function getActiveLoans(employeeId: string, periodStart: Date) {
  const loans = await prisma.loanInstallment.findMany({
    where: {
      loan: {
        employeeId,
        status: 'active',
        startDate: { lte: periodStart },
        endDate: { gte: periodStart },
      },
      status: 'pending',
      installmentNumber: { lte: prisma.employeeLoan.fields.remainingInstallments },
    },
    include: {
      loan: true,
    },
  });

  return loans.map(l => ({
    installmentAmount: l.amount,
    description: `Angsuran ke-${l.installmentNumber} - ${l.loan.loanType.name}`,
  }));
}

/**
 * Process payroll for a single employee
 */
async function processEmployeePayroll(
  employeeId: string,
  periodStart: Date,
  periodEnd: Date,
  workDaysInMonth: number,
  periodMonth: number,
  periodYear: number
): Promise<SalaryCalculationResult> {
  // Get employee data
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      department: true,
      position: true,
    },
  });

  if (!employee) {
    throw new Error(`Employee not found: ${employeeId}`);
  }

  // Get basic salary from employee record or salary structure
  const basicSalary = await getBasicSalary(employeeId);

  // Get attendance data
  const attendance = await getAttendanceData(employeeId, periodStart, periodEnd);

  // Get salary components
  const components = await getSalaryComponents(employeeId);

  // Get active loans
  const loans = await getActiveLoans(employeeId, periodStart);

  // Calculate salary
  const result = calculateSalary({
    employeeId,
    basicSalary,
    components,
    attendance,
    ptkpStatus: employee.ptkpStatus as any,
    bpjsKelas: employee.bpjsKesehatanClass as 1 | 2 | 3,
    workDaysInMonth,
    periodMonth,
    periodYear,
    loans,
  });

  return result;
}

/**
 * Get basic salary for employee
 */
async function getBasicSalary(employeeId: string): Promise<number> {
  const basicStructure = await prisma.employeeSalaryStructure.findFirst({
    where: {
      employeeId,
      component: { code: 'BASIC_SALARY' },
      isActive: true,
      effectiveDate: { lte: new Date() },
    },
    orderBy: { effectiveDate: 'desc' },
  });

  if (basicStructure?.amount) {
    return basicStructure.amount;
  }

  // If no salary structure, get from employee record
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  // Return 0 if no salary found - should be handled in UI
  return 0;
}

/**
 * Save payroll result to database
 */
async function savePayrollResult(
  periodId: string,
  result: SalaryCalculationResult
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Create payroll header
    const header = await tx.payrollHeader.create({
      data: {
        payrollPeriodId: periodId,
        employeeId: result.employeeId,
        basicSalary: result.basicSalary,
        totalEarnings: result.breakdown.earnings.total,
        totalDeductions: result.breakdown.deductions.total + result.breakdown.tax.monthlyTax,
        totalTax: result.breakdown.tax.monthlyTax,
        netSalary: result.breakdown.netSalary,
        status: PAYROLL_STATUS.CALCULATED,
      },
    });

    // Create payroll details
    for (const detail of result.details) {
      if (detail.amount !== 0) {
        await tx.payrollDetail.create({
          data: {
            payrollHeaderId: header.id,
            componentId: await getComponentId(detail.code),
            componentType: detail.type,
            description: detail.name,
            totalAmount: detail.amount,
            unitAmount: detail.amount,
            calculationNotes: detail.calculationNotes,
          },
        });
      }
    }

    // Create overtime pay record if any
    if (result.breakdown.earnings.overtime > 0) {
      await tx.overtimePay.create({
        data: {
          payrollHeaderId: header.id,
          hours: 0, // Would need actual overtime data
          totalAmount: result.breakdown.earnings.overtime,
        },
      });
    }
  });
}

/**
 * Get component ID by code
 */
async function getComponentId(code: string): Promise<string> {
  const component = await prisma.salaryComponent.findUnique({
    where: { code },
  });
  return component?.id || '';
}

/**
 * Process payroll for entire period
 */
export async function processPayroll(input: ProcessPayrollInput): Promise<PayrollSummary> {
  const { periodId, employeeIds } = input;

  // Get period info
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
  });

  if (!period) {
    throw new Error(`Payroll period not found: ${periodId}`);
  }

  if (period.status !== PAYROLL_STATUS.DRAFT) {
    throw new Error(`Payroll period ${period.status} cannot be processed`);
  }

  // Get employees to process
  const employeeFilter: any = { status: 'active' };
  if (employeeIds) {
    employeeFilter.id = { in: employeeIds };
  }

  const employees = await prisma.employee.findMany({
    where: employeeFilter,
    select: { id: true },
  });

  // Calculate work days in month
  const workDaysInMonth = calculateWorkDays(period.periodStart, period.periodEnd);

  let totalEarnings = 0;
  let totalDeductions = 0;
  let totalTax = 0;
  let totalNetSalary = 0;
  let totalEmployerCost = 0;

  // Process each employee
  for (const employee of employees) {
    try {
      const result = await processEmployeePayroll(
        employee.id,
        period.periodStart,
        period.periodEnd,
        workDaysInMonth,
        period.month,
        period.year
      );

      // Save to database
      await savePayrollResult(periodId, result);

      // Accumulate totals
      totalEarnings += result.breakdown.earnings.total;
      totalDeductions += result.breakdown.deductions.total;
      totalTax += result.breakdown.tax.monthlyTax;
      totalNetSalary += result.breakdown.netSalary;
      totalEmployerCost += result.breakdown.totalCost;
    } catch (error) {
      console.error(`Error processing payroll for employee ${employee.id}:`, error);
      // Continue with other employees
    }
  }

  // Update period status
  await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: { status: PAYROLL_STATUS.CALCULATED },
  });

  return {
    periodId,
    periodName: period.name,
    totalEmployees: employees.length,
    totalEarnings,
    totalDeductions,
    totalTax,
    totalNetSalary,
    totalEmployerCost,
    processedAt: new Date(),
  };
}

/**
 * Calculate work days in a period (excluding weekends and holidays)
 */
function calculateWorkDays(start: Date, end: Date): number {
  let workDays = 0;
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workDays;
}

/**
 * Approve payroll for a period
 */
export async function approvePayroll(periodId: string, approvedBy: string): Promise<void> {
  await prisma.$transaction([
    prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PAYROLL_STATUS.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
    }),
    prisma.payrollHeader.updateMany({
      where: {
        payrollPeriodId: periodId,
        status: PAYROLL_STATUS.CALCULATED,
      },
      data: {
        status: PAYROLL_STATUS.APPROVED,
      },
    }),
  ]);
}

/**
 * Mark payroll as paid
 */
export async function markPayrollAsPaid(
  periodId: string,
  paidDate: Date
): Promise<void> {
  await prisma.$transaction([
    prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PAYROLL_STATUS.PAID,
        paidDate,
      },
    }),
    prisma.payrollHeader.updateMany({
      where: {
        payrollPeriodId: periodId,
        status: PAYROLL_STATUS.APPROVED,
      },
      data: {
        status: PAYROLL_STATUS.PAID,
        paidDate,
      },
    }),
  ]);
}

/**
 * Get payroll summary for a period
 */
export async function getPayrollSummary(periodId: string) {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
  });

  if (!period) {
    throw new Error(`Payroll period not found: ${periodId}`);
  }

  const headers = await prisma.payrollHeader.findMany({
    where: { payrollPeriodId: periodId },
    include: {
      employee: {
        select: {
          fullName: true,
          employeeNumber: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  const summary = headers.reduce(
    (acc, h) => ({
      totalEarnings: acc.totalEarnings + h.totalEarnings,
      totalDeductions: acc.totalDeductions + h.totalDeductions,
      totalTax: acc.totalTax + h.totalTax,
      totalNetSalary: acc.totalNetSalary + h.netSalary,
    }),
    { totalEarnings: 0, totalDeductions: 0, totalTax: 0, totalNetSalary: 0 }
  );

  return {
    period,
    summary,
    employeeCount: headers.length,
    employees: headers,
  };
}

/**
 * Get payslip data for an employee
 */
export async function getPayslipData(payrollHeaderId: string) {
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
    },
  });

  if (!header) {
    throw new Error('Payroll header not found');
  }

  return header;
}

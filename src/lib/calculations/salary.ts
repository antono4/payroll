// ============================================
// Salary Calculator - Main Payroll Engine
// ============================================

import { ATTENDANCE_SETTINGS } from '../constants';
import { calculatePPh21, PPh21Input } from './pph21';
import { calculateBPJS, calculateEmployeeBPJS } from './bpjs';
import { calculateOvertime, calculateDailyRate } from './overtime';

export interface SalaryComponentInput {
  code: string;
  name: string;
  type: 'earning' | 'deduction' | 'tax';
  amount: number;
  isTaxable?: boolean;
  isBpjsSubject?: boolean;
}

export interface AttendanceData {
  presentDays: number;
  sickDays: number;
  leaveDays: number;
  absentDays: number;
  lateMinutes: number;
  overtimeHours: number;
}

export interface LoanData {
  installmentAmount: number;
  description?: string;
}

export interface SalaryInput {
  employeeId: string;
  basicSalary: number;
  components: SalaryComponentInput[];
  attendance: AttendanceData;
  overtime?: {
    hours: number;
    dayType: 'weekday' | 'saturday' | 'sunday' | 'holiday';
    isHolidayWorked?: boolean;
  };
  loans?: LoanData[];
  ptkpStatus: keyof typeof import('../constants').PTKP_RATES_2024;
  bpjsKelas: 1 | 2 | 3;
  workDaysInMonth: number;
  periodMonth: number;
  periodYear: number;
}

export interface SalaryBreakdown {
  earnings: {
    basicSalary: number;
    allowances: number;
    overtime: number;
    bonus: number;
    thr: number;
    other: number;
    total: number;
  };
  deductions: {
    absence: number;
    latePenalty: number;
    bpjsKesehatan: number;
    bpjsJht: number;
    bpjsJp: number;
    loan: number;
    other: number;
    total: number;
  };
  tax: {
    grossIncome: number;
    ptkp: number;
    pkp: number;
    monthlyTax: number;
  };
  netSalary: number;
  employerCost: {
    bpjsKesehatan: number;
    bpjsJht: number;
    bpjsJp: number;
    bpjsJkk: number;
    bpjsJkm: number;
    total: number;
  };
  totalCost: number;
}

export interface SalaryCalculationResult {
  employeeId: string;
  periodMonth: number;
  periodYear: number;
  basicSalary: number;
  breakdown: SalaryBreakdown;
  details: Array<{
    code: string;
    name: string;
    type: string;
    amount: number;
    calculationNotes?: string;
  }>;
  calculationDate: Date;
}

/**
 * Calculate complete salary for an employee
 */
export function calculateSalary(input: SalaryInput): SalaryCalculationResult {
  const {
    employeeId,
    basicSalary,
    components,
    attendance,
    overtime,
    loans = [],
    ptkpStatus,
    workDaysInMonth,
    periodMonth,
    periodYear,
  } = input;

  // ============================================
  // 1. CALCULATE EARNINGS
  // ============================================
  
  // Basic salary
  let totalEarnings = basicSalary;
  
  // Calculate allowances from components
  let allowances = 0;
  let overtimePay = 0;
  let bonus = 0;
  let thr = 0;
  let otherEarnings = 0;

  for (const comp of components.filter(c => c.type === 'earning')) {
    switch (comp.code) {
      case 'BASIC_SALARY':
        // Already accounted
        break;
      case 'OVERTIME_PAY':
        // Calculate separately
        break;
      case 'BONUS':
        bonus += comp.amount;
        break;
      case 'THR':
        thr += comp.amount;
        break;
      default:
        allowances += comp.amount;
    }
  }
  
  // Calculate overtime pay
  if (overtime && overtime.hours > 0) {
    const otResult = calculateOvertime({
      basicSalary,
      allowances,
      overtimeHours: overtime.hours,
      dayType: overtime.dayType,
      isHolidayWorked: overtime.isHolidayWorked,
    });
    overtimePay = otResult.totalOvertimePay;
  }

  totalEarnings = basicSalary + allowances + overtimePay + bonus + thr;

  // ============================================
  // 2. CALCULATE DEDUCTIONS
  // ============================================

  // Absence deduction
  const dailyRate = calculateDailyRate(basicSalary);
  const absenceDeduction = attendance.absentDays * dailyRate;

  // Late penalty (capped)
  const effectiveLateMinutes = Math.min(attendance.lateMinutes, ATTENDANCE_SETTINGS.maxLateMinutesPenalty);
  const latePenalty = (effectiveLateMinutes / 60) * dailyRate;

  // Calculate BPJS deductions
  const bpjsDeductions = calculateEmployeeBPJS({
    monthlySalary: basicSalary,
    riskClass: 3, // Default risk class
  });

  // Loan installments
  const loanDeduction = loans.reduce((sum, loan) => sum + loan.installmentAmount, 0);

  let otherDeductions = 0;
  for (const comp of components.filter(c => c.type === 'deduction' && 
    !c.code.includes('BPJS') && !c.code.includes('LOAN') && !c.code.includes('ABSENCE'))) {
    otherDeductions += comp.amount;
  }

  const totalDeductions = absenceDeduction + latePenalty + bpjsDeductions.total + 
    loanDeduction + otherDeductions;

  // ============================================
  // 3. CALCULATE TAX (PPh 21)
  // ============================================

  // Gross income includes all earnings
  const grossIncome = totalEarnings;
  
  // For PPh 21 calculation, we need to include only taxable income
  const taxableAllowances = components
    .filter(c => c.type === 'earning' && c.isTaxable !== false)
    .reduce((sum, c) => sum + c.amount, 0);

  const ptkpInput: PPh21Input = {
    grossIncome: basicSalary + taxableAllowances + overtimePay,
    ptkpStatus,
  };

  const taxResult = calculatePPh21(ptkpInput);

  // ============================================
  // 4. CALCULATE EMPLOYER COSTS
  // ============================================

  const bpjsFull = calculateBPJS({
    monthlySalary: basicSalary,
    riskClass: 3,
  });

  const employerCost = {
    bpjsKesehatan: bpjsFull.kesehatan.employerShare,
    bpjsJht: bpjsFull.ketenagakerjaan.jht.employerShare,
    bpjsJp: bpjsFull.ketenagakerjaan.jp.employerShare,
    bpjsJkk: bpjsFull.ketenagakerjaan.jkk.employerShare,
    bpjsJkm: bpjsFull.ketenagakerjaan.jkm.employerShare,
    total: bpjsFull.kesehatan.employerShare + bpjsFull.ketenagakerjaan.totalEmployer,
  };

  // ============================================
  // 5. CALCULATE NET SALARY
  // ============================================

  const netSalary = totalEarnings - totalDeductions - taxResult.monthlyTax;

  // ============================================
  // 6. BUILD BREAKDOWN
  // ============================================

  const breakdown: SalaryBreakdown = {
    earnings: {
      basicSalary,
      allowances,
      overtime: overtimePay,
      bonus,
      thr,
      other: otherEarnings,
      total: totalEarnings,
    },
    deductions: {
      absence: absenceDeduction,
      latePenalty,
      bpjsKesehatan: bpjsDeductions.kesehatan,
      bpjsJht: bpjsDeductions.jht,
      bpjsJp: bpjsDeductions.jp,
      loan: loanDeduction,
      other: otherDeductions,
      total: totalDeductions,
    },
    tax: {
      grossIncome: taxResult.grossIncome,
      ptkp: taxResult.ptkpValue,
      pkp: taxResult.pkp,
      monthlyTax: taxResult.monthlyTax,
    },
    netSalary,
    employerCost,
    totalCost: netSalary + employerCost.total,
  };

  // ============================================
  // 7. BUILD DETAILS FOR PAYROLL RECORD
  // ============================================

  const details: SalaryCalculationResult['details'] = [
    { code: 'BASIC', name: 'Gaji Pokok', type: 'earning', amount: basicSalary },
    { code: 'ALW_TRANS', name: 'Tunjangan Transportasi', type: 'earning', amount: 0 },
    { code: 'ALW_MEAL', name: 'Tunjangan Makan', type: 'earning', amount: 0 },
    { code: 'OT', name: 'Uang Lembur', type: 'earning', amount: overtimePay },
    { code: 'BPJS_KS', name: 'BPJS Kesehatan', type: 'deduction', amount: bpjsDeductions.kesehatan },
    { code: 'BPJS_JP', name: 'BPJS JP', type: 'deduction', amount: bpjsDeductions.jp },
    { code: 'BPJS_JHT', name: 'BPJS JHT', type: 'deduction', amount: bpjsDeductions.jht },
    { code: 'LOAN', name: 'Angsuran Pinjaman', type: 'deduction', amount: loanDeduction },
    { code: 'PPH21', name: 'PPh 21', type: 'tax', amount: taxResult.monthlyTax },
  ];

  return {
    employeeId,
    periodMonth,
    periodYear,
    basicSalary,
    breakdown,
    details,
    calculationDate: new Date(),
  };
}

/**
 * Calculate prorated salary for mid-month join/resign
 */
export function calculateProratedSalary(
  basicSalary: number,
  workingDays: number,
  actualDays: number
): number {
  const dailyRate = basicSalary / workingDays;
  return Math.round(dailyRate * actualDays);
}

/**
 * Format salary breakdown for display
 */
export function formatSalaryBreakdown(result: SalaryCalculationResult): string {
  const { breakdown } = result;
  
  return `
GAMBARAN GAJI BULANAN
=====================
GAJI & PENGHASILAN
├─ Gaji Pokok: Rp ${breakdown.earnings.basicSalary.toLocaleString('id-ID')}
├─ Tunjangan: Rp ${breakdown.earnings.allowances.toLocaleString('id-ID')}
├─ Lembur: Rp ${breakdown.earnings.overtime.toLocaleString('id-ID')}
├─ Bonus: Rp ${breakdown.earnings.bonus.toLocaleString('id-ID')}
└─ Total Penghasilan: Rp ${breakdown.earnings.total.toLocaleString('id-ID')}

POTONGAN
├─ Absensi: Rp ${breakdown.deductions.absence.toLocaleString('id-ID')}
├─ Keterlambatan: Rp ${breakdown.deductions.latePenalty.toLocaleString('id-ID')}
├─ BPJS Kesehatan: Rp ${breakdown.deductions.bpjsKesehatan.toLocaleString('id-ID')}
├─ BPJS JP: Rp ${breakdown.deductions.bpjsJp.toLocaleString('id-ID')}
├─ Pinjaman: Rp ${breakdown.deductions.loan.toLocaleString('id-ID')}
└─ Total Potongan: Rp ${breakdown.deductions.total.toLocaleString('id-ID')}

PAJAK
├─ PPh 21 Bulanan: Rp ${breakdown.tax.monthlyTax.toLocaleString('id-ID')}
└─ PKP: Rp ${breakdown.tax.pkp.toLocaleString('id-ID')}

GAJI BERSIH (TAKE HOME PAY): Rp ${breakdown.netSalary.toLocaleString('id-ID')}

BIAYA PERUSAHAAN
├─ BPJS Kesehatan: Rp ${breakdown.employerCost.bpjsKesehatan.toLocaleString('id-ID')}
├─ BPJS JHT: Rp ${breakdown.employerCost.bpjsJht.toLocaleString('id-ID')}
├─ BPJS JP: Rp ${breakdown.employerCost.bpjsJp.toLocaleString('id-ID')}
└─ Total Biaya: Rp ${breakdown.totalCost.toLocaleString('id-ID')}
  `.trim();
}

// ============================================
// PPH 21 (Income Tax) Calculator - Indonesia
// Based on PMK No. 1 Tahun 2024
// ============================================

import { PTKP_RATES_2024, PTKP_PER_DEPENDENT, PPH21_BRACKETS_2024 } from '../constants';

export interface PPh21Input {
  grossIncome: number;
  ptkpStatus: keyof typeof PTKP_RATES_2024;
  totalDeductions?: number;
  isResign?: boolean;
  monthOfResign?: number;
}

export interface PPh21Result {
  grossIncome: number;
  totalDeduction: number;
  netIncome: number;
  ptkpValue: number;
  pkp: number;           // Penghasilan Kena Pajak
  annualTax: number;     // Tahunan
  monthlyTax: number;    // Bulanan
  details: {
    biayaJabatan: number;
    iuranPensiun: number;
    iuranTHT: number;
  };
}

/**
 * Calculate PPh 21 (Income Tax) for employee
 */
export function calculatePPh21(input: PPh21Input): PPh21Result {
  const { grossIncome, ptkpStatus, totalDeductions = 0 } = input;

  // 1. Calculate Biaya Jabatan (Job Position Expense)
  // Max 6jt per year or 500rb per month
  const biayaJabatanTahunan = Math.min(grossIncome * 0.05, 6000000);
  const biayaJabatanBulanan = biayaJabatanTahunan / 12;

  // 2. Calculate total deductions
  // Biaya Jabatan + Iuran Pensiun/THT + PTKP
  const iuranPensiun = 0; // Will be calculated separately if applicable
  const iuranTHT = 0;     // Will be calculated separately if applicable

  const totalPengurangan = biayaJabatanTahunan + totalDeductions + iuranPensiun + iuranTHT;

  // 3. Calculate Net Income (Penghasilan Neto)
  const netIncome = grossIncome - totalPengurangan;

  // 4. Get PTKP value
  const ptkpValue = PTKP_RATES_2024[ptkpStatus] || PTKP_RATES_2024.TK0;

  // 5. Calculate PKP (Penghasilan Kena Pajak)
  const pkp = Math.max(0, netIncome - ptkpValue);

  // 6. Calculate Annual Tax using progressive rates
  const annualTax = calculateProgressiveTax(pkp);

  // 7. Calculate Monthly Tax
  const monthlyTax = Math.round(annualTax / 12);

  return {
    grossIncome,
    totalDeduction: totalPengurangan,
    netIncome,
    ptkpValue,
    pkp,
    annualTax,
    monthlyTax,
    details: {
      biayaJabatan: biayaJabatanTahunan,
      iuranPensiun,
      iuranTHT,
    },
  };
}

/**
 * Calculate progressive tax based on PKP
 */
function calculateProgressiveTax(pkp: number): number {
  if (pkp <= 0) return 0;

  let tax = 0;
  const brackets = PPH21_BRACKETS_2024;

  for (const bracket of brackets) {
    if (pkp > bracket.min) {
      const taxableInBracket = Math.min(pkp, bracket.max) - bracket.min;
      if (taxableInBracket > 0) {
        tax = bracket.deduction + taxableInBracket * bracket.rate;
      }
    }
  }

  return Math.round(tax);
}

/**
 * Calculate prorated PPh 21 for employees who resign mid-year
 */
export function calculateProratedPPh21(
  input: PPh21Input,
  monthsWorked: number
): PPh21Result {
  const fullYear = calculatePPh21(input);
  
  const proratedTax = Math.round((fullYear.annualTax / 12) * monthsWorked);
  
  return {
    ...fullYear,
    annualTax: proratedTax,
    monthlyTax: proratedTax,
  };
}

/**
 * Calculate PPh 21 with Nettification (Gross Up)
 * Used when employer wants to give nett salary with tax borne by company
 */
export function calculateGrossUpPPh21(
  targetNetSalary: number,
  ptkpStatus: keyof typeof PTKP_RATES_2024
): number {
  // Simplified gross-up calculation
  // This is an iterative approach for accurate gross-up
  
  let grossSalary = targetNetSalary * 1.5; // Initial estimate
  const maxIterations = 100;
  const tolerance = 100; // 100 rupiah tolerance
  
  for (let i = 0; i < maxIterations; i++) {
    const taxResult = calculatePPh21({
      grossIncome: grossSalary,
      ptkpStatus,
    });
    
    const calculatedNet = grossSalary - taxResult.monthlyTax;
    
    if (Math.abs(calculatedNet - targetNetSalary) < tolerance) {
      return grossSalary;
    }
    
    // Adjust gross salary
    grossSalary = grossSalary + (targetNetSalary - calculatedNet);
  }
  
  return grossSalary;
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get tax rate description
 */
export function getTaxRateDescription(pkp: number): string {
  if (pkp <= 60000000) return '5%';
  if (pkp <= 250000000) return '15%';
  if (pkp <= 500000000) return '25%';
  if (pkp <= 5000000000) return '30%';
  return '35%';
}

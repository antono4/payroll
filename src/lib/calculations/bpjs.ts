// ============================================
// BPJS Calculator - Indonesia
// BPJS Kesehatan & BPJS Ketenagakerjaan
// ============================================

import { BPJS_RATES } from '../constants';

export interface BPJSInput {
  monthlySalary: number;
  riskClass?: 1 | 2 | 3 | 4 | 5 | 6; // JKK risk classification
}

export interface BPJSResult {
  kesehatan: {
    employeeShare: number;
    employerShare: number;
    total: number;
  };
  ketenagakerjaan: {
    jht: {
      employeeShare: number;
      employerShare: number;
    };
    jp: {
      employeeShare: number;
      employerShare: number;
    };
    jkk: {
      employerShare: number;
    };
    jkm: {
      employerShare: number;
    };
    totalEmployee: number;
    totalEmployer: number;
    total: number;
  };
  totalDeduction: number;
  totalCost: number;
}

/**
 * Calculate all BPJS contributions
 */
export function calculateBPJS(input: BPJSInput): BPJSResult {
  const { monthlySalary, riskClass = 3 } = input;

  // Cap salary for calculation (max 12jt for kesehatan & JP)
  const cappedSalaryKesehatan = Math.min(monthlySalary, BPJS_RATES.kesehatan.maxSalary);
  const cappedSalaryJP = Math.min(monthlySalary, BPJS_RATES.jp.maxSalary);

  // ============================================
  // BPJS KESEHATAN (Health Insurance)
  // ============================================
  const kesehatanEmployeeShare = cappedSalaryKesehatan * BPJS_RATES.kesehatan.employee;
  const kesehatanEmployerShare = cappedSalaryKesehatan * BPJS_RATES.kesehatan.employer;

  // ============================================
  // BPJS KETENAGAKERJAAN (Employment Insurance)
  // ============================================

  // JHT (Job Loss Insurance) - No cap
  const jhtEmployeeShare = monthlySalary * BPJS_RATES.jht.employee;
  const jhtEmployerShare = monthlySalary * BPJS_RATES.jht.employer;

  // JP (Pension Insurance) - Cap 12jt
  const jpEmployeeShare = cappedSalaryJP * BPJS_RATES.jp.employee;
  const jpEmployerShare = cappedSalaryJP * BPJS_RATES.jp.employer;

  // JKK (Work Accident Insurance) - Employer only, based on risk class
  const jkkRate = Object.values(BPJS_RATES.jkk)[riskClass - 1] || BPJS_RATES.jkk.class3;
  const jkkEmployerShare = monthlySalary * jkkRate;

  // JKM (Death Insurance) - Employer only
  const jkmEmployerShare = monthlySalary * BPJS_RATES.jkm.rate;

  // ============================================
  // Calculate Totals
  // ============================================
  const bpjsKesehatanTotal = kesehatanEmployeeShare + kesehatanEmployerShare;

  const ketenagaKerjaanTotalEmployee = jhtEmployeeShare + jpEmployeeShare;
  const ketenagaKerjaanTotalEmployer = jhtEmployerShare + jpEmployerShare + jkkEmployerShare + jkmEmployerShare;
  const ketenagaKerjaanTotal = ketenagaKerjaanTotalEmployee + ketenagaKerjaanTotalEmployer;

  const totalDeduction = kesehatanEmployeeShare + ketenagaKerjaanTotalEmployee;
  const totalCost = bpjsKesehatanTotal + ketenagaKerjaanTotal;

  return {
    kesehatan: {
      employeeShare: Math.round(kesehatanEmployeeShare),
      employerShare: Math.round(kesehatanEmployerShare),
      total: Math.round(bpjsKesehatanTotal),
    },
    ketenagakerjaan: {
      jht: {
        employeeShare: Math.round(jhtEmployeeShare),
        employerShare: Math.round(jhtEmployerShare),
      },
      jp: {
        employeeShare: Math.round(jpEmployeeShare),
        employerShare: Math.round(jpEmployerShare),
      },
      jkk: {
        employerShare: Math.round(jkkEmployerShare),
      },
      jkm: {
        employerShare: Math.round(jkmEmployerShare),
      },
      totalEmployee: Math.round(ketenagaKerjaanTotalEmployee),
      totalEmployer: Math.round(ketenagaKerjaanTotalEmployer),
      total: Math.round(ketenagaKerjaanTotal),
    },
    totalDeduction: Math.round(totalDeduction),
    totalCost: Math.round(totalCost),
  };
}

/**
 * Calculate only employee BPJS deductions (for payroll)
 */
export function calculateEmployeeBPJS(input: BPJSInput): {
  kesehatan: number;
  jht: number;
  jp: number;
  total: number;
} {
  const result = calculateBPJS(input);
  
  return {
    kesehatan: result.kesehatan.employeeShare,
    jht: result.ketenagakerjaan.jht.employeeShare,
    jp: result.ketenagakerjaan.jp.employeeShare,
    total: result.totalDeduction,
  };
}

/**
 * Calculate only employer BPJS contributions
 */
export function calculateEmployerBPJS(input: BPJSInput): {
  kesehatan: number;
  jht: number;
  jp: number;
  jkk: number;
  jkm: number;
  total: number;
} {
  const result = calculateBPJS(input);
  
  return {
    kesehatan: result.kesehatan.employerShare,
    jht: result.ketenagakerjaan.jht.employerShare,
    jp: result.ketenagakerjaan.jp.employerShare,
    jkk: result.ketenagakerjaan.jkk.employerShare,
    jkm: result.ketenagakerjaan.jkm.employerShare,
    total: result.kesehatan.employerShare + result.ketenagakerjaan.totalEmployer,
  };
}

/**
 * Get risk class description
 */
export function getRiskClassDescription(riskClass: 1 | 2 | 3 | 4 | 5 | 6): string {
  const descriptions = {
    1: 'Sangat Rendah (Very Low Risk)',
    2: 'Rendah (Low Risk)',
    3: 'Sedang (Medium Risk)',
    4: 'Tinggi (High Risk)',
    5: 'Sangat Tinggi (Very High Risk)',
    6: 'Tertinggi (Highest Risk)',
  };
  return descriptions[riskClass];
}

/**
 * Get risk class by industry type
 */
export function getRiskClassByIndustry(industryType: string): 1 | 2 | 3 | 4 | 5 | 6 {
  // Simplified classification
  const lowRisk = ['office', 'administration', 'banking', 'insurance', 'consulting'];
  const mediumRisk = ['retail', 'manufacturing_light', 'construction'];
  const highRisk = ['manufacturing_heavy', 'mining', 'construction_heavy'];
  
  const type = industryType.toLowerCase();
  
  if (lowRisk.some(t => type.includes(t))) return 1;
  if (type.includes('agriculture') || type.includes('food')) return 2;
  if (mediumRisk.some(t => type.includes(t))) return 3;
  if (type.includes('chemical') || type.includes('metal')) return 4;
  if (highRisk.some(t => type.includes(t))) return 5;
  
  return 3; // Default to medium
}

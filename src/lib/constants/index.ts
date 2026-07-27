// ============================================
// PTKP (PTKP) RATES 2024 - Indonesia
// ============================================

export const PTKP_RATES_2024 = {
  TK0: 54000000,
  K0: 58500000,
  K1: 63000000,
  K2: 67500000,
  K3: 72000000,
  TK1: 58500000,
  TK2: 63000000,
  TK3: 67500000,
} as const;

export const PTKP_PER_DEPENDENT = 4500000;

export const PPH21_BRACKETS_2024 = [
  { min: 0, max: 60000000, rate: 0.05, deduction: 0 },
  { min: 60000000, max: 250000000, rate: 0.15, deduction: 3000000 },
  { min: 250000000, max: 500000000, rate: 0.25, deduction: 31500000 },
  { min: 500000000, max: 5000000000, rate: 0.30, deduction: 95000000 },
  { min: 5000000000, max: Infinity, rate: 0.35, deduction: 1550000000 },
];

export const BPJS_RATES = {
  kesehatan: { employee: 0.01, employer: 0.04, maxSalary: 12000000 },
  jht: { employee: 0.02, employer: 0.037 },
  jp: { employee: 0.01, employer: 0.02, maxSalary: 12000000 },
  jkk: { class1: 0.0024, class2: 0.0054, class3: 0.0089, class4: 0.0124, class5: 0.0147, class6: 0.0174 },
  jkm: { rate: 0.003 },
} as const;

export const ATTENDANCE_SETTINGS = {
  standardWorkHours: 8,
  standardWorkDays: 22,
  lateToleranceMinutes: 0,
  maxLateMinutesPenalty: 60,
  overtimeMultiplierWeekday: 1.5,
  overtimeMultiplierWeekend: 2.0,
  overtimeMultiplierHoliday: 2.0,
  maxOvertimeHoursPerDay: 4,
  maxOvertimeHoursPerWeek: 18,
};

export const SALARY_COMPONENT_CODES = {
  BASIC_SALARY: 'BASIC_SALARY',
  TRANSPORT_ALLOWANCE: 'TRANSPORT_ALLOWANCE',
  MEAL_ALLOWANCE: 'MEAL_ALLOWANCE',
  COMMUNICATION_ALLOWANCE: 'COMMUNICATION_ALLOWANCE',
  HEALTH_ALLOWANCE: 'HEALTH_ALLOWANCE',
  POSITION_ALLOWANCE: 'POSITION_ALLOWANCE',
  ATTENDANCE_ALLOWANCE: 'ATTENDANCE_ALLOWANCE',
  OVERTIME_PAY: 'OVERTIME_PAY',
  BONUS: 'BONUS',
  THR: 'THR',
  PPH21: 'PPH21',
  BPJS_KESEHATAN_EMPLOYEE: 'BPJS_KESEHATAN_EMPLOYEE',
  BPJS_KETENAGAKERJAAN_EMPLOYEE: 'BPJS_KETENAGAKERJAAN_EMPLOYEE',
  LOAN_INSTALLMENT: 'LOAN_INSTALLMENT',
  ABSENCE_DEDUCTION: 'ABSENCE_DEDUCTION',
  LATE_PENALTY: 'LATE_PENALTY',
} as const;

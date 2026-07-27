// ============================================
// Overtime Calculator - Indonesia
// Based on UU Ketenagakerjaan No. 13 Tahun 2003
// ============================================

import { ATTENDANCE_SETTINGS } from '../constants';

export interface OvertimeInput {
  basicSalary: number;
  allowances?: number; // Total monthly allowances (taxable)
  overtimeHours: number;
  dayType: 'weekday' | 'saturday' | 'sunday' | 'holiday';
  isHolidayWorked?: boolean; // If true, weekend/holiday hours
  holidayHours?: number; // Separate calculation for holiday hours
}

export interface OvertimeResult {
  hourlyRate: number;
  overtimeHours: number;
  totalOvertimePay: number;
  breakdown: {
    weekdayOvertime: number;
    saturdayOvertime: number;
    sundayOvertime: number;
    holidayOvertime: number;
  };
  multiplier: number;
  calculationNotes: string;
}

/**
 * Calculate overtime pay based on Indonesian labor law
 * 
 * Rules:
 * - Weekday overtime: 1.5x hourly rate per hour
 * - Saturday: Depends on company policy (usually 2x for first 8 hours, then 2x)
 * - Sunday/Holiday: 2x hourly rate for first 8 hours, 3x after
 */
export function calculateOvertime(input: OvertimeInput): OvertimeResult {
  const {
    basicSalary,
    allowances = 0,
    overtimeHours,
    dayType,
    isHolidayWorked = false,
    holidayHours = 0,
  } = input;

  // Calculate hourly rate (based on 173 hours per month per MenakertransKep 102/MEN/VI/2004)
  // Formula: (Basic Salary + Allowances) / 173
  const monthlySalary = basicSalary + allowances;
  const hourlyRate = monthlySalary / 173;

  let totalOvertimePay = 0;
  let multiplier = ATTENDANCE_SETTINGS.overtimeMultiplierWeekday;
  const breakdown = {
    weekdayOvertime: 0,
    saturdayOvertime: 0,
    sundayOvertime: 0,
    holidayOvertime: 0,
  };

  const calculationNotes: string[] = [];

  // Regular overtime hours (weekdays)
  if (dayType === 'weekday' && overtimeHours > 0) {
    const regularOTHours = Math.min(overtimeHours, ATTENDANCE_SETTINGS.maxOvertimeHoursPerDay);
    const weekdayPay = regularOTHours * hourlyRate * ATTENDANCE_SETTINGS.overtimeMultiplierWeekday;
    
    breakdown.weekdayOvertime = Math.round(weekdayPay);
    totalOvertimePay += weekdayPay;
    multiplier = ATTENDANCE_SETTINGS.overtimeMultiplierWeekday;
    calculationNotes.push(
      `Weekday OT: ${regularOTHours}h × Rp${hourlyRate.toFixed(0)} × 1.5 = Rp${weekdayPay.toFixed(0)}`
    );
  }

  // Saturday overtime (if applicable)
  if (dayType === 'saturday') {
    const satHours = Math.min(overtimeHours, 8);
    const satPay = satHours * hourlyRate * 2; // 2x for Saturday
    
    breakdown.saturdayOvertime = Math.round(satPay);
    totalOvertimePay += satPay;
    calculationNotes.push(
      `Saturday OT: ${satHours}h × Rp${hourlyRate.toFixed(0)} × 2 = Rp${satPay.toFixed(0)}`
    );
  }

  // Sunday overtime
  if (dayType === 'sunday' && !isHolidayWorked) {
    const sunHours = Math.min(overtimeHours, 8);
    const sunPay = sunHours * hourlyRate * ATTENDANCE_SETTINGS.overtimeMultiplierWeekend;
    
    breakdown.sundayOvertime = Math.round(sunPay);
    totalOvertimePay += sunPay;
    calculationNotes.push(
      `Sunday OT: ${sunHours}h × Rp${hourlyRate.toFixed(0)} × 2 = Rp${sunPay.toFixed(0)}`
    );
  }

  // Holiday overtime (national holidays)
  if (isHolidayWorked && holidayHours > 0) {
    // First 8 hours: 2x hourly rate
    // After 8 hours: 3x hourly rate
    const first8Hours = Math.min(holidayHours, 8);
    const extraHours = Math.max(0, holidayHours - 8);
    
    const holidayPay = (first8Hours * hourlyRate * 2) + (extraHours * hourlyRate * 3);
    
    breakdown.holidayOvertime = Math.round(holidayPay);
    totalOvertimePay += holidayPay;
    multiplier = 2; // Base multiplier for holidays
    calculationNotes.push(
      `Holiday OT: ${first8Hours}h × 2 + ${extraHours}h × 3 = Rp${holidayPay.toFixed(0)}`
    );
  }

  return {
    hourlyRate: Math.round(hourlyRate),
    overtimeHours,
    totalOvertimePay: Math.round(totalOvertimePay),
    breakdown,
    multiplier,
    calculationNotes: calculationNotes.join('; '),
  };
}

/**
 * Calculate overtime for multiple days
 */
export function calculateMonthlyOvertime(
  basicSalary: number,
  dailyOvertimes: Array<{
    date: Date;
    hours: number;
    dayType: 'weekday' | 'saturday' | 'sunday' | 'holiday';
    isHoliday?: boolean;
  }>
): OvertimeResult {
  let totalPay = 0;
  let totalHours = 0;
  const breakdown = {
    weekdayOvertime: 0,
    saturdayOvertime: 0,
    sundayOvertime: 0,
    holidayOvertime: 0,
  };
  const notes: string[] = [];

  for (const ot of dailyOvertimes) {
    const result = calculateOvertime({
      basicSalary,
      overtimeHours: ot.hours,
      dayType: ot.dayType,
      isHolidayWorked: ot.isHoliday || false,
    });
    
    totalPay += result.totalOvertimePay;
    totalHours += ot.hours;
    
    // Add to breakdown
    breakdown.weekdayOvertime += result.breakdown.weekdayOvertime;
    breakdown.saturdayOvertime += result.breakdown.saturdayOvertime;
    breakdown.sundayOvertime += result.breakdown.sundayOvertime;
    breakdown.holidayOvertime += result.breakdown.holidayOvertime;
    
    notes.push(`${ot.date.toISOString().split('T')[0]}: ${ot.hours}h = Rp${result.totalOvertimePay.toFixed(0)}`);
  }

  return {
    hourlyRate: 0,
    overtimeHours: totalHours,
    totalOvertimePay: Math.round(totalPay),
    breakdown,
    multiplier: 0,
    calculationNotes: notes.join('; '),
  };
}

/**
 * Check if overtime exceeds legal limits
 */
export function validateOvertime(
  dailyHours: number,
  weeklyHours: number
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // Daily limit: max 4 hours per day
  if (dailyHours > ATTENDANCE_SETTINGS.maxOvertimeHoursPerDay) {
    violations.push(
      `Daily OT exceeds limit: ${dailyHours}h > ${ATTENDANCE_SETTINGS.maxOvertimeHoursPerDay}h`
    );
  }

  // Weekly limit: max 18 hours per week
  if (weeklyHours > ATTENDANCE_SETTINGS.maxOvertimeHoursPerWeek) {
    violations.push(
      `Weekly OT exceeds limit: ${weeklyHours}h > ${ATTENDANCE_SETTINGS.maxOvertimeHoursPerWeek}h`
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Calculate hourly rate from monthly salary
 */
export function calculateHourlyRate(monthlySalary: number): number {
  return monthlySalary / 173;
}

/**
 * Calculate daily rate from monthly salary
 */
export function calculateDailyRate(monthlySalary: number): number {
  return monthlySalary / ATTENDANCE_SETTINGS.standardWorkDays;
}

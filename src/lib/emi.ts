import { findCourseDetails } from '@/lib/softwareData';

// ==========================================================================
// === EMI (monthly installment) plan shared helpers ========================
// ==========================================================================
// A plan is generated once per student from the course duration in the
// official course database (e.g. AD3D EDGE = "24 Months" -> 24 EMIs).
// Each EMI = totalFees / months, and Paid/Unpaid is derived from which
// installments the accounts team has marked as paid.

export type EmiStatus = 'paid' | 'unpaid';

export interface EmiPlanInput {
  course: string;
  totalFees: number;
  admissionDate: string; // YYYY-MM-DD (first EMI due this month)
  feesPaid?: number; // advance amount already collected at admission
}

export interface GeneratedEmi {
  installmentNo: number; // 1-based
  amount: number;
  dueDate: string; // YYYY-MM-DD — 5th of each due month
  status: EmiStatus;
  paidAmount: number;
  paidDate: string | null;
  paymentMethod: string;
  remarks: string;
}

/** Parse "24 Months" | "18 months" -> 24; null when unusable. */
export function parseCourseDurationMonths(duration: string): number | null {
  const m = /(\d+)\s*month/i.exec(duration || '');
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Course duration in months from the official course database. */
export function getCourseDurationMonths(course: string): number | null {
  const details = findCourseDetails(course);
  return details ? parseCourseDurationMonths(details.duration) : null;
}

/** YYYY-MM for a date string (first 7 chars, validated). */
export function monthKeyOf(dateStr: string): string {
  const m = /^(\d{4}-\d{2})/.exec(dateStr || '');
  return m ? m[1] : new Date().toISOString().slice(0, 7);
}

function addMonthsIso(monthKey: string, add: number): string {
  const [y, mo] = monthKey.split('-').map(Number);
  const total = (y || new Date().getFullYear()) * 12 + ((mo || 1) - 1) + add;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Generate the full EMI schedule for a student.
 * - one EMI per course-duration month
 * - EMI amount = totalFees / months (last installment absorbs rounding)
 * - due on the 5th of each month starting the admission month
 * - if the student already paid an advance at admission, the earliest
 *   installments are pre-marked paid until the advance is consumed
 */
export function generateEmiPlan(input: EmiPlanInput): GeneratedEmi[] {
  const months = getCourseDurationMonths(input.course);
  if (!months || input.totalFees <= 0) return [];

  const startMonth = monthKeyOf(input.admissionDate);
  const base = Math.floor((input.totalFees / months) * 100) / 100;

  let remainingAdvance = Math.max(0, input.feesPaid ?? 0);

  return Array.from({ length: months }, (_, i) => {
    const amount =
      i === months - 1
        ? Math.round((input.totalFees - base * (months - 1)) * 100) / 100
        : base;

    const advanceHere = Math.min(remainingAdvance, amount);
    remainingAdvance = Math.round((remainingAdvance - advanceHere) * 100) / 100;
    const paid = advanceHere >= amount - 0.01;

    return {
      installmentNo: i + 1,
      amount,
      dueDate: `${addMonthsIso(startMonth, i)}-05`,
      status: (paid ? 'paid' : 'unpaid') as EmiStatus,
      paidAmount: paid ? amount : 0,
      paidDate: paid ? input.admissionDate || null : null,
      paymentMethod: paid ? 'Advance at Admission' : '',
      remarks: '',
    };
  });
}

export interface EmiLike {
  amount: number;
  status: EmiStatus | string;
  dueDate: string;
}

/** Summary numbers for badges and dashboards. */
export function summarizeEmis<Emi extends EmiLike>(emis: Emi[]) {
  const paidCount = emis.filter((e) => e.status === 'paid').length;
  const paidAmount = emis
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalAmount = emis.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const overdue = emis.filter(
    (e) => e.status !== 'paid' && e.dueDate && e.dueDate < new Date().toISOString().slice(0, 10)
  ).length;

  return {
    total: emis.length,
    paidCount,
    unpaidCount: emis.length - paidCount,
    paidAmount,
    unpaidAmount: Math.max(0, totalAmount - paidAmount),
    totalAmount,
    overdue,
    // hasOverdue drives the red "Unpaid" badge in attendance/academic panels
    hasOverdue: overdue > 0,
    isFullyPaid: emis.length > 0 && paidCount === emis.length,
  };
}

/** Badge label for a student's EMI state: "Paid" | "Partial" | "Unpaid" */
export function emiBadgeLabel(emis: EmiLike[]): string {
  if (emis.length === 0) return '';
  const s = summarizeEmis(emis);
  if (s.isFullyPaid) return 'Paid';
  if (s.paidCount > 0) return 'Partial';
  return 'Unpaid';
}

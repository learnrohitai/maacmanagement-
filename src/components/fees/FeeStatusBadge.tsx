'use client';

import { IndianRupee } from 'lucide-react';
import { emiBadgeLabel, summarizeEmis } from '@/lib/emi';
import type { EmiRecord, User } from '@/types';

/**
 * Paid/Unpaid EMI badge shown beside a student anywhere in the app
 * (attendance roster, academic dashboards). Derived from the student's
 * EMI plan; falls back to the student-master payment status when no
 * plan exists yet. Read-only display component.
 */
export default function FeeStatusBadge({
  studentId,
  emis,
  fallbackStudent,
}: {
  studentId: string;
  emis: EmiRecord[];
  fallbackStudent: Pick<User, 'paymentStatus'>;
}) {
  const studentEmis = emis.filter((e) => e.studentId === studentId);
  const label =
    studentEmis.length > 0
      ? emiBadgeLabel(studentEmis)
      : fallbackStudent.paymentStatus === 'Paid'
        ? 'Paid'
        : fallbackStudent.paymentStatus === 'Partial'
          ? 'Partial'
          : 'Unpaid';
  const s = summarizeEmis(studentEmis);
  const overdue = studentEmis.length > 0 && s.hasOverdue;

  const variant =
    label === 'Paid'
      ? 'bg-emerald-100 text-emerald-800'
      : overdue
        ? 'bg-red-100 text-red-800'
        : label === 'Partial'
          ? 'bg-amber-100 text-amber-800'
          : 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${variant}`}
      title={
        studentEmis.length > 0
          ? `${s.paidCount}/${s.total} EMIs paid${overdue ? ' • has overdue installment' : ''}`
          : 'From student fee status'
      }
    >
      <IndianRupee className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

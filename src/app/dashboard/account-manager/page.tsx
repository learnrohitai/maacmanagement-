'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Wallet,
  CalendarClock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Table';
import { summarizeEmis } from '@/lib/emi';

export default function AccountManagerDashboard() {
  const { currentUser, emis, loadEmis, students, loadStudents, loadBatches, markEmiPaid } =
    useStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'overdue' | 'paid'>('all');
  const [busyEmiId, setBusyEmiId] = useState<string | null>(null);
  const [missingPlans, setMissingPlans] = useState<
    Array<{ id: string; studentCode: string; fullName: string; course: string; totalFees: number; months: number }>
  >([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    void loadEmis();
    void loadStudents();
    void loadBatches();
  }, [loadEmis, loadStudents, loadBatches]);

  // Refresh the "students without plans" list whenever plans change
  useEffect(() => {
    let cancelled = false;
    fetch('/api/emi')
      .then((r) => (r.ok ? r.json() : { missingPlans: [] }))
      .then((d: { missingPlans?: typeof missingPlans }) => {
        if (!cancelled) setMissingPlans(d.missingPlans || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [emis]);

  const handleGeneratePlan = async (studentId: string) => {
    setGeneratingId(studentId);
    try {
      const res = await fetch('/api/emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (res.ok) {
        setMissingPlans((prev) => prev.filter((s) => s.id !== studentId));
        await loadEmis();
      }
    } catch {
      // leave the row; user can retry
    }
    setGeneratingId(null);
  };

  // Group installments per student
  const studentPlans = useMemo(() => {
    const map = new Map<
      string,
      {
        studentId: string;
        studentCode: string;
        studentName: string;
        course: string;
        emis: typeof emis;
      }
    >();
    for (const e of emis) {
      const key = e.studentId || e.studentCode;
      const entry = map.get(key) ?? {
        studentId: e.studentId,
        studentCode: e.studentCode,
        studentName: e.studentName,
        course: e.course,
        emis: [] as typeof emis,
      };
      entry.emis.push(e);
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [emis]);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return studentPlans.filter((p) => {
      const s = summarizeEmis(p.emis);
      if (filter === 'unpaid' && s.unpaidCount === 0) return false;
      if (filter === 'overdue' && !s.hasOverdue) return false;
      if (filter === 'paid' && !s.isFullyPaid) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.studentName.toLowerCase().includes(q) ||
          p.studentCode.toLowerCase().includes(q) ||
          p.course.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [studentPlans, filter, search]);

  const totals = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const all = studentPlans.flatMap((p) => p.emis);
    const thisMonth = new Date().toISOString().slice(0, 7);
    return {
      students: studentPlans.length,
      totalEmis: all.length,
      paidEmis: all.filter((e) => e.status === 'paid').length,
      unpaidEmis: all.filter((e) => e.status === 'unpaid').length,
      overdueEmis: all.filter(
        (e) => e.status === 'unpaid' && e.dueDate && e.dueDate < today
      ).length,
      dueThisMonth: all.filter(
        (e) => e.status === 'unpaid' && e.dueDate.slice(0, 7) === thisMonth
      ).length,
    };
  }, [studentPlans]);

  const canEdit = currentUser?.role === 'account-manager' || currentUser?.role === 'admin';

  const handleMarkPaid = async (emiId: string, paid: boolean) => {
    setBusyEmiId(emiId);
    await markEmiPaid(emiId, paid, {
      paymentMethod: paid ? 'Cash' : undefined,
    });
    setBusyEmiId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Wallet className="w-3.5 h-3.5" />
            Accounts Department • Fee Installment Control Panel
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Account Manager Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monthly EMI installments auto-generated from each course duration.
          </p>
        </div>
        <button
          onClick={() => void loadEmis()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Students with Plans"
          value={totals.students}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Paid EMIs"
          value={totals.paidEmis}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Unpaid EMIs"
          value={totals.unpaidEmis}
          icon={<XCircle className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Overdue EMIs"
          value={totals.overdueEmis}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Due This Month"
          value={totals.dueThisMonth}
          icon={<CalendarClock className="w-6 h-6" />}
          color="cyan"
          trend="unpaid installments"
        />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, code or course…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="flex gap-2">
          {(['all', 'unpaid', 'overdue', 'paid'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Students missing an EMI plan (pre-existing admissions) */}
      {missingPlans.length > 0 && (
        <Card className="p-5" hover={false}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="font-bold text-gray-900 text-sm">
              {missingPlans.length} student{missingPlans.length === 1 ? '' : 's'} without an EMI plan
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Generate a plan from the course duration (e.g. 24-month course &rarr; 24 EMIs).
            Requires total fees to be set on the student.
          </p>
          <div className="flex flex-wrap gap-2">
            {missingPlans.map((s) => (
              <button
                key={s.id}
                disabled={generatingId === s.id}
                onClick={() => void handleGeneratePlan(s.id)}
                title={`${s.course} • ${s.months || '?'} months`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generatingId === s.id ? 'Generating…' : `Generate: ${s.fullName}`}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Plans */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card className="p-12 text-center" hover={false}>
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No EMI plans match this view.</p>
            <p className="text-gray-400 text-sm mt-1">
              New admissions get a plan automatically. Generate one below for earlier students.
            </p>
          </Card>
        )}
        {filtered.length > 0 &&
          filtered.map((plan) => {
            const s = summarizeEmis(plan.emis);
            const badgeLabel = s.isFullyPaid ? 'Paid' : s.paidCount > 0 ? 'Partial' : 'Unpaid';
            const badgeVariant = s.isFullyPaid
              ? 'success'
              : s.hasOverdue
              ? 'danger'
              : s.paidCount > 0
              ? 'warning'
              : 'default';
            return (
              <Card key={plan.studentId || plan.studentCode} className="overflow-hidden" hover={false}>
                {/* Student header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-cyan-50/40">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {plan.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{plan.studentName}</p>
                      <p className="text-xs text-gray-500">
                        {plan.studentCode} • {plan.course} • {plan.emis.length} EMIs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                    <Badge variant="info">{s.paidCount}/{s.total} EMIs paid</Badge>
                  </div>
                </div>

                {/* Installment table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/70">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paid On</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plan.emis
                        .slice()
                        .sort((a, b) => a.installmentNo - b.installmentNo)
                        .map((e) => {
                          const isOverdue = e.status === 'unpaid' && e.dueDate < new Date().toISOString().slice(0, 10);
                          return (
                            <tr key={e.id} className="hover:bg-gray-50/60">
                              <td className="px-6 py-3 text-sm font-bold text-gray-700">
                                EMI {e.installmentNo}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600">{e.dueDate}</td>
                              <td className="px-6 py-3">
                                <Badge
                                  variant={
                                    e.status === 'paid' ? 'success' : isOverdue ? 'danger' : 'warning'
                                  }
                                >
                                  {e.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
                                </Badge>
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-600">
                                {e.paidDate || '—'}
                                {e.paymentMethod && (
                                  <span className="text-xs text-gray-400 ml-1">({e.paymentMethod})</span>
                                )}
                              </td>
                              <td className="px-6 py-3 text-right">
                                {canEdit ? (
                                  e.status === 'paid' ? (
                                    <button
                                      disabled={busyEmiId === e.id}
                                      onClick={() => void handleMarkPaid(e.id, false)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" /> Undo
                                    </button>
                                  ) : (
                                    <button
                                      disabled={busyEmiId === e.id}
                                      onClick={() => void handleMarkPaid(e.id, true)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                                    </button>
                                  )
                                ) : (
                                  <span className="text-xs text-gray-400">View only</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
      </div>

      {/* Read-only notice for other roles */}
      {!canEdit && (
        <p className="text-xs text-gray-400 text-center">
          You have view-only access. Only Accounts and Admin can mark installments as paid.
        </p>
      )}
    </div>
  );
}

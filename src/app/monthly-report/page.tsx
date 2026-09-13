'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  FileBarChart,
  Cake,
  Users,
  Eye,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { User as UserType } from '@/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const REFERRAL_COLORS: Record<string, string> = {
  'Website': '#06b6d4',
  'Walk-in': '#10b981',
  'Social Media': '#8b5cf6',
  'Referral': '#f59e0b',
  'Phone Call': '#ef4444',
};

// Parse "YYYY-MM-DD" (or full ISO) into local date parts — avoids
// timezone drift that new Date('YYYY-MM-DD') can cause.
const parseDateParts = (value?: string): { year: number; month: number; day: number } | null => {
  if (!value) return null;
  const m = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { year: parseInt(m[1]), month: parseInt(m[2]), day: parseInt(m[3]) };
};

export default function MonthlyReportPage() {
  const { students } = useStore();
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<UserType | null>(null);

  // Selected report month: defaults to the current month ("this month")
  const now = new Date();
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportMonth, setReportMonth] = useState(now.getMonth()); // 0-11

  const report = useMemo(() => {
    const monthAdmissions: UserType[] = [];
    const monthBirthdays: Array<{ student: UserType; day: number; age: number | null }> = [];

    students.forEach(s => {
      // --- Admissions this month (by admissionDate, falling back to joinDate) ---
      const adm = parseDateParts(s.admissionDate || s.joinDate);
      if (adm && adm.year === reportYear && adm.month === reportMonth + 1) {
        monthAdmissions.push(s);
      }

      // --- Birthdays this month ---
      const dob = parseDateParts(s.dob);
      if (dob && dob.month === reportMonth + 1) {
        let age: number | null = null;
        if (s.admissionDate) {
          const admParts = parseDateParts(s.admissionDate);
          if (admParts) {
            age = admParts.year - dob.year;
          }
        }
        monthBirthdays.push({ student: s, day: dob.day, age });
      }
    });

    monthBirthdays.sort((a, b) => a.day - b.day);

    // --- Referral-source breakdown for this month's admissions ---
    const sourceCounts: Record<string, number> = {};
    monthAdmissions.forEach(s => {
      const src = s.referralSource || 'Not Recorded';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });
    const sourceData = Object.entries(sourceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // --- Course breakdown for this month's admissions ---
    const courseCounts: Record<string, number> = {};
    monthAdmissions.forEach(s => {
      const c = s.course || 'Unassigned';
      courseCounts[c] = (courseCounts[c] || 0) + 1;
    });
    const courseData = Object.entries(courseCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // --- Documents summary for this month's admissions ---
    const docsPending = monthAdmissions.filter(s => !s.documentsSubmitted || s.documentsSubmitted.length === 0).length;

    return {
      admissions: monthAdmissions,
      birthdays: monthBirthdays,
      sourceData,
      courseData,
      docsPending,
    };
  }, [students, reportYear, reportMonth]);

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/10">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
            <FileBarChart className="w-3.5 h-3.5" />
            Counselor Analytics
          </div>
          <h1 className="text-3xl font-bold mb-2">Monthly Admissions Report 📊</h1>
          <p className="text-emerald-50 max-w-2xl text-sm md:text-base">
            This month&apos;s admissions, birthdays, and where the new students came from — pick any month to review.
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Select Report Month</h3>
              <p className="text-xs text-gray-500">Currently viewing: {MONTH_NAMES[reportMonth]} {reportYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(parseInt(e.target.value))}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/70">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Admissions in {MONTH_NAMES[reportMonth]} {reportYear}</p>
          <p className="text-2xl font-extrabold text-teal-700 leading-tight">{report.admissions.length}</p>
          <p className="text-[10px] text-gray-500">of {students.length} total</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Birthdays This Month</p>
          <p className="text-2xl font-extrabold text-pink-600 leading-tight">{report.birthdays.length}</p>
          <p className="text-[10px] text-gray-500">students to wish</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Top Source</p>
          <p className="text-lg font-extrabold text-purple-700 leading-tight truncate">
            {report.sourceData[0]?.name || '—'}
          </p>
          <p className="text-[10px] text-gray-500">{report.sourceData[0] ? `${report.sourceData[0].value} admissions` : 'no data yet'}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Docs Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 leading-tight">{report.docsPending}</p>
          <p className="text-[10px] text-gray-500">of this month&apos;s admissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral source pie chart */}
        <Card className="p-6">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
            Admissions by Source — {MONTH_NAMES[reportMonth]} {reportYear}
          </p>
          {report.sourceData.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
              No admissions recorded for this month.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={report.sourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {report.sourceData.map((entry) => (
                      <Cell key={entry.name} fill={REFERRAL_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Course-wise bar chart for the month */}
        <Card className="p-6">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
            Admissions by Course — {MONTH_NAMES[reportMonth]} {reportYear}
          </p>
          {report.courseData.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
              No admissions recorded for this month.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.courseData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="#9ca3af" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" name="Admissions" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Birthdays this month */}
      <Card className="p-6">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Cake className="w-3.5 h-3.5 text-pink-500" />
          Birthdays in {MONTH_NAMES[reportMonth]} ({report.birthdays.length})
        </p>
        {report.birthdays.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
            No student birthdays recorded for this month.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {report.birthdays.map(({ student, day, age }) => (
              <button
                key={student.id}
                type="button"
                className="p-3 rounded-xl border border-pink-100 bg-pink-50/50 flex items-center gap-2.5 cursor-pointer hover:border-pink-300 hover:shadow-sm transition-all text-left"
                onClick={() => setSelectedStudentDetail(student)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{student.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {day} {MONTH_NAMES[reportMonth].slice(0, 3)}
                    {age !== null && ` • turns ${age + 1}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* This month's admissions list */}
      <Card className="p-6">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-teal-600" />
          Admissions Done in {MONTH_NAMES[reportMonth]} {reportYear} ({report.admissions.length})
        </p>
        {report.admissions.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
            No admissions recorded in this month.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Student</th>
                  <th className="py-2.5 px-3 font-semibold">Course</th>
                  <th className="py-2.5 px-3 font-semibold">Admission Date</th>
                  <th className="py-2.5 px-3 font-semibold">Source</th>
                  <th className="py-2.5 px-3 font-semibold">Documents</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.admissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-3">
                      <div className="text-xs font-bold text-gray-900">{s.name}</div>
                      <div className="text-[10px] font-mono text-emerald-700">{s.studentId || 'MAAC-STU'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-gray-700">{s.course || '—'}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-600">{s.admissionDate || s.joinDate}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                        {s.referralSource || 'Not Recorded'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs">
                      {s.documentsSubmitted && s.documentsSubmitted.length > 0 ? (
                        <span className="text-emerald-700 font-medium">{s.documentsSubmitted.length} Verified ✓</span>
                      ) : (
                        <span className="text-amber-600">Pending</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudentDetail(s)}
                        className="text-xs px-2.5 py-1 text-gray-600 hover:text-teal-700"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Link back to dashboard for the full profile modal experience */}
      <div className="text-center text-xs text-gray-400 pb-4">
        Need to create or review admissions?{' '}
        <Link href="/dashboard/counselor" className="text-teal-600 font-semibold hover:underline">
          Go to Counselor Dashboard
        </Link>
      </div>

      {/* Compact student profile modal */}
      {selectedStudentDetail && (
        <Modal
          isOpen={!!selectedStudentDetail}
          onClose={() => setSelectedStudentDetail(null)}
          title={`Student Profile: ${selectedStudentDetail.name}`}
        >
          <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-4 bg-teal-50/60 p-4 rounded-2xl border border-teal-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedStudentDetail.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedStudentDetail.name}</h3>
                <p className="text-xs font-mono text-teal-800 font-semibold">{selectedStudentDetail.studentId || 'MAAC-STUDENT'}</p>
                <p className="text-xs text-gray-500">
                  {selectedStudentDetail.course || '—'} • Admitted: {selectedStudentDetail.admissionDate || selectedStudentDetail.joinDate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-gray-400">Date of Birth</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.dob || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Parent / Guardian</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.parentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Parent Contact</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.parentContact || selectedStudentDetail.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Counselor In-charge</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.counselorName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Documents</p>
                <p className="font-semibold text-gray-800">
                  {selectedStudentDetail.documentsSubmitted && selectedStudentDetail.documentsSubmitted.length > 0
                    ? `${selectedStudentDetail.documentsSubmitted.length} submitted`
                    : 'Pending'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100">
              <p className="text-xs font-bold text-rose-700 mb-2 uppercase">How did you know about MAAC?</p>
              <div className="text-xs">
                <span className="text-gray-500">Source: </span>
                <strong className="text-gray-800">{selectedStudentDetail.referralSource || 'Not recorded'}</strong>
                {selectedStudentDetail.referralDetails && (
                  <p className="text-gray-600 mt-1 italic">{selectedStudentDetail.referralDetails}</p>
                )}
              </div>
            </div>

            {selectedStudentDetail.remarks && (
              <div>
                <p className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Counselor Remarks</p>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl italic">&ldquo;{selectedStudentDetail.remarks}&rdquo;</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" onClick={() => setSelectedStudentDetail(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

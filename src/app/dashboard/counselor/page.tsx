'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Search,
  Eye,
  FileCheck2,
  FileBarChart,
  Cake,
  Users
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
import { StudentStatus, User as UserType } from '@/types';
import { COURSE_DATABASE } from '@/lib/softwareData';

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

export default function CounselorDashboard() {
  const router = useRouter();
  const { students } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<UserType | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Selected report month: defaults to the current month ("this month")
  const now = new Date();
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportMonth, setReportMonth] = useState(now.getMonth()); // 0-11

  const totalAdmissionsCount = students.length;

  // ===== ===== MONTHLY ADMISSIONS REPORT (computed once) ===== =====
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

    // --- Documents / fee summary for this month's admissions ---
    const docsPending = monthAdmissions.filter(s => !s.documentsSubmitted || s.documentsSubmitted.length === 0).length;

    return {
      admissions: monthAdmissions,
      birthdays: monthBirthdays,
      sourceData,
      courseData,
      docsPending,
    };
  }, [students, reportYear, reportMonth]);

  const stats = [
    {
      title: 'Total Admissions Recorded',
      value: totalAdmissionsCount,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'green' as const,
      trend: `${totalAdmissionsCount} master entries`
    },
    {
      title: 'Enrolled Courses',
      value: `${COURSE_DATABASE.length} Programs`,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'cyan' as const,
      trend: 'AD3D EDGE, ADVFX+, Real-Time 3D...'
    },
    {
      title: 'Admission Status',
      value: 'Active',
      icon: <FileCheck2 className="w-6 h-6" />,
      color: 'orange' as const,
      trend: 'Forwarding to AM'
    }
  ];

  // Course Admissions Breakdown Data (all-time, kept for dashboard chart)
  const courseCountMap: Record<string, number> = {};
  students.forEach(s => {
    const course = s.course || 'Animation';
    courseCountMap[course] = (courseCountMap[course] || 0) + 1;
  });
  const courseData = Object.keys(courseCountMap).map(course => ({
    name: course,
    count: courseCountMap[course]
  }));

  const getStudentStatusBadge = (status?: StudentStatus) => {
    switch (status) {
      case 'Waiting for Batch':
        return <Badge variant="warning">Waiting for AM Batch</Badge>;
      case 'Active':
        return <Badge variant="success">Active in Class</Badge>;
      case 'On Hold/Pause':
        return <Badge variant="default">On Hold / Pause</Badge>;
      case 'Course Completed':
        return <Badge variant="purple">Completed</Badge>;
      case 'Passout/Certificate':
        return <Badge variant="info">Certificate Issued</Badge>;
      case 'Dropped (ADO/FDO)':
        return <Badge variant="danger">Dropped</Badge>;
      default:
        return <Badge variant="default">Active</Badge>;
    }
  };

  const filteredAdmissions = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Primary Actions Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/10"
      >
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              MAAC Counselor Admission Portal
            </div>
            <h1 className="text-3xl font-bold mb-2">Counselor Admission Desk</h1>
            <p className="text-emerald-50 max-w-xl text-sm md:text-base">
              Create new student admissions, record candidate details, guardian contacts, and submitted documents. Admissions are submitted and automatically forwarded to Academic Managers for batch scheduling.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              onClick={() => setShowReport(true)}
              variant="white"
              className="font-bold text-base px-6 py-3.5 rounded-xl"
            >
              <FileBarChart className="w-5 h-5 mr-2 text-teal-600" />
              Monthly Report
            </Button>
            <Button
              onClick={() => router.push('/admission/new')}
              variant="white"
              className="font-bold text-base px-6 py-3.5 rounded-xl"
            >
              <GraduationCap className="w-5 h-5 mr-2 text-teal-600" />
              Create Admission
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* ===== MONTHLY ADMISSIONS REPORT (inline section) ===== */}
      <Card className="p-6 border-l-4 border-l-teal-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-gray-900">Monthly Admissions Report</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              This month&apos;s admissions, birthdays, and where the new students came from.
            </p>
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

        {/* Report summary tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Referral source pie chart */}
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
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
          </div>

          {/* Course-wise bar chart for the month */}
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
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
          </div>
        </div>

        {/* Birthdays this month */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
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
                <div
                  key={student.id}
                  className="p-3 rounded-xl border border-pink-100 bg-pink-50/50 flex items-center gap-2.5 cursor-pointer hover:border-pink-300 hover:shadow-sm transition-all"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* This month's admissions list */}
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
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
        </div>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Admissions by Course Program</h3>
              <p className="text-xs text-gray-500">All-time distribution across creative programs</p>
            </div>
            <Badge variant="purple">Master Records</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Student Admissions Master Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recorded Student Admissions ({students.length})</h3>
            <p className="text-xs text-gray-500">Master database entries created by counselors</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button
              size="sm"
              variant="success"
              onClick={() => router.push('/admission/new')}
              className="text-xs px-3 py-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 mr-1" />
              New Admission
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
              <tr>
                <th className="py-3 px-4 font-semibold">Student ID & Name</th>
                <th className="py-3 px-4 font-semibold">Course & Admission Date</th>
                <th className="py-3 px-4 font-semibold">Parent & Contact</th>
                <th className="py-3 px-4 font-semibold">Documents</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmissions.length === 0 ? (
                <tr>                    <td colSpan={5} className="text-center py-12 text-gray-500">
                    No admission records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{student.name}</div>
                      <div className="text-xs text-emerald-700 font-mono font-medium">{student.studentId || 'MAAC-STU'}</div>
                      <div className="text-xs text-gray-400">{student.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{student.course || 'Animation'}</div>
                      <div className="text-xs text-gray-500">Admitted: {student.admissionDate || student.joinDate}</div>
                      <div className="text-xs text-gray-400">Counselor: {student.counselorName || 'Priya Sharma'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-gray-800 text-xs font-medium">{student.parentName || 'Parent / Guardian'}</div>
                      <div className="text-xs text-gray-500">{student.parentContact || student.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-gray-600">
                        {student.documentsSubmitted && student.documentsSubmitted.length > 0 ? (
                          <span className="text-emerald-700 font-medium">{student.documentsSubmitted.length} Verified ✓</span>
                        ) : (
                          <span className="text-amber-600">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudentDetail(student)}
                        className="text-xs px-2.5 py-1 text-gray-600 hover:text-emerald-700"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Profile Inspection Modal */}
      {selectedStudentDetail && (
        <Modal
          isOpen={!!selectedStudentDetail}
          onClose={() => setSelectedStudentDetail(null)}
          title={`Student Master Profile: ${selectedStudentDetail.name}`}
        >
          <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedStudentDetail.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedStudentDetail.name}</h3>
                <p className="text-xs font-mono text-emerald-800 font-semibold">{selectedStudentDetail.studentId || 'MAAC-STUDENT'}</p>
                <p className="text-xs text-gray-500">{selectedStudentDetail.course} • Admitted: {selectedStudentDetail.admissionDate || selectedStudentDetail.joinDate}</p>
              </div>
            </div>              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-gray-400">Student Status</p>
                <div className="mt-1">{getStudentStatusBadge(selectedStudentDetail.studentStatus)}</div>
              </div>
              <div>
                <p className="text-gray-400">Parent / Guardian</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.parentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Parent Contact</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.parentContact || selectedStudentDetail.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Counselor In-charge</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.counselorName || 'Priya Sharma'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Documents Submitted</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudentDetail.documentsSubmitted?.map(doc => (
                  <span key={doc} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    ✓ {doc}
                  </span>
                )) || <span className="text-xs text-gray-400">None recorded</span>}
              </div>
            </div>

            {/* School / Education Details */}
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-700 mb-2 uppercase">School / Previous Education</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">School: </span>
                  <strong className="text-gray-800">{selectedStudentDetail.previousSchool || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">City: </span>
                  <strong className="text-gray-800">{selectedStudentDetail.schoolCity || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Board: </span>
                  <strong className="text-gray-800">{selectedStudentDetail.schoolBoard || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Last Class: </span>
                  <strong className="text-gray-800">{selectedStudentDetail.lastClassPassed || 'N/A'}</strong>
                </div>
                {selectedStudentDetail.schoolAddress && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Address: </span>
                    <strong className="text-gray-800">{selectedStudentDetail.schoolAddress}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* How did you know about MAAC? */}
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

            <div>
              <p className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Counselor Remarks</p>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl italic">
                &ldquo;{selectedStudentDetail.remarks || 'Standard enrollment.'}&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" onClick={() => setSelectedStudentDetail(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Full-screen Monthly Report Modal (opened from banner button) */}
      {showReport && (
        <Modal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          title={`Monthly Admissions Report — ${MONTH_NAMES[reportMonth]} ${reportYear}`}
          size="2xl"
        >
          <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Admissions</p>
                <p className="text-2xl font-extrabold text-teal-700">{report.admissions.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-center">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Birthdays</p>
                <p className="text-2xl font-extrabold text-pink-600">{report.birthdays.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Top Source</p>
                <p className="text-lg font-extrabold text-purple-700 truncate">{report.sourceData[0]?.name || '—'}</p>
              </div>
            </div>

            {/* Source breakdown list */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase mb-2">Admissions by Source</p>
              {report.sourceData.length === 0 ? (
                <p className="text-xs text-gray-400">No data for this month.</p>
              ) : (
                <div className="space-y-1.5">
                  {report.sourceData.map(({ name, value }) => {
                    const pct = report.admissions.length > 0 ? Math.round((value / report.admissions.length) * 100) : 0;
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 w-28 shrink-0">{name}</span>
                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-14 text-right">{value} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Birthday list */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase mb-2">Birthdays This Month</p>
              {report.birthdays.length === 0 ? (
                <p className="text-xs text-gray-400">No birthdays this month.</p>
              ) : (
                <div className="space-y-1">
                  {report.birthdays.map(({ student, day, age }) => (
                    <div key={student.id} className="flex items-center justify-between text-xs bg-pink-50/60 rounded-lg px-3 py-2">
                      <span className="font-semibold text-gray-800">{student.name}</span>
                      <span className="text-gray-600">{day} {MONTH_NAMES[reportMonth].slice(0, 3)}{age !== null && ` • turns ${age + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admissions list */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase mb-2">Admissions Done This Month</p>
              {report.admissions.length === 0 ? (
                <p className="text-xs text-gray-400">No admissions this month.</p>
              ) : (
                <div className="space-y-1">
                  {report.admissions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-semibold text-gray-800">{s.name} <span className="text-gray-400">• {s.course || '—'}</span></span>
                      <span className="text-teal-700 font-bold">{s.referralSource || 'Not Recorded'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" onClick={() => setShowReport(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

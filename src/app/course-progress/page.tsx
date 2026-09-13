'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TrendingUp,
  Search,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { User as UserType } from '@/types';
import {
  COURSE_DATABASE,
  getSoftwaresForCourse,
  calculateStudentCourseProgress,
  StudentCourseProgressReport
} from '@/lib/softwareData';
import StudentCurriculumModal from '@/components/curriculum/StudentCurriculumModal';

type ReportView = 'software' | 'student';

export default function CourseProgressPage() {
  const { students: storeStudents, users, attendance, batches } = useStore();

  const allStudents: UserType[] =
    storeStudents.length > 0 ? storeStudents : users.filter(u => u.role === 'student');

  const [selectedCourse, setSelectedCourse] = useState<string>(COURSE_DATABASE[0]?.name || '');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ReportView>('software');
  const [studentForDrilldown, setStudentForDrilldown] = useState<UserType | null>(null);

  const softwares = useMemo(() => getSoftwaresForCourse(selectedCourse), [selectedCourse]);

  const courseStudents = useMemo(
    () => allStudents.filter(s => s.course === selectedCourse),
    [allStudents, selectedCourse]
  );

  const reports = useMemo(() => {
    const map = new Map<string, { student: UserType; report: StudentCourseProgressReport }>();
    courseStudents.forEach(s => {
      map.set(s.id, {
        student: s,
        report: calculateStudentCourseProgress(s.id, s.course, attendance, s.course, batches),
      });
    });
    return map;
  }, [courseStudents, attendance, batches]);

  const softwareStats = useMemo(() => {
    return softwares.map(sw => {
      let attendedSum = 0;
      let started = 0;
      let completed = 0;
      reports.forEach(({ report }) => {
        const stat = report.softwares.find(x => x.softwareId === sw.id);
        if (!stat) return;
        attendedSum += stat.attendedSessions;
        if (stat.attendedSessions > 0) started++;
        if (stat.status === 'completed') completed++;
      });
      const studentCount = reports.size || 1;
      return {
        softwareId: sw.id,
        softwareName: sw.name,
        category: sw.category,
        totalSessions: sw.totalSessions,
        avgCompletion: Math.round((attendedSum / (sw.totalSessions * studentCount)) * 100),
        studentsStarted: started,
        studentsCompleted: completed,
        totalStudents: reports.size,
      };
    });
  }, [softwares, reports]);

  const totals = useMemo(() => {
    let totalSessions = 0;
    let attendedSessions = 0;
    let completedSoftwares = 0;
    let inProgressSoftwares = 0;
    let pendingSoftwares = 0;
    let studentsOnTrack = 0;
    let studentsAtRisk = 0;
    reports.forEach(({ report }) => {
      totalSessions += report.overallTotalSessions;
      attendedSessions += report.overallAttendedSessions;
      completedSoftwares += report.completedSoftwares;
      inProgressSoftwares += report.inProgressSoftwares;
      pendingSoftwares += report.pendingSoftwares;
      if (report.overallCompletionPercentage >= 50) studentsOnTrack++;
      else if (report.softwares.some(sw => sw.attendedSessions > 0)) studentsAtRisk++;
    });
    return {
      totalStudents: reports.size,
      totalSessions,
      attendedSessions,
      overallCompletion: totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0,
      completedSoftwares,
      inProgressSoftwares,
      pendingSoftwares,
      studentsOnTrack,
      studentsAtRisk,
    };
  }, [reports]);

  const chartData = useMemo(
    () =>
      softwareStats.map(sw => ({
        name: sw.softwareName.split(' ')[0],
        fullName: sw.softwareName,
        avgCompletion: sw.avgCompletion,
        totalSessions: sw.totalSessions,
      })),
    [softwareStats]
  );

  const filteredReports = useMemo(() => {
    const term = search.toLowerCase();
    return Array.from(reports.values()).filter(({ student }) =>
      !term ||
      student.name.toLowerCase().includes(term) ||
      (student.studentId || '').toLowerCase().includes(term)
    );
  }, [reports, search]);

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/10"
      >
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Academic Curriculum Analytics
          </div>
          <h1 className="text-3xl font-bold mb-2">Course Progress Report 📈</h1>
          <p className="text-emerald-50 max-w-2xl text-sm md:text-base">
            Software-wise &amp; student-wise progress for every course program — sessions attended vs. remaining for each of the {softwares.length} softwares in {selectedCourse}.
          </p>
        </div>
      </motion.div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Select Course Program</h3>
              <p className="text-xs text-gray-500">{COURSE_DATABASE.length} programs • {softwares.length} softwares mapped</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {COURSE_DATABASE.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.softwares.length} softwares)
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Find student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setView('software')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  view === 'software'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Software-wise
              </button>
              <button
                type="button"
                onClick={() => setView('student')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  view === 'student'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Student-wise
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Overall Completion</p>
          <p className="text-2xl font-extrabold text-emerald-700 leading-tight">{totals.overallCompletion}%</p>
          <p className="text-[10px] text-gray-500">{totals.attendedSessions}/{totals.totalSessions} sessions</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Enrolled Students</p>
          <p className="text-2xl font-extrabold text-gray-800 leading-tight">{totals.totalStudents}</p>
          <p className="text-[10px] text-gray-500">in {selectedCourse}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Softwares Completed</p>
          <p className="text-2xl font-extrabold text-emerald-600 leading-tight">{totals.completedSoftwares}</p>
          <p className="text-[10px] text-gray-500">across all students</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">In Progress</p>
          <p className="text-2xl font-extrabold text-amber-600 leading-tight">{totals.inProgressSoftwares}</p>
          <p className="text-[10px] text-gray-500">softwares being taught</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">Not Started</p>
          <p className="text-2xl font-extrabold text-gray-500 leading-tight">{totals.pendingSoftwares}</p>
          <p className="text-[10px] text-gray-500">softwares pending</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">On Track / At Risk</p>
          <p className="text-2xl font-extrabold text-purple-700 leading-tight">
            {totals.studentsOnTrack}
            <span className="text-sm text-gray-400 font-bold"> / </span>
            {totals.studentsAtRisk}
          </p>
          <p className="text-[10px] text-gray-500">≥50% / &lt;50% started</p>
        </div>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Average Completion by Software — {selectedCourse}</h3>
            <p className="text-xs text-gray-500">Across all enrolled students in this program</p>
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
            No softwares mapped for this course.
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value}%`, 'Avg Completion']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload as { fullName?: string; totalSessions?: number } | undefined;
                    return item ? `${item.fullName} (${item.totalSessions} sessions)` : String(label);
                  }}
                />
                <Bar dataKey="avgCompletion" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Report tables */}
      <Card className="p-6">
        {view === 'software' ? (
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
              Software-wise Progress Report — {selectedCourse}
            </p>
            {softwareStats.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                No softwares mapped for this course.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Software</th>
                      <th className="py-2.5 px-3 font-semibold">Category</th>
                      <th className="py-2.5 px-3 font-semibold">Total Sessions</th>
                      <th className="py-2.5 px-3 font-semibold">Avg Completion</th>
                      <th className="py-2.5 px-3 font-semibold">Started / Completed</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {softwareStats.map((sw) => {
                      const status =
                        sw.avgCompletion >= 100 ? 'completed' : sw.avgCompletion > 0 ? 'in-progress' : 'pending';
                      return (
                        <tr key={sw.softwareId} className="hover:bg-gray-50/60">
                          <td className="py-2.5 px-3 text-xs font-bold text-gray-900">{sw.softwareName}</td>
                          <td className="py-2.5 px-3 text-xs text-gray-600">{sw.category}</td>
                          <td className="py-2.5 px-3 text-xs font-bold text-purple-700">{sw.totalSessions}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${sw.avgCompletion >= 100 ? 'bg-emerald-500' : sw.avgCompletion > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                                  style={{ width: `${sw.avgCompletion}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-700">{sw.avgCompletion}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-xs">
                            <span className="font-bold text-cyan-700">{sw.studentsStarted}</span>
                            <span className="text-gray-400"> / </span>
                            <span className="font-bold text-emerald-700">{sw.studentsCompleted}</span>
                            <span className="text-gray-400"> of {sw.totalStudents}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : status === 'in-progress'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}>
                              {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
              Student-wise Progress Report — {selectedCourse} ({filteredReports.length})
            </p>
            {filteredReports.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                No students enrolled in <strong>{selectedCourse || 'this course'}</strong> yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Student</th>
                      <th className="py-2.5 px-3 font-semibold">Overall Sessions</th>
                      <th className="py-2.5 px-3 font-semibold">Overall Completion</th>
                      <th className="py-2.5 px-3 font-semibold">Software Breakdown</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Full Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReports.map(({ student, report }) => (
                      <tr key={student.id} className="hover:bg-gray-50/60">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{student.name}</div>
                              <div className="text-[10px] font-mono text-emerald-700">{student.studentId || 'MAAC-STU'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-xs font-bold text-purple-700">
                          {report.overallAttendedSessions}/{report.overallTotalSessions}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${report.overallCompletionPercentage >= 100 ? 'bg-emerald-500' : report.overallCompletionPercentage >= 50 ? 'bg-amber-500' : 'bg-orange-400'}`}
                                style={{ width: `${report.overallCompletionPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{report.overallCompletionPercentage}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {report.softwares.map((sw) => (
                              <span
                                key={sw.softwareId}
                                title={`${sw.softwareName}: ${sw.attendedSessions}/${sw.totalSessions} attended, ${sw.remainingSessions} remaining`}
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                                  sw.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : sw.status === 'in-progress'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}
                              >
                                {sw.softwareName.split(' ')[0]} {sw.attendedSessions}/{sw.totalSessions}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStudentForDrilldown(student)}
                            className="text-xs px-2.5 py-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-semibold"
                          >
                            Sessions
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Student drilldown modal: full session-by-session matrix */}
      <StudentCurriculumModal
        student={studentForDrilldown}
        attendance={attendance}
        onClose={() => setStudentForDrilldown(null)}
      />
    </div>
  );
}

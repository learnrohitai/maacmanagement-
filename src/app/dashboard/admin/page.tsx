'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  MoreVertical,
  Users,
  Layers,
  LayoutGrid,
  Search,
  CheckCircle2
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { calculateBatchTracker, calculateCourseTracker, COURSE_DATABASE } from '@/lib/softwareData';
import StudentCurriculumModal from '@/components/curriculum/StudentCurriculumModal';

export default function AdminDashboard() {
  const { dashboardStats, batches, users, students, attendance, currentUser } = useStore();

  const allStudents = students.length > 0 ? students : users.filter(u => u.role === 'student');

  // ===== Batch-wise tracker state =====
  const [trackerBatchId, setTrackerBatchId] = useState<string>('');
  // ===== Course-wise tracker state =====
  const [trackerCourse, setTrackerCourse] = useState<string>(COURSE_DATABASE[0]?.name || '');
  const [courseStudentSearch, setCourseStudentSearch] = useState('');
  const [studentForCurriculum, setStudentForCurriculum] = useState<string | null>(null);

  const teachers = users.filter(u => u.role === 'teacher');
  const activeBatches = batches.filter(b => b.status === 'active');

  // ===== REAL weekly attendance from store (last 7 marked days) =====
  const weeklyAttendance = useMemo(() => {
    const dates = Array.from(new Set(attendance.map(a => a.date))).sort().slice(-7);
    return dates.map(date => {
      const recs = attendance.filter(a => a.date === date);
      const present = recs.filter(a => a.status === 'present' || a.status === 'late').length;
      return { day: date.slice(5), present, absent: recs.length - present };
    });
  }, [attendance]);

  // ===== REAL course distribution from enrolled students =====
  const courseDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    allStudents.forEach(s => {
      const key = s.course || 'Unassigned';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const palette = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }));
  }, [allStudents]);

  // ===== BATCH-WISE TRACKER (accurate shared logic) =====
  const selectedBatch = batches.find(b => b.id === trackerBatchId) || batches[0];
  const batchTracker = useMemo(() => {
    if (!selectedBatch) return null;
    return calculateBatchTracker(selectedBatch, attendance, users);
  }, [selectedBatch, attendance, users]);

  // ===== COURSE-WISE TRACKER (accurate shared logic) =====
  const courseTracker = useMemo(
    () => calculateCourseTracker(trackerCourse, allStudents, attendance, batches),
    [trackerCourse, allStudents, attendance, batches]
  );

  const filteredCourseStudents = useMemo(() => {
    const term = courseStudentSearch.toLowerCase();
    if (!term) return courseTracker.students;
    return courseTracker.students.filter(
      s => s.studentName.toLowerCase().includes(term) || (s.studentCode || '').toLowerCase().includes(term)
    );
  }, [courseTracker.students, courseStudentSearch]);

  // Real recent activities derived from data (latest attendance marks + fee payments)
  const recentActivities = useMemo(() => {
    const items: Array<{ id: string; action: string; student: string; batch: string; time: string; type: 'enrollment' | 'payment' | 'attendance' }> = [];
    const latestAttendance = [...attendance]
      .sort((a, b) => (b.markedAt || b.date).localeCompare(a.markedAt || a.date))
      .slice(0, 3);
    latestAttendance.forEach(a => {
      items.push({
        id: `att-${a.id}`,
        action: 'Attendance marked',
        student: a.studentName,
        batch: a.batchName,
        time: a.date,
        type: 'attendance'
      });
    });
    return items;
  }, [attendance]);

  const stats = [
    {
      title: 'Total Students',
      value: allStudents.length || dashboardStats.totalStudents,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'purple' as const,
      trend: `${activeStudentsCount(allStudents)} active`
    },
    {
      title: 'Active Batches',
      value: activeBatches.length || dashboardStats.activeBatches,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'cyan' as const,
      trend: `${batches.length} total batches`
    },
    {
      title: 'Sessions Conducted',
      value: batchTracker?.conductedSessions ?? 0,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'green' as const,
      trend: selectedBatch ? `${selectedBatch.name}` : 'No batches yet'
    },
    {
      title: 'Faculty',
      value: teachers.length,
      icon: <Users className="w-6 h-6" />,
      color: 'orange' as const,
      trend: `${teachers.reduce((acc, t) => acc + batches.filter(b => b.teacherId === t.id).length, 0)} batch assignments`
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}! Here&apos;s what&apos;s happening at your institute.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all"
        >
          Generate Report
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* ===== BATCH-WISE TRACKER ===== */}
      <Card className="p-6 border-l-4 border-l-purple-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Batch-wise Software Tracker</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Every batch teaches one software — track session-by-session delivery and per-student attendance (accurate, duplicate-safe).
            </p>
          </div>
          <select
            value={selectedBatch?.id || ''}
            onChange={(e) => setTrackerBatchId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchIdCode || b.name} — {b.name} ({b.course})
              </option>
            ))}
          </select>
        </div>

        {!selectedBatch || !batchTracker ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl space-y-3">
            <p>No batches found to track. Create a batch first.</p>
            <Link href="/batches?create=1">
              <Button>
                <BookOpen className="w-4 h-4 mr-1.5" />
                Create New Batch
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Software progress header */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/70 rounded-2xl">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{batchTracker.softwareName}</p>
                  <p className="text-[11px] text-gray-500">
                    Faculty: {selectedBatch.teacherName} • {selectedBatch.startTime}-{selectedBatch.endTime} • {selectedBatch.room} • {selectedBatch.enrolledStudents} students
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-extrabold text-purple-700 leading-none">
                    {batchTracker.conductedSessions}/{batchTracker.totalSessions}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">Sessions Conducted</p>
                </div>
              </div>
              <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${batchTracker.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Session-by-session status */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Session-by-Session Status
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {batchTracker.sessions.map((s) => {
                  const style =
                    s.conducted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : s.studentsMarked > 0
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-500';
                  const label = s.conducted ? 'Conducted' : s.studentsMarked > 0 ? 'Marked Absent' : 'Not Conducted';
                  return (
                    <div key={s.sessionNumber} className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${style}`}>
                      <span className="font-mono font-bold shrink-0">S{s.sessionNumber}</span>
                      <span className="font-medium truncate flex-1">{s.title}</span>
                      <span className="text-[10px] font-bold shrink-0">{label}</span>
                      {s.studentsMarked > 0 && (
                        <span className="text-[10px] text-gray-500 shrink-0">{s.studentsPresent}/{s.studentsMarked} present</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-student attendance in this batch */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Student Progress — {batchTracker.softwareName} ({batchTracker.students.length} enrolled)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Student</th>
                      <th className="py-2.5 px-3 font-semibold">Attended</th>
                      <th className="py-2.5 px-3 font-semibold">Absent</th>
                      <th className="py-2.5 px-3 font-semibold">Remaining</th>
                      <th className="py-2.5 px-3 font-semibold">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchTracker.students.map((s) => (
                      <tr key={s.studentId} className="hover:bg-gray-50/60">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-900 text-xs">{s.studentName}</div>
                          <div className="text-[10px] font-mono text-emerald-700">{s.studentCode || 'MAAC-STU'}</div>
                        </td>
                        <td className="py-2.5 px-3 text-xs font-bold text-emerald-700">{s.attended}/{s.totalSessions}</td>
                        <td className="py-2.5 px-3 text-xs font-bold text-red-600">{s.absent}</td>
                        <td className="py-2.5 px-3 text-xs font-bold text-orange-600">{s.remaining}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${s.completion >= 100 ? 'bg-emerald-500' : s.completion > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                                style={{ width: `${s.completion}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{s.completion}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ===== COURSE-WISE TRACKER ===== */}
      <Card className="p-6 border-l-4 border-l-cyan-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg font-bold text-gray-900">Course-wise Tracker</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Software-pipeline progress per course program — averaged across all enrolled students (session-deduped).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={trackerCourse}
              onChange={(e) => setTrackerCourse(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
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
                value={courseStudentSearch}
                onChange={(e) => setCourseStudentSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Pipeline summary */}
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
          Required Softwares for {trackerCourse} — {courseTracker.totalStudents} student(s) enrolled
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {courseTracker.pipeline.map((sw) => (
            <div key={sw.softwareId} className="p-3 rounded-xl border border-gray-200 bg-white space-y-2">
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-bold text-gray-900 leading-tight">{sw.softwareName}</p>
                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded shrink-0">
                  {sw.totalSessions}S
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${sw.avgCompletion >= 100 ? 'bg-emerald-500' : sw.avgCompletion > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                  style={{ width: `${sw.avgCompletion}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>{sw.avgCompletion}% avg</span>
                <span>{sw.studentsStarted}/{sw.totalStudents} started</span>
              </div>
            </div>
          ))}
          {courseTracker.pipeline.length === 0 && (
            <div className="col-span-full p-4 text-center text-xs text-gray-500">
              No software mapped for this course.
            </div>
          )}
        </div>

        {/* Student list with course completion */}
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
          Enrolled Students ({filteredCourseStudents.length})
        </p>
        {filteredCourseStudents.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
            No students enrolled in <strong>{trackerCourse}</strong> yet.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCourseStudents.map((s) => (
              <button
                key={s.studentId}
                type="button"
                onClick={() => setStudentForCurriculum(s.studentId)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 bg-white hover:border-cyan-300 hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {s.studentName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{s.studentName}</p>
                    <p className="text-[10px] font-mono text-emerald-700">{s.studentCode || 'MAAC-STU'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${s.completion >= 100 ? 'bg-emerald-500' : s.completion > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                      style={{ width: `${s.completion}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-cyan-700 leading-none">{s.completion}%</p>
                    <p className="text-[10px] text-gray-500">{s.attended}/{s.totalSessions} sessions</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart — real data */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {weeklyAttendance.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">
              No attendance marked yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Course Distribution — real data */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Distribution</h3>
          {courseDistribution.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-500">
              No students yet.
            </div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {courseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {courseDistribution.map((course) => (
                  <div key={course.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                    <span className="text-sm text-gray-600 truncate">{course.name} ({course.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Recent Activity — derived from real data */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        {recentActivities.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">No activity yet.</div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'attendance' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'attendance' ? <Calendar className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.student} • {activity.batch}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Student curriculum drilldown */}
      {studentForCurriculum && (() => {
        const student = allStudents.find(s => s.id === studentForCurriculum);
        if (!student) return null;
        return (
          <StudentCurriculumModal
            student={student}
            attendance={attendance}
            onClose={() => setStudentForCurriculum(null)}
          />
        );
      })()}
    </div>
  );
}

// Count active students (helper kept outside render)
function activeStudentsCount(students: Array<{ studentStatus?: string }>): number {
  return students.filter(s => s.studentStatus === 'Active').length;
}

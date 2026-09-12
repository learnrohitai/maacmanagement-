'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Search,
  Plus,
  ArrowLeftRight,
  UserCheck,
  List,
  LayoutGrid,
  Award,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User as UserType, Batch } from '@/types';
import { COURSE_DATABASE, getSoftwaresForCourse, findSoftwareDetails, calculateStudentCourseProgress, StudentCourseProgressReport } from '@/lib/softwareData';
import StudentCurriculumModal from '@/components/curriculum/StudentCurriculumModal';

type ScheduleView = 'day-mwf' | 'day-tts' | 'teacher';

export default function AcademicManagerDashboard() {
  const { batches, users, attendance, assignBatchToStudent, changeStudentBatch, students: storeStudents } = useStore();

  // Modals state
  const [selectedStudentForBatch, setSelectedStudentForBatch] = useState<string | null>(null);
  const [targetBatchId, setTargetBatchId] = useState<string>('');

  // Batch Change / Transfer Modal state
  const [studentForTransfer, setStudentForTransfer] = useState<{
    student: UserType;
    currentBatchId: string;
  } | null>(null);
  const [transferTargetBatchId, setTransferTargetBatchId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('Timing & Schedule Shift Request');

  // Batch detail modal
  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null);

  // Schedule view state
  const [scheduleView, setScheduleView] = useState<ScheduleView>('day-mwf');

  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // ===== Curriculum Trackers: Batch-wise (software) & Course-wise =====
  const [trackerTab, setTrackerTab] = useState<'batch' | 'course'>('batch');
  const [trackerBatchId, setTrackerBatchId] = useState<string>('');
  const [trackerCourse, setTrackerCourse] = useState<string>(COURSE_DATABASE[0]?.name || '');
  const [trackerStudentSearch, setTrackerStudentSearch] = useState('');
  const [trackerStudent, setTrackerStudent] = useState<UserType | null>(null);
  // Software-wise analysis drilldown inside the Course-wise tracker
  const [analysisSoftwareId, setAnalysisSoftwareId] = useState<string | null>(null);

  const teachers = users.filter(u => u.role === 'teacher');
  const allStudents = storeStudents.length > 0 ? storeStudents : users.filter(u => u.role === 'student');
  const waitingStudents = allStudents.filter(s => s.studentStatus === 'Waiting for Batch');
  const activeStudents = allStudents.filter(s => s.studentStatus === 'Active');

  const stats = [
    { title: 'Total Batches', value: batches.length, icon: <BookOpen className="w-6 h-6" />, color: 'purple' as const, trend: `${batches.filter(b => b.status === 'active').length} active` },
    { title: 'Total Faculty', value: teachers.length, icon: <Users className="w-6 h-6" />, color: 'cyan' as const, trend: 'All available' },
    { title: 'Waiting for Batch', value: waitingStudents.length, icon: <Clock className="w-6 h-6" />, color: 'orange' as const, trend: 'Requires allocation' },
    { title: 'Active Students', value: activeStudents.length, icon: <GraduationCap className="w-6 h-6" />, color: 'green' as const, trend: 'In ongoing batches' },
  ];

  const handleAssignBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentForBatch && targetBatchId) {
      assignBatchToStudent(selectedStudentForBatch, targetBatchId);
      setSelectedStudentForBatch(null);
      setTargetBatchId('');
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentForTransfer && transferTargetBatchId) {
      changeStudentBatch(
        studentForTransfer.student.id,
        studentForTransfer.currentBatchId,
        transferTargetBatchId,
        transferReason
      );
      setStudentForTransfer(null);
      setTransferTargetBatchId('');
    }
  };

  const studentBeingAssigned = allStudents.find(s => s.id === selectedStudentForBatch);

  const filteredActiveStudents = activeStudents.filter(s =>
    s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
    (s.course && s.course.toLowerCase().includes(studentSearchTerm.toLowerCase()))
  );

  // Schedule grouping
  const mwfBatches = batches.filter(b => {
    const days = b.days.map(d => d.toLowerCase());
    return days.includes('monday') || days.includes('wednesday') || days.includes('friday');
  });

  const ttsBatches = batches.filter(b => {
    const days = b.days.map(d => d.toLowerCase());
    return days.includes('tuesday') || days.includes('thursday') || days.includes('saturday');
  });

  const scheduleBatches = scheduleView === 'day-mwf' ? mwfBatches : scheduleView === 'day-tts' ? ttsBatches : batches;

  const teacherSchedule = teachers.map(teacher => {
    const teacherBatches = batches.filter(b => b.teacherId === teacher.id);
    return {
      name: teacher.name.split(' ')[0],
      batches: teacherBatches.length,
      students: teacherBatches.reduce((acc, b) => acc + b.enrolledStudents, 0),
      hours: teacherBatches.length * 3,
    };
  });

  // Get students for the viewing batch
  const viewingBatchStudents = useMemo(() => {
    if (!viewingBatch) return [];
    return allStudents.filter(s => viewingBatch.studentIds.includes(s.id));
  }, [viewingBatch, allStudents]);

  // ===== Course & Software Curriculum Tracker computations =====
  const trackerCourseStudents = useMemo(() => {
    if (!trackerCourse) return [];
    return allStudents.filter(s => s.course === trackerCourse);
  }, [allStudents, trackerCourse]);

  const trackerCourseReports = useMemo(() => {
    const map = new Map<string, { student: UserType; report: StudentCourseProgressReport }>();
    trackerCourseStudents.forEach(s => {
      map.set(s.id, {
        student: s,
        report: calculateStudentCourseProgress(s.id, s.course, attendance, s.course),
      });
    });
    return map;
  }, [trackerCourseStudents, attendance]);

  // Aggregate per-software progress across all students in the selected course
  const trackerCoursePipeline = useMemo(() => {
    const softwares = getSoftwaresForCourse(trackerCourse);
    return softwares.map(sw => {
      let attendedSum = 0;
      let totalSessions = sw.totalSessions;
      let studentsStarted = 0;
      trackerCourseReports.forEach(({ report }) => {
        const stat = report.softwares.find(x => x.softwareId === sw.id);
        if (stat) {
          attendedSum += stat.attendedSessions;
          if (stat.attendedSessions > 0) studentsStarted++;
        }
      });
      const studentCount = trackerCourseReports.size || 1;
      const avgCompletion = Math.round(attendedSum / (totalSessions * studentCount) * 100);
      return {
        software: sw,
        avgCompletion,
        studentsStarted,
        totalStudents: trackerCourseReports.size,
      };
    });
  }, [trackerCourse, trackerCourseReports]);

  const trackerFilteredCourseStudents = useMemo(() => {
    const term = trackerStudentSearch.toLowerCase();
    return Array.from(trackerCourseReports.values()).filter(({ student }) => {
      if (!term) return true;
      return (
        student.name.toLowerCase().includes(term) ||
        (student.studentId || '').toLowerCase().includes(term)
      );
    });
  }, [trackerCourseReports, trackerStudentSearch]);

  // ===== Software-wise analysis (Course tracker drilldown) =====
  const analysisSoftware = useMemo(
    () => trackerCoursePipeline.find(p => p.software.id === analysisSoftwareId)?.software,
    [trackerCoursePipeline, analysisSoftwareId]
  );

  // Which courses require this software?
  const analysisRequiredByCourses = useMemo(() => {
    if (!analysisSoftware) return [];
    return COURSE_DATABASE.filter(c =>
      c.softwares.some(s => findSoftwareDetails(s)?.id === analysisSoftware.id)
    );
  }, [analysisSoftware]);

  // Batches currently teaching this software
  const analysisBatches = useMemo(() => {
    if (!analysisSoftware) return [];
    return batches.filter(b => findSoftwareDetails(b.course)?.id === analysisSoftware.id);
  }, [batches, analysisSoftware]);

  // Per-student progress for this software within the selected course
  const analysisStudentStats = useMemo(() => {
    if (!analysisSoftware) return [];
    return Array.from(trackerCourseReports.values()).map(({ student, report }) => {
      const stat = report.softwares.find(s => s.softwareId === analysisSoftware.id);
      return {
        student,
        attended: stat?.attendedSessions ?? 0,
        remaining: stat?.remainingSessions ?? analysisSoftware.totalSessions,
        completion: stat?.completionRate ?? 0,
        status: stat?.status ?? ('pending' as const),
      };
    });
  }, [trackerCourseReports, analysisSoftware]);

  // ===== Batch-wise (software) tracker computations =====
  // Every batch teaches ONE software; this tracker drills into that software's sessions.
  const activeTrackerBatch = batches.find(b => b.id === trackerBatchId) || batches[0];
  const trackerBatchSoftware = findSoftwareDetails(activeTrackerBatch?.course);

  const trackerBatchStudents = useMemo(() => {
    if (!activeTrackerBatch) return [];
    return allStudents.filter(s => activeTrackerBatch.studentIds.includes(s.id));
  }, [allStudents, activeTrackerBatch]);

  // Session-by-session coverage for the batch's software
  const trackerBatchSessions = useMemo(() => {
    if (!activeTrackerBatch) return [];
    const recs = attendance.filter(a => a.batchId === activeTrackerBatch.id);
    return (trackerBatchSoftware?.sessions || []).map(s => {
      const sessionRecs = recs.filter(r => {
        let sNum = r.sessionNumber;
        if (!sNum && r.topic) {
          const m = r.topic.match(/Session\s+(\d+)/i);
          if (m) sNum = parseInt(m[1]);
        }
        return sNum === s.sessionNumber;
      });
      const last = sessionRecs.length > 0 ? sessionRecs[sessionRecs.length - 1] : undefined;
      const sessionStatus: 'present' | 'absent' | 'late' | 'pending' = last ? last.status : 'pending';
      return {
        sessionNumber: s.sessionNumber,
        title: s.title,
        status: sessionStatus,
        date: last?.date,
        studentsPresent: sessionRecs.filter(r => r.status === 'present' || r.status === 'late').length,
        studentsMarked: sessionRecs.length,
      };
    });
  }, [activeTrackerBatch, attendance, trackerBatchSoftware]);

  const trackerBatchCoveredSessions = trackerBatchSessions.filter(s => s.status !== 'pending').length;

  // Per-student attendance stats scoped to this batch's software
  const trackerBatchStudentStats = useMemo(() => {
    const total = trackerBatchSoftware?.totalSessions || 0;
    return trackerBatchStudents.map(student => {
      const recs = attendance.filter(
        a => a.studentId === student.id && a.batchId === activeTrackerBatch?.id
      );
      const present = recs.filter(r => r.status === 'present' || r.status === 'late').length;
      return {
        student,
        attended: present,
        absent: Math.max(0, recs.length - present),
        total,
        remaining: Math.max(0, total - present),
        completion: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    });
  }, [trackerBatchStudents, attendance, activeTrackerBatch, trackerBatchSoftware]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg shadow-orange-500/10"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Academic Dean & Timetable Control
          </div>
          <h1 className="text-3xl font-bold mb-2">Academic Operations & Batch Allocations 📊</h1>
          <p className="text-white/90 max-w-2xl text-sm md:text-base mb-4">
            Allocate newly admitted students to batches, perform batch transfers upon student request, and manage faculty scheduling.
          </p>
          <Link href="/batches?create=1">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 text-sm font-bold shadow-lg shadow-orange-900/20 hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Batch
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* ===== Curriculum Trackers: Batch-wise Software + Course-wise ===== */}
      <Card className="p-6 border-l-4 border-l-purple-500">
        {/* Tab switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Curriculum Trackers</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Batches teach a single software module — track every session. Separately, track each course's full software pipeline per student.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTrackerTab('batch')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                trackerTab === 'batch'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Batch-wise Software Tracker
            </button>
            <button
              type="button"
              onClick={() => setTrackerTab('course')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                trackerTab === 'course'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Course-wise Tracker
            </button>
          </div>
        </div>

        {trackerTab === 'batch' ? (
          /* ============ TAB 1: BATCH-WISE SOFTWARE TRACKER ============ */
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={activeTrackerBatch?.id || ''}
                onChange={(e) => setTrackerBatchId(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchIdCode || b.name} — {b.name} ({b.course})
                  </option>
                ))}
              </select>
              {activeTrackerBatch && (
                <div className="flex items-center gap-2 text-xs bg-gray-50 rounded-xl px-3 py-2">
                  <span className="font-semibold text-gray-700">{activeTrackerBatch.teacherName}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{activeTrackerBatch.startTime}-{activeTrackerBatch.endTime}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{activeTrackerBatch.room}</span>
                </div>
              )}
            </div>

            {!activeTrackerBatch || !trackerBatchSoftware ? (
              <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl space-y-3">
                <p>No batch found to track its software sessions.</p>
                <Link href="/batches?create=1">
                  <Button>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create New Batch
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Software header with progress */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/70 rounded-2xl">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{trackerBatchSoftware.name}</p>
                      <p className="text-[11px] text-gray-500">{trackerBatchSoftware.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-extrabold text-purple-700 leading-none">
                        {trackerBatchCoveredSessions}/{trackerBatchSoftware.totalSessions}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">Sessions Conducted</p>
                    </div>
                  </div>
                  <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${(trackerBatchCoveredSessions / trackerBatchSoftware.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Session-by-session conducted status */}
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                    Session-by-Session Status (as marked in attendance)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {trackerBatchSessions.map((s) => {
                      const style =
                        s.status === 'present'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : s.status === 'absent'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : s.status === 'late'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-gray-50 border-gray-200 text-gray-500';
                      const statusLabel =
                        s.status === 'present'
                          ? 'Conducted'
                          : s.status === 'late'
                            ? 'Conducted (Late)'
                            : s.status === 'absent'
                              ? 'Marked Absent'
                              : 'Not Conducted';
                      return (
                        <div key={s.sessionNumber} className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${style}`}>
                          <span className="font-mono font-bold shrink-0">S{s.sessionNumber}</span>
                          <span className="font-medium truncate flex-1">{s.title}</span>
                          <span className="text-[10px] font-bold shrink-0">{statusLabel}</span>
                          {s.studentsMarked > 0 && (
                            <span className="text-[10px] text-gray-500 shrink-0">{s.studentsPresent}/{s.studentsMarked} present</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Per-student progress within this batch's software */}
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                    Student Progress — {trackerBatchSoftware.name} ({trackerBatchStudents.length} enrolled)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Student</th>
                          <th className="py-2.5 px-3 font-semibold">Attended</th>
                          <th className="py-2.5 px-3 font-semibold">Remaining</th>
                          <th className="py-2.5 px-3 font-semibold">Completion</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Drilldown</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {trackerBatchStudentStats.map(({ student, attended, remaining, completion }) => (
                          <tr key={student.id} className="hover:bg-gray-50/60">
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-gray-900 text-xs">{student.name}</div>
                              <div className="text-[10px] font-mono text-emerald-700">{student.studentId || 'MAAC-STU'}</div>
                            </td>
                            <td className="py-2.5 px-3 text-xs font-bold text-emerald-700">{attended}/{trackerBatchSoftware?.totalSessions}</td>
                            <td className="py-2.5 px-3 text-xs font-bold text-orange-600">{remaining}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${completion >= 100 ? 'bg-emerald-500' : completion > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                                    style={{ width: `${completion}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{completion}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTrackerStudent(student)}
                                className="text-xs px-2.5 py-1 text-purple-700 border-purple-200 hover:bg-purple-50 font-semibold"
                              >
                                Sessions
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ============ TAB 2: COURSE-WISE TRACKER ============ */
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={trackerCourse}
                onChange={(e) => {
                  setTrackerCourse(e.target.value);
                  setAnalysisSoftwareId(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
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
                  value={trackerStudentSearch}
                  onChange={(e) => setTrackerStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Software pipeline summary for the selected course — click a software for analysis */}
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
            Required Softwares for {trackerCourse} — click any software for analysis
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {trackerCoursePipeline.map(({ software, avgCompletion, studentsStarted, totalStudents }, idx) => (
              <button
                key={software.id}
                type="button"
                onClick={() => setAnalysisSoftwareId(analysisSoftwareId === software.id ? null : software.id)}
                className={`p-3 rounded-xl border text-left space-y-2 transition-all cursor-pointer ${
                  analysisSoftwareId === software.id
                    ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-400/40 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    <span className="text-[10px] font-mono text-purple-500 mr-1">{idx + 1}.</span>
                    {software.name}
                  </p>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                    {software.totalSessions}S
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${avgCompletion >= 100 ? 'bg-emerald-500' : avgCompletion > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                    style={{ width: `${avgCompletion}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{avgCompletion}% avg</span>
                  <span>{studentsStarted}/{totalStudents} started</span>
                </div>
              </button>
            ))}
            {trackerCoursePipeline.length === 0 && (
              <div className="col-span-full p-4 text-center text-xs text-gray-500">
                Select a course to view its software pipeline.
              </div>
            )}
          </div>
        </div>

        {/* ===== Software-wise Analysis Drilldown ===== */}
        {analysisSoftware && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50/80 to-indigo-50/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Software-wise Analysis — Module {trackerCoursePipeline.findIndex(p => p.software.id === analysisSoftware.id) + 1} in {trackerCourse}
                </p>
                <h4 className="text-lg font-extrabold text-gray-900">{analysisSoftware.name}</h4>
                <p className="text-xs text-gray-600 max-w-xl">{analysisSoftware.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisSoftwareId(null)}
                className="self-start text-xs font-bold text-gray-500 hover:text-gray-800 bg-white border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                ✕ Close Analysis
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Sessions</p>
                <p className="text-xl font-extrabold text-purple-700">{analysisSoftware.totalSessions}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Required By Courses</p>
                <p className="text-xl font-extrabold text-cyan-700">{analysisRequiredByCourses.length}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Batches Teaching It</p>
                <p className="text-xl font-extrabold text-orange-600">{analysisBatches.length}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Avg Completion ({trackerCourse})</p>
                <p className="text-xl font-extrabold text-emerald-700">
                  {trackerCoursePipeline.find(p => p.software.id === analysisSoftware.id)?.avgCompletion ?? 0}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Which courses need this software */}
              <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Courses that require {analysisSoftware.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysisRequiredByCourses.map(c => (
                    <span
                      key={c.id}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        c.name === trackerCourse
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Batches teaching this software */}
              <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Batches teaching this software
                </p>
                {analysisBatches.length === 0 ? (
                  <p className="text-xs text-gray-400">No batches created for this software yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {analysisBatches.map(b => (
                      <div key={b.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <span className="font-semibold text-gray-800 truncate">{b.batchIdCode || b.name} — {b.name}</span>
                        <span className="text-gray-500 shrink-0 ml-2">{b.enrolledStudents} students • {b.teacherName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Per-student progress for this software */}
            <div className="p-3.5 bg-white rounded-xl border border-gray-200">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Student-wise progress — {analysisSoftware.name} ({trackerCourse})
              </p>
              {analysisStudentStats.length === 0 ? (
                <p className="text-xs text-gray-400">No students enrolled in {trackerCourse} yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase border-b border-gray-100">
                      <tr>
                        <th className="py-2 px-3">Student</th>
                        <th className="py-2 px-3">Attended</th>
                        <th className="py-2 px-3">Remaining</th>
                        <th className="py-2 px-3">Completion</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Sessions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {analysisStudentStats.map(({ student, attended, remaining, completion, status }) => (
                        <tr key={student.id} className="hover:bg-gray-50/60">
                          <td className="py-2 px-3">
                            <div className="text-xs font-medium text-gray-900">{student.name}</div>
                            <div className="text-[10px] font-mono text-emerald-700">{student.studentId || 'MAAC-STU'}</div>
                          </td>
                          <td className="py-2 px-3 text-xs font-bold text-emerald-700">{attended}/{analysisSoftware.totalSessions}</td>
                          <td className="py-2 px-3 text-xs font-bold text-orange-600">{remaining}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${completion >= 100 ? 'bg-emerald-500' : completion > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                                  style={{ width: `${completion}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-700">{completion}%</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
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
                          <td className="py-2 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTrackerStudent(student)}
                              className="text-xs px-2.5 py-1 text-purple-700 border-purple-200 hover:bg-purple-50 font-semibold"
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
          </div>
        )}

            {/* Student progress matrix for the selected course */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Enrolled Students ({trackerFilteredCourseStudents.length})
              </p>
              {trackerFilteredCourseStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                  No students enrolled in <strong>{trackerCourse || 'this course'}</strong> yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {trackerFilteredCourseStudents.map(({ student, report }) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setTrackerStudent(student)}
                      className="w-full text-left p-4 rounded-2xl border border-gray-200 bg-white hover:border-purple-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                            <p className="text-[11px] font-mono text-emerald-700">{student.studentId || 'MAAC-STU'}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-extrabold text-purple-700 leading-none">{report.overallCompletionPercentage}%</p>
                          <p className="text-[10px] text-gray-500">{report.overallAttendedSessions}/{report.overallTotalSessions} sessions</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {report.softwares.map((sw) => (
                          <span
                            key={sw.softwareId}
                            title={`${sw.softwareName}: ${sw.attendedSessions}/${sw.totalSessions} attended, ${sw.remainingSessions} remaining`}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
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
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* TIMETABLE FIRST: Batch Schedule Overview with 3 Views */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Institute Batches & Schedule Overview</h3>
            <p className="text-xs text-gray-500">Click any batch to see enrolled students with admission details</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <select
              value={scheduleView}
              onChange={(e) => setScheduleView(e.target.value as ScheduleView)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="day-mwf">MWF — Mon / Wed / Fri</option>
              <option value="day-tts">TTS — Tue / Thu / Sat</option>
              <option value="teacher">Teacher Wise</option>
            </select>
          </div>
        </div>

        {/* Day-wise views: show batches grouped */}
        {scheduleView !== 'teacher' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduleBatches.length === 0 ? (
              <div className="col-span-full p-6 text-center text-gray-500 text-sm">
                No batches scheduled for this day group.
              </div>
            ) : (
              scheduleBatches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => setViewingBatch(batch)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${
                    batch.isPracticeDoubtClass
                      ? 'border-cyan-200 bg-cyan-50/40 hover:border-cyan-400'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        {batch.batchIdCode || `BATCH-${batch.id}`}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base mt-1">{batch.name}</h4>
                      <p className="text-xs text-gray-500">{batch.course} • {batch.room}</p>
                    </div>
                    {batch.isPracticeDoubtClass ? (
                      <Badge variant="info">Practice / Doubt</Badge>
                    ) : (
                      <Badge variant={batch.status === 'active' ? 'success' : 'default'}>{batch.status}</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-gray-50 rounded-xl text-xs">
                    <div>
                      <p className="text-gray-400">Faculty / Teacher</p>
                      <p className="font-semibold text-gray-800">{batch.teacherName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Timing & Days</p>
                      <p className="font-semibold text-gray-800">{batch.startTime} - {batch.endTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Classes Completed</p>
                      <p className="font-bold text-emerald-700">{batch.classesCompleted ?? 0} Sessions</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Classes Remaining</p>
                      <p className="font-bold text-orange-600">{batch.classesRemaining ?? 0} Sessions</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <span>Enrolled: <strong>{batch.enrolledStudents}</strong> students</span>
                    <span className="text-purple-600 font-medium">Lab: {batch.room}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Teacher-wise view: group by teacher */
          <div className="space-y-4">
            {teachers.map((teacher) => {
              const teacherBatches = batches.filter(b => b.teacherId === teacher.id);
              if (teacherBatches.length === 0) return null;
              return (
                <div key={teacher.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                        <p className="text-xs text-gray-500">{teacherBatches.length} batches • {teacherBatches.reduce((acc, b) => acc + b.enrolledStudents, 0)} students total</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teacherBatches.map((batch) => (
                      <div
                        key={batch.id}
                        onClick={() => setViewingBatch(batch)}
                        className="p-3 rounded-xl border border-gray-100 bg-white hover:border-purple-300 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                            {batch.batchIdCode || `BATCH-${batch.id}`}
                          </span>
                          <Badge variant={batch.status === 'active' ? 'success' : 'default'}>{batch.status}</Badge>
                        </div>
                        <h5 className="font-bold text-gray-900 text-sm">{batch.name}</h5>
                        <p className="text-xs text-gray-500 mt-0.5">{batch.course}</p>
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                          <span>{batch.startTime} - {batch.endTime}</span>
                          <span>{batch.enrolledStudents} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Section 2: Students Waiting for Batch */}
      <Card className="p-6 border-l-4 border-l-amber-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-lg font-bold text-gray-900">
                Students Waiting for Batch ({waitingStudents.length})
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Notify AM: Candidates ready for new batch allocation after recent admission or module completion.
            </p>
          </div>
          <Badge variant="warning">{waitingStudents.length} Pending Allocation</Badge>
        </div>

        {waitingStudents.length === 0 ? (
          <div className="p-6 bg-emerald-50 text-emerald-800 text-sm rounded-xl text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            All admitted students are currently allocated to active batches!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student ID & Name</th>
                  <th className="py-3 px-4 font-semibold">Course Program</th>
                  <th className="py-3 px-4 font-semibold">Admission / Completion Date</th>
                  <th className="py-3 px-4 font-semibold">Waiting For Module</th>
                  <th className="py-3 px-4 font-semibold">Assigned Counselor</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waitingStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-xs font-mono text-emerald-700">{s.studentId || 'MAAC-NEW'}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{s.course}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{s.admissionDate || s.joinDate}</td>
                    <td className="py-3 px-4 text-xs text-amber-800 font-semibold">
                      {s.waitingForModule || 'Module 1: Foundation'}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{s.counselorName || 'Priya Sharma'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedStudentForBatch(s.id);
                          setTargetBatchId(batches.find(b => b.course === s.course)?.id || batches[0]?.id || '');
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 shadow-sm font-semibold"
                      >
                        <PlusCircle className="w-3.5 h-3.5 mr-1" />
                        Assign Batch
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Section 2: Active Student Batch Transfer */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-orange-600" />
              Active Students & Batch Change / Transfer Desk
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Change or transfer active students between batches upon student timing request, faculty preference, or module upgrade.
            </p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search active student..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
              <tr>
                <th className="py-3 px-4 font-semibold">Student ID & Name</th>
                <th className="py-3 px-4 font-semibold">Course Program</th>
                <th className="py-3 px-4 font-semibold">Currently Assigned Batch</th>
                <th className="py-3 px-4 font-semibold">Schedule & Lab Room</th>
                <th className="py-3 px-4 font-semibold">Faculty / Teacher</th>
                <th className="py-3 px-4 font-semibold text-right">Transfer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActiveStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 text-xs">
                    No active students found matching search.
                  </td>
                </tr>
              ) : (
                filteredActiveStudents.map((student) => {
                  const assignedBatchId = student.assignedBatches?.[0];
                  const currentBatch = batches.find(b => b.id === assignedBatchId || b.studentIds.includes(student.id));

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{student.name}</div>
                        <div className="text-xs font-mono text-emerald-700">{student.studentId || 'MAAC-STU'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">{student.course || 'Animation'}</td>
                      <td className="py-3.5 px-4">
                        {currentBatch ? (
                          <div>
                            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                              {currentBatch.batchIdCode || currentBatch.name}
                            </span>
                            <div className="text-xs text-gray-700 font-medium mt-0.5">{currentBatch.name}</div>
                          </div>
                        ) : (
                          <Badge variant="warning">Unassigned</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {currentBatch ? (
                          <div>
                            <div className="font-medium text-gray-800">{currentBatch.startTime} - {currentBatch.endTime}</div>
                            <div className="text-gray-500">{currentBatch.room}</div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-800">
                        {currentBatch?.teacherName || 'Faculty Assigned'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setStudentForTransfer({
                              student,
                              currentBatchId: currentBatch?.id || ''
                            });
                            const altBatch = batches.find(b => b.id !== currentBatch?.id && b.course === student.course) || batches[0];
                            setTransferTargetBatchId(altBatch?.id || '');
                            setTransferReason('Timing & Schedule Shift Request');
                          }}
                          className="text-xs px-3 py-1.5 border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          Change Batch
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Teacher Workload Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Teacher Workload</h3>
            <Badge variant="default">Faculty Hours</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherSchedule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="students" fill="#f97316" radius={[8, 8, 0, 0]} name="Students" />
                <Bar dataKey="hours" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Hours/Week" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Academic Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Academic Summary</h3>
            <span className="text-xs text-gray-500">Real-time status</span>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Module Completion On Schedule</span>
                <span className="font-bold text-emerald-700">92%</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div className="p-4 bg-cyan-50 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Practice & Doubt Class Attendance</span>
                <span className="font-bold text-cyan-700">78%</span>
              </div>
              <div className="w-full bg-cyan-200 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Overall Active Batches</span>
                <span className="font-bold text-purple-700">{batches.filter(b => b.status === 'active').length} / {batches.length}</span>
              </div>
              <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${batches.length > 0 ? (batches.filter(b => b.status === 'active').length / batches.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Student Grades Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Student Grades Overview</h3>
          </div>
          <Badge variant="default">Based on Attendance Records</Badge>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Grades assigned by faculty during attendance marking for each student across all batches.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Student ID</th>
                <th className="py-3 px-4 font-semibold">Batch</th>
                <th className="py-3 px-4 font-semibold">Course</th>
                <th className="py-3 px-4 font-semibold">Latest Grade</th>
                <th className="py-3 px-4 font-semibold">Grade Trend</th>
                <th className="py-3 px-4 font-semibold">Assignments Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(() => {
                const gradeMap = new Map<string, { grades: string[]; batchName: string; course: string; studentId: string; assignmentsSubmitted: number; totalRecords: number }>();
                attendance.forEach((a) => {
                  const existing = gradeMap.get(a.studentId);
                  if (existing) {
                    if (a.grade) existing.grades.push(a.grade);
                    existing.totalRecords++;
                    if (a.assignmentSubmitted) existing.assignmentsSubmitted++;
                  } else {
                    gradeMap.set(a.studentId, {
                      grades: a.grade ? [a.grade] : [],
                      batchName: a.batchName,
                      course: allStudents.find(s => s.id === a.studentId)?.course || 'N/A',
                      studentId: allStudents.find(s => s.id === a.studentId)?.studentId || 'MAAC-STU',
                      assignmentsSubmitted: a.assignmentSubmitted ? 1 : 0,
                      totalRecords: 1
                    });
                  }
                });
                const gradeEntries = Array.from(gradeMap.entries());
                if (gradeEntries.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500 text-xs">
                        No grade records found. Grades appear once faculty mark attendance with grades.
                      </td>
                    </tr>
                  );
                }
                return gradeEntries.map(([sId, data]) => {
                  const latestGrade = data.grades[data.grades.length - 1] || 'N/A';
                  const gradeColors: Record<string, string> = {
                    'A+': 'bg-emerald-100 text-emerald-800',
                    'A': 'bg-emerald-100 text-emerald-700',
                    'B+': 'bg-cyan-100 text-cyan-800',
                    'B': 'bg-cyan-100 text-cyan-700',
                    'C+': 'bg-amber-100 text-amber-800',
                    'C': 'bg-amber-100 text-amber-700',
                    'D': 'bg-orange-100 text-orange-800',
                    'F': 'bg-red-100 text-red-800'
                  };
                  const gradeTrend = data.grades.length > 1
                    ? (data.grades.indexOf(data.grades[data.grades.length - 1]) >= data.grades.indexOf(data.grades[0]) ? 'improving' : 'declining')
                    : 'new';
                  return (
                    <tr key={sId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{allStudents.find(s => s.id === sId)?.name || 'Unknown'}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-emerald-700">{data.studentId}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">{data.batchName}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-gray-700">{data.course}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${gradeColors[latestGrade] || 'bg-gray-100 text-gray-700'}`}>
                          {latestGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {gradeTrend === 'improving' ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><TrendingUp className="w-3.5 h-3.5" /> Improving</span>
                        ) : gradeTrend === 'declining' ? (
                          <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">↓ Declining</span>
                        ) : (
                          <span className="text-gray-400 text-xs">New</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700 font-medium">
                        {data.assignmentsSubmitted} / {data.totalRecords}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Attendance Percentage Section */}
      <Card className="p-6 border-l-4 border-l-cyan-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-gray-900">Student Attendance Overview (%)</h3>
          </div>
          <Badge variant="info">Percentage-wise</Badge>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Attendance percentage calculated per student across all their enrolled batches. Includes Present, Late, and Absent counts.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Student ID</th>
                <th className="py-3 px-4 font-semibold">Batch</th>
                <th className="py-3 px-4 font-semibold">Total Classes</th>
                <th className="py-3 px-4 font-semibold">Present</th>
                <th className="py-3 px-4 font-semibold">Late</th>
                <th className="py-3 px-4 font-semibold">Absent</th>
                <th className="py-3 px-4 font-semibold">Attendance %</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(() => {
                const attendanceMap = new Map<string, { present: number; late: number; absent: number; batchName: string; studentId: string }>();
                attendance.forEach((a) => {
                  const existing = attendanceMap.get(a.studentId);
                  if (existing) {
                    if (a.status === 'present') existing.present++;
                    else if (a.status === 'late') existing.late++;
                    else existing.absent++;
                  } else {
                    attendanceMap.set(a.studentId, {
                      present: a.status === 'present' ? 1 : 0,
                      late: a.status === 'late' ? 1 : 0,
                      absent: a.status === 'absent' ? 1 : 0,
                      batchName: a.batchName,
                      studentId: allStudents.find(s => s.id === a.studentId)?.studentId || 'MAAC-STU'
                    });
                  }
                });
                const entries = Array.from(attendanceMap.entries());
                if (entries.length === 0) {
                  return (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500 text-xs">
                        No attendance records found yet.
                      </td>
                    </tr>
                  );
                }
                return entries.map(([sId, data]) => {
                  const total = data.present + data.late + data.absent;
                  const attendancePct = total > 0 ? Math.round(((data.present + data.late) / total) * 100) : 0;
                  const barColor = attendancePct >= 85 ? 'bg-emerald-500' : attendancePct >= 70 ? 'bg-amber-500' : 'bg-red-500';
                  const statusText = attendancePct >= 85 ? 'Excellent' : attendancePct >= 70 ? 'Good' : attendancePct >= 50 ? 'Needs Improvement' : 'Critical';
                  const statusColor = attendancePct >= 85 ? 'text-emerald-700 bg-emerald-50' : attendancePct >= 70 ? 'text-amber-700 bg-amber-50' : attendancePct >= 50 ? 'text-orange-700 bg-orange-50' : 'text-red-700 bg-red-50';
                  return (
                    <tr key={sId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{allStudents.find(s => s.id === sId)?.name || 'Unknown'}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-emerald-700">{data.studentId}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">{data.batchName}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-gray-800">{total}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-emerald-700">{data.present}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-amber-600">{data.late}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-red-600">{data.absent}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${attendancePct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-800">{attendancePct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ===== MODALS ===== */}

      {/* Batch Detail Modal — shows all enrolled students */}
      {viewingBatch && (
        <Modal
          isOpen={!!viewingBatch}
          onClose={() => setViewingBatch(null)}
          title={`${viewingBatch.name} — Enrolled Students`}
          size="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl text-xs">
              <div>
                <span className="text-gray-500">Batch Code</span>
                <p className="font-mono font-bold text-purple-800">{viewingBatch.batchIdCode || `BATCH-${viewingBatch.id}`}</p>
              </div>
              <div>
                <span className="text-gray-500">Course</span>
                <p className="font-semibold text-gray-900">{viewingBatch.course}</p>
              </div>
              <div>
                <span className="text-gray-500">Schedule</span>
                <p className="font-semibold text-gray-900">{viewingBatch.startTime} - {viewingBatch.endTime}</p>
              </div>
              <div>
                <span className="text-gray-500">Days</span>
                <p className="font-semibold text-gray-900">{viewingBatch.days.join(', ')}</p>
              </div>
              <div>
                <span className="text-gray-500">Teacher</span>
                <p className="font-semibold text-gray-900">{viewingBatch.teacherName}</p>
              </div>
            </div>

            {viewingBatchStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No students enrolled in this batch yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Student Name</th>
                      <th className="py-2.5 px-3 font-semibold">Student ID</th>
                      <th className="py-2.5 px-3 font-semibold">Course Enrolled</th>
                      <th className="py-2.5 px-3 font-semibold">Admission Date</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Average Grade</th>
                      <th className="py-2.5 px-3 font-semibold">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewingBatchStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-500 text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.phone}</div>
                          {s.parentContact && (
                            <div className="text-xs text-gray-400 mt-0.5">Parent: {s.parentContact}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-xs font-mono text-emerald-700">{s.studentId || 'MAAC-STU'}</td>
                        <td className="py-2.5 px-3 text-xs font-semibold text-purple-700 bg-purple-50 rounded-md inline-block mt-1">
                          {s.course || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-gray-600">{s.admissionDate || s.joinDate}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={s.studentStatus === 'Active' ? 'success' : 'warning'}>
                            {s.studentStatus || 'Active'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          {(() => {
                            const gradeToNum: Record<string, number> = { 'A+': 10, 'A': 9, 'A-': 8, 'B+': 7, 'B': 6, 'B-': 5, 'C+': 4, 'C': 3, 'D': 2, 'F': 1 };
                            const numToGrade: Record<number, string> = { 10: 'A+', 9: 'A', 8: 'A-', 7: 'B+', 6: 'B', 5: 'B-', 4: 'C+', 3: 'C', 2: 'D', 1: 'F' };
                            const grades = attendance
                              .filter(a => a.studentId === s.id && a.batchId === viewingBatch.id && a.grade && gradeToNum[a.grade] !== undefined)
                              .map(a => gradeToNum[a.grade!]);
                            const avgGrade = grades.length > 0
                              ? numToGrade[Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)] || 'N/A'
                              : 'N/A';
                            const gradeColors: Record<string, string> = {
                              'A+': 'bg-emerald-100 text-emerald-800', 'A': 'bg-emerald-100 text-emerald-700',
                              'A-': 'bg-cyan-100 text-cyan-800', 'B+': 'bg-cyan-100 text-cyan-700',
                              'B': 'bg-amber-100 text-amber-800', 'B-': 'bg-amber-100 text-amber-700',
                              'C+': 'bg-orange-100 text-orange-800', 'C': 'bg-orange-100 text-orange-700',
                              'D': 'bg-red-100 text-red-700', 'F': 'bg-red-100 text-red-800'
                            };
                            return (
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${gradeColors[avgGrade] || 'bg-gray-100 text-gray-600'}`}>
                                {avgGrade}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-2.5 px-3">
                          {(() => {
                            const studentRecords = attendance.filter(
                              a => a.studentId === s.id && a.batchId === viewingBatch.id
                            );
                            const total = studentRecords.length;
                            const presentCount = studentRecords.filter(a => a.status === 'present' || a.status === 'late').length;
                            const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
                            const barColor = pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
                            return (
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                  <div className={`${barColor} h-full rounded-full`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-bold text-gray-800">{pct}%</span>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" onClick={() => setViewingBatch(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Initial Batch Assignment Modal */}
      {selectedStudentForBatch && (
        <Modal
          isOpen={!!selectedStudentForBatch}
          onClose={() => setSelectedStudentForBatch(null)}
          title={`Allocate Batch: ${studentBeingAssigned?.name}`}
        >
          <form onSubmit={handleAssignBatch} className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl text-xs text-amber-900 space-y-1">
              <p><strong>Candidate:</strong> {studentBeingAssigned?.name} ({studentBeingAssigned?.studentId})</p>
              <p><strong>Program:</strong> {studentBeingAssigned?.course}</p>
              <p><strong>Waiting for Module:</strong> {studentBeingAssigned?.waitingForModule || 'Module 1'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Target Batch for Student:
              </label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-900 font-medium"
                required
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchIdCode || b.id} - {b.name} ({b.course} | {b.startTime}-{b.endTime} | {b.room} | Enrolled: {b.enrolledStudents})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setSelectedStudentForBatch(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                Confirm Allocation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change / Transfer Batch Modal */}
      {studentForTransfer && (
        <Modal
          isOpen={!!studentForTransfer}
          onClose={() => setStudentForTransfer(null)}
          title={`Transfer / Change Batch: ${studentForTransfer.student.name}`}
          size="lg"
        >
          {(() => {
            const currentBatch = batches.find(b => b.id === studentForTransfer.currentBatchId);
            const targetBatch = batches.find(b => b.id === transferTargetBatchId);

            return (
              <form onSubmit={handleExecuteTransfer} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block">Candidate</span>
                    <strong className="text-gray-900 text-sm">{studentForTransfer.student.name}</strong>
                    <p className="text-emerald-700 font-mono font-medium">{studentForTransfer.student.studentId}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Current Batch</span>
                    <strong className="text-purple-900">{currentBatch ? currentBatch.name : 'Unassigned'}</strong>
                    <p className="text-gray-600">{currentBatch ? `${currentBatch.startTime}-${currentBatch.endTime} • ${currentBatch.room}` : ''}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Select New Target Batch *
                  </label>
                  <select
                    value={transferTargetBatchId}
                    onChange={(e) => setTransferTargetBatchId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-900 font-medium"
                    required
                  >
                    <option value="">-- Choose New Batch --</option>
                    {batches
                      .filter(b => b.id !== studentForTransfer.currentBatchId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchIdCode || b.id} - {b.name} ({b.startTime} - {b.endTime} | {b.room} | Faculty: {b.teacherName})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Reason for Batch Transfer *
                  </label>
                  <select
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-900"
                    required
                  >
                    <option value="Timing & Schedule Shift Request">Timing & Schedule Shift Request</option>
                    <option value="Module Advancement / Level Upgrade">Module Advancement / Level Upgrade</option>
                    <option value="Faculty / Teaching Preference">Faculty / Teaching Preference</option>
                    <option value="Lab / Software Suite Relocation">Lab / Software Suite Relocation</option>
                    <option value="Personal Request by Student / Guardian">Personal Request by Student / Guardian</option>
                    <option value="Practice / Doubt Class Realignment">Practice / Doubt Class Realignment</option>
                  </select>
                </div>

                {targetBatch && (
                  <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl text-xs space-y-1.5">
                    <p className="font-bold text-orange-950 flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-orange-600" />
                      Transfer Summary:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-gray-700">
                      <div>
                        <span className="text-gray-400">From: </span>
                        <strong>{currentBatch?.name || 'Unassigned'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">To: </span>
                        <strong className="text-emerald-800">{targetBatch.name}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">New Schedule: </span>
                        <span>{targetBatch.startTime} - {targetBatch.endTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">New Lab: </span>
                        <span>{targetBatch.room}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setStudentForTransfer(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5"
                  >
                    Confirm Batch Transfer
                  </Button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}

      {/* Curriculum Tracker student drilldown: full session-by-session matrix */}
      <StudentCurriculumModal
        student={trackerStudent}
        attendance={attendance}
        onClose={() => setTrackerStudent(null)}
      />
    </div>
  );
}

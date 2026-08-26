'use client';

import { motion } from 'framer-motion';
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
  ArrowLeftRight,
  UserCheck,
  List,
  LayoutGrid
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User as UserType, Batch } from '@/types';

type ScheduleView = 'day-mwf' | 'day-tts' | 'teacher';

export default function AcademicManagerDashboard() {
  const { batches, users, assignBatchToStudent, changeStudentBatch, students: storeStudents } = useStore();

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
          <p className="text-white/90 max-w-2xl text-sm md:text-base">
            Allocate newly admitted students to batches, perform batch transfers upon student request, and manage faculty scheduling.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Section 1: Students Waiting for Batch */}
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

      {/* Section 3: Batch Schedule Overview with 3 Views */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Institute Batches & Schedule Overview</h3>
            <p className="text-xs text-gray-500">Click any batch to see enrolled students with admission details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScheduleView('day-mwf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scheduleView === 'day-mwf'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              MWF (Mon/Wed/Fri)
            </button>
            <button
              onClick={() => setScheduleView('day-tts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scheduleView === 'day-tts'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              TTS (Tue/Thu/Sat)
            </button>
            <button
              onClick={() => setScheduleView('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scheduleView === 'teacher'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Teacher Wise
            </button>
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

      {/* ===== MODALS ===== */}

      {/* Batch Detail Modal — shows all enrolled students */}
      {viewingBatch && (
        <Modal
          isOpen={!!viewingBatch}
          onClose={() => setViewingBatch(null)}
          title={`${viewingBatch.name} — Enrolled Students`}
          size="lg"
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewingBatchStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-500 text-xs">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.phone}</div>
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
    </div>
  );
}

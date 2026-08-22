'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
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
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AcademicManagerDashboard() {
  const { batches, users, assignBatchToStudent } = useStore();
  const [selectedStudentForBatch, setSelectedStudentForBatch] = useState<string | null>(null);
  const [targetBatchId, setTargetBatchId] = useState<string>('');

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  const waitingStudents = students.filter(s => s.studentStatus === 'Waiting for Batch');

  const stats = [
    { title: 'Total Batches', value: batches.length, icon: <BookOpen className="w-6 h-6" />, color: 'purple' as const, trend: `${batches.filter(b => b.status === 'active').length} active` },
    { title: 'Total Teachers', value: teachers.length, icon: <Users className="w-6 h-6" />, color: 'cyan' as const, trend: 'All available' },
    { title: 'Waiting for Batch', value: waitingStudents.length, icon: <Clock className="w-6 h-6" />, color: 'orange' as const, trend: 'Requires allocation' },
    { title: 'Total Students', value: students.length, icon: <GraduationCap className="w-6 h-6" />, color: 'green' as const, trend: 'Enrolled across programs' },
  ];

  const teacherSchedule = teachers.map(teacher => {
    const teacherBatches = batches.filter(b => b.teacherId === teacher.id);
    return {
      name: teacher.name.split(' ')[0],
      batches: teacherBatches.length,
      students: teacherBatches.reduce((acc, b) => acc + b.enrolledStudents, 0),
      hours: teacherBatches.length * 3,
    };
  });

  const handleAssignBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentForBatch && targetBatchId) {
      assignBatchToStudent(selectedStudentForBatch, targetBatchId);
      setSelectedStudentForBatch(null);
      setTargetBatchId('');
    }
  };

  const studentBeingAssigned = students.find(s => s.id === selectedStudentForBatch);

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
            Academic Dean & Scheduling
          </div>
          <h1 className="text-3xl font-bold mb-2">Academic Operations & Batches 📊</h1>
          <p className="text-white/90 max-w-xl text-sm md:text-base">
            Assign newly admitted students to batches, track module completion progression, manage faculty workloads, and monitor class completion schedules.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Section 2: Students Waiting for Batch Notification Panel (Direct from notes) */}
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
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 shadow-sm"
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

      {/* Section 3: Batch Management & Scheduling Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Batch Scheduling & Progress Tracker</h3>
            <p className="text-xs text-gray-500">Classes completed, classes remaining, and practice/doubt class status</p>
          </div>
          <Badge variant="purple">Active Batches</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`p-4 rounded-2xl border transition-all ${
                batch.isPracticeDoubtClass
                  ? 'border-cyan-200 bg-cyan-50/40'
                  : 'border-gray-200 bg-white hover:shadow-md'
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
                  <p className="font-bold text-emerald-700">{batch.classesCompleted ?? 24} Classes</p>
                </div>
                <div>
                  <p className="text-gray-400">Classes Remaining</p>
                  <p className="font-bold text-orange-600">{batch.classesRemaining ?? 16} Classes</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                <span>Strength: <strong>{batch.enrolledStudents}/{batch.capacity}</strong></span>
                <span className="text-purple-600 font-medium">Lab: {batch.room}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Teacher Workload */}
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

        {/* Weekly Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Academic Summary</h3>
            <span className="text-xs text-gray-500">Real-time status</span>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Batch Capacity Utilization</span>
                <span className="font-bold text-orange-700">84%</span>
              </div>
              <div className="w-full bg-orange-200 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

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
          </div>
        </Card>
      </div>

      {/* Batch Assignment Modal */}
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-900"
                required
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchIdCode || b.id} - {b.name} ({b.course} | {b.startTime}-{b.endTime} | {b.room} | Capacity: {b.enrolledStudents}/{b.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setSelectedStudentForBatch(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                Confirm Allocation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Table';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Users,
  BookOpen
} from 'lucide-react';

export default function AttendancePage() {
  const { currentUser, attendance, batches, users, addAttendance, updateAttendance } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [studentTopics, setStudentTopics] = useState<Record<string, string>>({});
  const [studentAssignments, setStudentAssignments] = useState<Record<string, boolean>>({});
  const [studentGrades, setStudentGrades] = useState<Record<string, string>>({});

  const students = users.filter(u => u.role === 'student');

  const myBatches = currentUser?.role === 'teacher'
    ? batches.filter(b => b.teacherId === currentUser.id)
    : batches;

  // Auto-select first batch if none selected
  const activeBatchId = selectedBatch || (myBatches.length > 0 ? myBatches[0].id : '');
  const activeBatch = myBatches.find(b => b.id === activeBatchId);

  // Get students enrolled in the selected batch
  const batchStudents = useMemo(() => {
    if (!activeBatch) return [];
    return students.filter(s => activeBatch.studentIds.includes(s.id));
  }, [activeBatch, students]);

  // Get existing attendance records for the selected batch and date
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      const matchesDate = record.date === selectedDate;
      const matchesBatch = record.batchId === activeBatchId;
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      return matchesDate && matchesBatch && matchesStatus;
    });
  }, [attendance, selectedDate, activeBatchId, filterStatus]);

  // Merge batch students with their attendance records
  const studentAttendanceList = useMemo(() => {
    return batchStudents.map(student => {
      const record = filteredAttendance.find(a => a.studentId === student.id);
      return {
        student,
        attendanceRecord: record || null,
        status: record?.status || null
      };
    });
  }, [batchStudents, filteredAttendance]);

  // Stats for the selected batch and date
  const todayStats = useMemo(() => {
    const allRecords = attendance.filter(
      a => a.date === selectedDate && a.batchId === activeBatchId
    );
    return {
      total: batchStudents.length,
      marked: allRecords.length,
      present: allRecords.filter(a => a.status === 'present').length,
      absent: allRecords.filter(a => a.status === 'absent').length,
      late: allRecords.filter(a => a.status === 'late').length,
    };
  }, [attendance, selectedDate, activeBatchId, batchStudents]);

  const handleMarkAttendance = (
    studentId: string,
    studentName: string,
    status: 'present' | 'absent' | 'late',
    topic?: string,
    assignmentSubmitted?: boolean,
    grade?: string
  ) => {
    if (!activeBatch) return;

    const existingRecord = attendance.find(
      a => a.studentId === studentId && a.batchId === activeBatch.id && a.date === selectedDate
    );

    if (existingRecord) {
      updateAttendance(existingRecord.id, { status, topic, assignmentSubmitted, grade });
    } else {
      addAttendance({
        id: Date.now().toString() + studentId,
        studentId,
        studentName,
        batchId: activeBatch.id,
        batchName: activeBatch.name,
        date: selectedDate,
        status,
        topic: topic || '',
        assignmentSubmitted: assignmentSubmitted || false,
        grade: grade || '',
        markedBy: currentUser?.id || '',
        markedAt: new Date().toISOString()
      });
    }
  };

  const markAllPresent = () => {
    batchStudents.forEach(student => {
      handleMarkAttendance(student.id, student.name, 'present', selectedTopic || studentTopics[student.id] || '');
    });
  };

  // Available topics for the dropdown
  const topicOptions = [
    'Maya Interface Basics',
    'Viewport Navigation',
    'Polygon Modeling Fundamentals',
    'Character Rigging Intro',
    'Nuke Compositing Basics',
    'Houdini FX Fundamentals',
    'After Effects Motion Graphics',
    'Figma Design Principles',
    '3D Texturing & Shading',
    'Animation Walk Cycle',
    'Lighting & Rendering',
    'Roto & Paint Techniques',
    'Color Correction Basics',
    'Short Film Production',
    'Showreel Review Session'
  ];

  const getButtonStyle = (buttonType: string, currentStatus: string | null) => {
    const isActive = currentStatus === buttonType;
    switch (buttonType) {
      case 'present':
        return isActive
          ? 'bg-green-500 text-white shadow-md shadow-green-200'
          : 'bg-green-100 text-green-600 hover:bg-green-500 hover:text-white hover:shadow-md hover:shadow-green-200';
      case 'absent':
        return isActive
          ? 'bg-red-500 text-white shadow-md shadow-red-200'
          : 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-md hover:shadow-red-200';
      case 'late':
        return isActive
          ? 'bg-yellow-500 text-white shadow-md shadow-yellow-200'
          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white hover:shadow-md hover:shadow-yellow-200';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'present': return 'success' as const;
      case 'absent': return 'danger' as const;
      case 'late': return 'warning' as const;
      default: return 'default' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">Mark and track student attendance by batch</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            options={[
              { value: '', label: 'Select Batch' },
              ...myBatches.map(b => ({ value: b.id, label: `${b.name} (${b.course})` }))
            ]}
            className="w-full md:w-64"
          />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-48"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'present', label: 'Present' },
              { value: 'absent', label: 'Absent' },
              { value: 'late', label: 'Late' }
            ]}
            className="w-full md:w-48"
          />
          <Select
            value={selectedTopic}
            onChange={(e) => {
              const topic = e.target.value;
              setSelectedTopic(topic);
              // Auto-fill topic for all students in the batch
              if (topic) {
                const updatedTopics: Record<string, string> = {};
                batchStudents.forEach(s => { updatedTopics[s.id] = topic; });
                setStudentTopics(prev => ({ ...prev, ...updatedTopics }));
              }
            }}
            options={[
              { value: '', label: 'Select Topic' },
              ...topicOptions.map(t => ({ value: t, label: t }))
            ]}
            className="w-full md:w-56"
          />
        </div>
      </Card>

      {/* No Batch Selected State */}
      {!activeBatch && (
        <Card className="p-12">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Batch</h3>
            <p className="text-gray-500">Choose a batch above to view and mark attendance for its students.</p>
          </div>
        </Card>
      )}

      {/* Batch Selected - Show Attendance */}
      {activeBatch && (
        <>
          {/* Batch Info Bar */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeBatch.name}</h3>
                  <p className="text-sm text-gray-500">{activeBatch.course} • {activeBatch.teacherName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">📅 {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                <span className="text-gray-600">👥 {batchStudents.length} Students</span>
                <span className="text-gray-600">📍 {activeBatch.room}</span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: todayStats.total, color: 'bg-gray-500', icon: <Users className="w-5 h-5" /> },
              { label: 'Marked', value: todayStats.marked, color: 'bg-purple-500', icon: <Calendar className="w-5 h-5" /> },
              { label: 'Present', value: todayStats.present, color: 'bg-green-500', icon: <CheckCircle className="w-5 h-5" /> },
              { label: 'Absent', value: todayStats.absent, color: 'bg-red-500', icon: <XCircle className="w-5 h-5" /> },
              { label: 'Late', value: todayStats.late, color: 'bg-yellow-500', icon: <Clock className="w-5 h-5" /> },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          {currentUser?.role === 'teacher' && (
            <div className="flex gap-3">
              <Button onClick={markAllPresent}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Present
              </Button>
            </div>
          )}

          {/* Student Attendance Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Students in {activeBatch.name}
              </h3>
              <Badge variant="info">{batchStudents.length} students</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Attendance Status</th>
                    {currentUser?.role === 'teacher' && (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Topic Covered</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Assignment</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Mark Attendance</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentAttendanceList.length === 0 ? (
                    <tr>
                      <td colSpan={currentUser?.role === 'teacher' ? 8 : 4} className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No students enrolled in this batch yet.</p>
                      </td>
                    </tr>
                  ) : (
                    studentAttendanceList.map(({ student, attendanceRecord, status }, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-400">{student.phone || 'No phone'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadge(status)}>
                            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not Marked'}
                          </Badge>
                        </td>
                        {currentUser?.role === 'teacher' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs font-medium text-gray-800 bg-purple-50 px-2.5 py-1 rounded-lg">
                                {studentTopics[student.id] || attendanceRecord?.topic || selectedTopic || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => {
                                  const newVal = !(studentAssignments[student.id] ?? attendanceRecord?.assignmentSubmitted ?? false);
                                  setStudentAssignments(prev => ({ ...prev, [student.id]: newVal }));
                                  if (status) {
                                    handleMarkAttendance(student.id, student.name, status, studentTopics[student.id] || attendanceRecord?.topic, newVal, studentGrades[student.id] || attendanceRecord?.grade);
                                  }
                                }}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border-2 ${
                                  (studentAssignments[student.id] ?? attendanceRecord?.assignmentSubmitted ?? false)
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                                } hover:scale-110`}
                                title="Toggle Assignment Submitted"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <select
                                value={studentGrades[student.id] || attendanceRecord?.grade || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudentGrades(prev => ({ ...prev, [student.id]: val }));
                                  if (status) {
                                    handleMarkAttendance(student.id, student.name, status, studentTopics[student.id] || attendanceRecord?.topic, studentAssignments[student.id] ?? attendanceRecord?.assignmentSubmitted, val);
                                  }
                                }}
                                className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white font-semibold text-center"
                              >
                                <option value="">—</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="F">F</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                {(['present', 'absent', 'late'] as const).map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleMarkAttendance(student.id, student.name, s, studentTopics[student.id] || attendanceRecord?.topic, studentAssignments[student.id] ?? attendanceRecord?.assignmentSubmitted, studentGrades[student.id] || attendanceRecord?.grade)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${getButtonStyle(s, status)} hover:scale-110 border-2 ${status === s ? 'border-transparent' : 'border-transparent'}`}
                                    title={s.charAt(0).toUpperCase() + s.slice(1)}
                                  >
                                    {s === 'present' ? <CheckCircle className="w-5 h-5" /> :
                                     s === 'absent' ? <XCircle className="w-5 h-5" /> :
                                     <Clock className="w-5 h-5" />}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </>
                        )}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

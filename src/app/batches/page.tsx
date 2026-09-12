'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Sparkles,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  Layers,
  ListOrdered
} from 'lucide-react';
import { courseOptions, weekDays } from '@/lib/mockData';
import {
  SOFTWARE_DATABASE,
  getSoftwareList,
  findSoftwareDetails,
  getSoftwareSessionBreakdown,
  getSoftwareTotalSessions
} from '@/lib/softwareData';
import { Batch, User as UserType } from '@/types';

// ID generators kept outside the component so render stays pure
const generateBatchId = () => Date.now().toString();
const generateBatchCode = () => `MAAC-BAT-${Math.floor(10 + Math.random() * 90)}`;

export default function BatchesPage() {
  const { batches, addBatch, updateBatch, deleteBatch, users, currentUser, attendance, changeStudentBatch } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSchedule, setFilterSchedule] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterSoftware, setFilterSoftware] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Deep link: /batches?create=1 auto-opens the Create Batch wizard (Step 1)
  useEffect(() => {
    if (searchParams.get('create') === '1' && currentUser && currentUser.role !== 'counselor') {
      resetForm();
      setIsModalOpen(true);
      router.replace('/batches');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUser]);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null);
  const [viewingBreakdownBatch, setViewingBreakdownBatch] = useState<Batch | null>(null);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [newlyCreatedBatch, setNewlyCreatedBatch] = useState<Batch | null>(null);
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Step 2 (Add Students) filters
  const [studentFilterFaculty, setStudentFilterFaculty] = useState('all');
  const [studentFilterSchedule, setStudentFilterSchedule] = useState('all');
  const [studentFilterBatchProgress, setStudentFilterBatchProgress] = useState('all');

  // Transfer Modal State
  const [studentForTransfer, setStudentForTransfer] = useState<{
    student: UserType;
    currentBatchId: string;
  } | null>(null);
  const [transferTargetBatchId, setTransferTargetBatchId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('Timing & Schedule Shift Request');
  const [formData, setFormData] = useState({
    batchIdCode: 'MAAC-BAT-01',
    name: '',
    course: '',
    teacherId: '',
    startTime: '09:00',
    endTime: '12:00',
    days: [] as string[],
    capacity: 999,
    startDate: '',
    endDate: '',
    room: '',
    classesCompleted: 0,
    classesRemaining: 16,
    isPracticeDoubtClass: false
  });

  if (currentUser?.role === 'counselor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 max-w-md text-sm">
          Batch scheduling and management is restricted to <strong>Academic Managers</strong> and <strong>Teachers</strong>. Counselors have rights for student admissions, inquiry leads, and student master profiles.
        </p>
      </div>
    );
  }

  const teachers = users.filter(u => u.role === 'teacher');

  // Helper: get all batches a student is currently enrolled in
  const getStudentBatches = (studentId: string) =>
    batches.filter(b => b.studentIds.includes(studentId));

  // Helper: check if batch schedule is MWF or TTS
  const batchMatchesSchedule = (batch: Batch, schedule: 'mwf' | 'tts') => {
    const batchDays = batch.days.map(d => d.toLowerCase());
    if (schedule === 'mwf') {
      return batchDays.includes('monday') || batchDays.includes('wednesday') || batchDays.includes('friday');
    }
    return batchDays.includes('tuesday') || batchDays.includes('thursday') || batchDays.includes('saturday');
  };

  // Helper: check if student has any batch about to complete
  const hasAboutToCompleteBatch = (studentId: string) =>
    getStudentBatches(studentId).some(b => (b.classesCompleted ?? 0) > 0 && (b.classesCompleted ?? 0) >= (b.classesRemaining ?? 0));

  const filteredBatches = batches.filter(batch => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.batchIdCode && batch.batchIdCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      batch.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    const matchesSoftware = filterSoftware === 'all' || batch.course.toLowerCase() === filterSoftware.toLowerCase();

    // Schedule filter: MWF (Mon/Wed/Fri) or TTS (Tue/Thu/Sat)
    const batchDays = batch.days.map(d => d.toLowerCase());
    let matchesSchedule = true;
    if (filterSchedule === 'mwf') {
      matchesSchedule = batchDays.includes('monday') || batchDays.includes('wednesday') || batchDays.includes('friday');
    } else if (filterSchedule === 'tts') {
      matchesSchedule = batchDays.includes('tuesday') || batchDays.includes('thursday') || batchDays.includes('saturday');
    }

    // Teacher filter
    const matchesTeacher = filterTeacher === 'all' || batch.teacherId === filterTeacher;

    return matchesSearch && matchesStatus && matchesSoftware && matchesSchedule && matchesTeacher;
  });

  const handleSoftwareSelectChange = (softwareName: string) => {
    const sw = findSoftwareDetails(softwareName);
    const total = sw ? sw.totalSessions : 16;
    setFormData(prev => ({
      ...prev,
      course: softwareName,
      classesRemaining: total,
      name: prev.name ? prev.name : sw ? `${sw.name} Batch` : ''
    }));
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === formData.teacherId);
    if (editingBatch) {
      updateBatch(editingBatch.id, {
        ...formData,
        teacherName: teacher?.name || ''
      });
      setIsModalOpen(false);
      setEditingBatch(null);
      resetForm();
      return;
    }
    const newBatch: Batch = {
      id: generateBatchId(),
      ...formData,
      teacherName: teacher?.name || '',
      enrolledStudents: 0,
      studentIds: [],
      status: 'upcoming'
    };
    addBatch(newBatch);
    setNewlyCreatedBatch(newBatch);
    setCreateStep(2);
  };

  // FINAL action: create the batch. Adds any selected students first, then closes the wizard.
  // Always enabled — a batch can be created with zero students and enrolled later.
  const handleFinishCreateBatch = () => {
    if (!newlyCreatedBatch) return;
    const alreadyEnrolled = new Set(newlyCreatedBatch.studentIds);
    const toAdd = Array.from(selectedStudents).filter(id => !alreadyEnrolled.has(id));
    if (toAdd.length > 0) {
      const updatedStudentIds = [...newlyCreatedBatch.studentIds, ...toAdd];
      updateBatch(newlyCreatedBatch.id, {
        studentIds: updatedStudentIds,
        enrolledStudents: updatedStudentIds.length
      });
    }
    // Batch is already persisted to MongoDB (addBatch in Step 1 / updateBatch above)
    setIsModalOpen(false);
    resetForm();
  };

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleCancelCreate = () => {
    if (newlyCreatedBatch && createStep === 2) {
      // Roll back the batch if user cancels after creation
      deleteBatch(newlyCreatedBatch.id);
      setNewlyCreatedBatch(null);
    }
    setCreateStep(1);
    setSelectedStudents(new Set());
    setSearchStudentTerm('');
    setStudentFilterFaculty('all');
    setStudentFilterSchedule('all');
    setStudentFilterBatchProgress('all');
  };

  const resetForm = () => {
    setFormData({
      batchIdCode: generateBatchCode(),
      name: '',
      course: '',
      teacherId: '',
      startTime: '09:00',
      endTime: '12:00',
      days: [],
      capacity: 999,
      startDate: '',
      endDate: '',
      room: '',
      classesCompleted: 0,
      classesRemaining: 30,
      isPracticeDoubtClass: false
    });
    setCreateStep(1);
    setNewlyCreatedBatch(null);
    setSelectedStudents(new Set());
    setSearchStudentTerm('');
    setStudentFilterFaculty('all');
    setStudentFilterSchedule('all');
    setStudentFilterBatchProgress('all');
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      batchIdCode: batch.batchIdCode || `MAAC-BAT-${batch.id}`,
      name: batch.name,
      course: batch.course,
      teacherId: batch.teacherId,
      startTime: batch.startTime,
      endTime: batch.endTime,
      days: batch.days,
      capacity: batch.capacity || 999,
      startDate: batch.startDate,
      endDate: batch.endDate,
      room: batch.room,
      classesCompleted: batch.classesCompleted || 0,
      classesRemaining: batch.classesRemaining || 30,
      isPracticeDoubtClass: !!batch.isPracticeDoubtClass
    });
    setCreateStep(1);
    setIsModalOpen(true);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Management & Scheduling</h1>
          <p className="text-gray-500 mt-1">Configure class batches, transfer students, assign lab rooms, and schedule practice classes</p>
        </div>
        {(currentUser?.role === 'admin' || currentUser?.role === 'academic-manager') ? (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Create New Batch
          </Button>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            Batches are created by the Academic Manager
          </span>
        )}
      </motion.div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches by ID, name, course, teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none text-gray-900"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' }
            ]}
            className="w-full md:w-36"
          />
          <Select
            value={filterSoftware}
            onChange={(e) => setFilterSoftware(e.target.value)}
            options={[
              { value: 'all', label: 'All Software' },
              ...SOFTWARE_DATABASE.map(s => ({ value: s.name, label: s.name }))
            ]}
            className="w-full md:w-48"
          />
          <Select
            value={filterSchedule}
            onChange={(e) => setFilterSchedule(e.target.value)}
            options={[
              { value: 'all', label: 'All Schedules' },
              { value: 'mwf', label: 'MWF (Mon/Wed/Fri)' },
              { value: 'tts', label: 'TTS (Tue/Thu/Sat)' }
            ]}
            className="w-full md:w-44"
          />
          <Select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            options={[
              { value: 'all', label: 'All Teachers' },
              ...teachers.map(t => ({ value: t.id, label: t.name }))
            ]}
            className="w-full md:w-44"
          />
        </div>
      </Card>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBatches.map((batch, index) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <Card className="p-6 h-full flex flex-col justify-between" gradient>
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">
                      {batch.batchIdCode || `BATCH-${batch.id}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {batch.isPracticeDoubtClass && (
                        <Badge variant="info">Practice/Doubt</Badge>
                      )}
                      <Badge variant={batch.status === 'active' ? 'success' : batch.status === 'upcoming' ? 'info' : 'default'}>
                        {batch.status}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-0.5">{batch.name}</h3>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                      Software: {batch.course}
                    </span>
                    <button
                      onClick={() => setViewingBreakdownBatch(batch)}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {getSoftwareTotalSessions(batch.course)} Sessions
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Faculty: <strong>{batch.teacherName}</strong></p>

                  <div className="space-y-2 mb-4 text-xs bg-gray-50/80 p-3 rounded-xl">
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-3.5 h-3.5 mr-2 text-purple-500 shrink-0" />
                      <span>{batch.startTime} - {batch.endTime}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="w-3.5 h-3.5 mr-2 text-cyan-500 shrink-0" />
                      <span>{batch.enrolledStudents} Students Enrolled</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-green-500 shrink-0" />
                      <span>{batch.room}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-orange-500 shrink-0" />
                      <span>{batch.days.join(', ')}</span>
                    </div>
                  </div>

                  {/* Class Scheduling Progress (Section 3 of handwritten note) */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-purple-50/60 rounded-xl text-xs mb-4">
                    <div>
                      <p className="text-gray-500 text-[11px]">Sessions Completed</p>
                      <p className="font-bold text-emerald-700">{batch.classesCompleted ?? 0} / {getSoftwareTotalSessions(batch.course)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[11px]">Sessions Left</p>
                      <p className="font-bold text-orange-600">{batch.classesRemaining ?? getSoftwareTotalSessions(batch.course)} Sessions</p>
                    </div>
                  </div>

                  {/* Eye-catching Attendance quick action (Teachers) */}
                  {currentUser?.role === 'teacher' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => router.push(`/attendance?batch=${batch.id}`)}
                      className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-shadow duration-300"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Mark Attendance
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}

                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-purple-700 border-purple-200 hover:bg-purple-50 font-semibold"
                    onClick={() => setViewingBreakdownBatch(batch)}
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    View Session Breakdown ({getSoftwareTotalSessions(batch.course)} Topics)
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => openEditModal(batch)}>
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => setViewingBatch(batch)}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Students ({batch.enrolledStudents})
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteBatch(batch.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View Enrolled Students & 1-Click Transfer Modal */}
      <Modal
        isOpen={!!viewingBatch}
        onClose={() => setViewingBatch(null)}
        title={viewingBatch ? `Enrolled Students in ${viewingBatch.name} (${viewingBatch.enrolledStudents})` : 'Students'}
        size="2xl"
      >
        {viewingBatch && (() => {
          const batchStudents = users.filter(u => u.role === 'student' && viewingBatch.studentIds.includes(u.id));
          return (
            <div className="space-y-4">
              {batchStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No students enrolled in this batch yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
                      <tr>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Parent Contact</th>
                        <th className="py-2.5 px-3">Assignment Average Grade</th>
                        <th className="py-2.5 px-3">Attendance %</th>
                        <th className="py-2.5 px-3 text-right">Transfer Batch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batchStudents.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-900">{s.name}</td>
                          <td className="py-2 px-3 text-xs font-mono text-emerald-700">{s.studentId || 'MAAC-STU'}</td>
                          <td className="py-2 px-3 text-xs text-gray-600">{s.phone}</td>
                          <td className="py-2 px-3 text-xs text-gray-400">{s.parentContact || '—'}</td>
                          <td className="py-2 px-3">
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
                          <td className="py-2 px-3">
                            {(() => {
                              const recs = attendance.filter(a => a.studentId === s.id && a.batchId === viewingBatch.id);
                              const total = recs.length;
                              const presentCount = recs.filter(a => a.status === 'present' || a.status === 'late').length;
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
                          <td className="py-2 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setStudentForTransfer({
                                  student: s,
                                  currentBatchId: viewingBatch.id
                                });
                                const altBatch = batches.find(b => b.id !== viewingBatch.id && b.course === s.course) || batches[0];
                                setTransferTargetBatchId(altBatch?.id || '');
                              }}
                              className="text-xs px-2.5 py-1 text-orange-700 border-orange-200 hover:bg-orange-50 font-semibold"
                            >
                              <RefreshCw className="w-3.5 h-3.5 mr-1" />
                              Move
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Change / Transfer Batch Modal */}
      {studentForTransfer && (
        <Modal
          isOpen={!!studentForTransfer}
          onClose={() => setStudentForTransfer(null)}
          title={`Transfer / Change Batch: ${studentForTransfer.student.name}`}
          size="lg"
        >
          {(() => {
            const currentBatch = batches.find(b => b.id === studentForTransfer.currentBatchId || b.studentIds.includes(studentForTransfer.student.id));
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
                      .filter(b => b.id !== currentBatch?.id)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchIdCode || b.id} - {b.name} ({b.startTime} - {b.endTime} | {b.room} | Faculty: {b.teacherName} | Enrolled: {b.enrolledStudents})
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

      {/* Create/Edit Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (newlyCreatedBatch && createStep === 2) {
            deleteBatch(newlyCreatedBatch.id);
            setNewlyCreatedBatch(null);
          }
          setIsModalOpen(false);
          setEditingBatch(null);
          setCreateStep(1);
        }}
        title={editingBatch ? 'Edit Batch Configuration' : createStep === 2 ? `Add Students — ${newlyCreatedBatch?.name}` : 'Create New Batch & Schedule'}
        size="lg"
      >
        {editingBatch ? (
          /* ===== EDIT MODE ===== */
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitStep1(e); }} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Batch Code ID *"
                value={formData.batchIdCode}
                onChange={(e) => setFormData({ ...formData, batchIdCode: e.target.value })}
                placeholder="e.g. MAAC-ANI-01"
                required
              />
              <Input
                label="Batch Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Animation Premium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Software *"
                value={formData.course}
                onChange={(e) => handleSoftwareSelectChange(e.target.value)}
                options={[
                  { value: '', label: '-- Select Software --' },
                  ...SOFTWARE_DATABASE.map(s => ({
                    value: s.name,
                    label: `${s.name} (${s.totalSessions} Sessions) • ${s.category}`
                  }))
                ]}
                required
              />
              <Select
                label="Faculty / Teacher *"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                options={[
                  { value: '', label: 'Select Teacher' },
                  ...teachers.map(t => ({ value: t.id, label: t.name }))
                ]}
                required
              />
            </div>

            {/* Live Syllabus Breakdown Preview */}
            {(() => {
              const sw = findSoftwareDetails(formData.course);
              if (!sw) return null;
              return (
                <div className="p-3.5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-gray-900 text-xs">{sw.name} — Curriculum Breakdown</span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-800">
                      {sw.totalSessions} Sessions Defined
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">{sw.description}</p>
                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1 border-t border-purple-100 pt-2">
                    {sw.sessions.map((sess) => (
                      <div key={sess.sessionNumber} className="flex items-center gap-2 text-xs p-1.5 bg-white/90 rounded-lg">
                        <span className="font-mono font-bold text-purple-700 shrink-0 text-[11px]">Session {sess.sessionNumber}:</span>
                        <span className="text-gray-800 font-medium truncate">{sess.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Room / Lab *"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Lab 1 - Maya Studio"
                required
              />
              <Input
                label="Start Time *"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <Input
                label="End Time *"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Days *</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.days.includes(day)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Classes Completed"
                type="number"
                value={formData.classesCompleted.toString()}
                onChange={(e) => setFormData({ ...formData, classesCompleted: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Classes Remaining"
                type="number"
                value={formData.classesRemaining.toString()}
                onChange={(e) => setFormData({ ...formData, classesRemaining: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label="Expected End Date *"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-950">Practice / Doubt Class Option</p>
                <p className="text-xs text-cyan-700">Mark this batch as dedicated lab practice or doubt resolution session</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isPracticeDoubtClass}
                onChange={(e) => setFormData({ ...formData, isPracticeDoubtClass: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); setEditingBatch(null); }}>
                Cancel
              </Button>
              <Button type="submit">
                Update Batch
              </Button>
            </div>
          </form>
        ) : createStep === 1 ? (
          /* ===== CREATE STEP 1: Batch Details ===== */
          <form onSubmit={handleSubmitStep1} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl mb-2">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <div className="h-0.5 flex-1 bg-purple-200" />
              </div>
              <div className="flex items-center gap-1 ml-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
                <div className="h-0.5 flex-1 bg-gray-200" />
              </div>
              <span className="ml-auto text-xs text-gray-500">Step 1: Batch Details &rarr; Step 2: Add Students</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Batch Code ID *"
                value={formData.batchIdCode}
                onChange={(e) => setFormData({ ...formData, batchIdCode: e.target.value })}
                placeholder="e.g. MAAC-ANI-01"
                required
              />
              <Input
                label="Batch Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Photoshop Fundamentals"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Software (Curriculum Syllabus Basis) *"
                value={formData.course}
                onChange={(e) => handleSoftwareSelectChange(e.target.value)}
                options={[
                  { value: '', label: '-- Select Software --' },
                  ...SOFTWARE_DATABASE.map(s => ({
                    value: s.name,
                    label: `${s.name} (${s.totalSessions} Sessions) • ${s.category}`
                  }))
                ]}
                required
              />
              <Select
                label="Faculty / Teacher *"
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                options={[
                  { value: '', label: 'Select Teacher' },
                  ...teachers.map(t => ({ value: t.id, label: t.name }))
                ]}
                required
              />
            </div>

            {/* Live Syllabus Breakdown Preview */}
            {(() => {
              const sw = findSoftwareDetails(formData.course);
              if (!sw) return null;
              return (
                <div className="p-3.5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-gray-900 text-xs">{sw.name} — Curriculum Breakdown</span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-800">
                      {sw.totalSessions} Sessions Defined
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">{sw.description}</p>
                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1 border-t border-purple-100 pt-2">
                    {sw.sessions.map((sess) => (
                      <div key={sess.sessionNumber} className="flex items-center gap-2 text-xs p-1.5 bg-white/90 rounded-lg">
                        <span className="font-mono font-bold text-purple-700 shrink-0 text-[11px]">Session {sess.sessionNumber}:</span>
                        <span className="text-gray-800 font-medium truncate">{sess.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Room / Lab *"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g. Lab 1 - Maya Studio"
                required
              />
              <Input
                label="Start Time *"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <Input
                label="End Time *"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Days *</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.days.includes(day)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Classes Completed"
                type="number"
                value={formData.classesCompleted.toString()}
                onChange={(e) => setFormData({ ...formData, classesCompleted: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Classes Remaining"
                type="number"
                value={formData.classesRemaining.toString()}
                onChange={(e) => setFormData({ ...formData, classesRemaining: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label="Expected End Date *"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-950">Practice / Doubt Class Option</p>
                <p className="text-xs text-cyan-700">Mark this batch as dedicated lab practice or doubt resolution session</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isPracticeDoubtClass}
                onChange={(e) => setFormData({ ...formData, isPracticeDoubtClass: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Save & Go to Add Students
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        ) : (
          /* ===== CREATE STEP 2: Add Students to New Batch ===== */
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl mb-2">
              <div className="h-0.5 flex-1 bg-gray-200" />
              <div className="flex items-center gap-1 ml-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <div className="h-0.5 flex-1 bg-emerald-200" />
              </div>
              <span className="ml-auto text-xs text-gray-500">Step 2: Select Students &rarr; Save</span>
            </div>

            {/* New Batch Summary */}
            {newlyCreatedBatch && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div>
                  <p className="text-xs text-gray-500">New Batch Created</p>
                  <p className="font-bold text-gray-900">{newlyCreatedBatch.name}</p>
                  <p className="text-xs text-gray-500">
                    {newlyCreatedBatch.batchIdCode} &bull; {newlyCreatedBatch.course} &bull; {newlyCreatedBatch.startTime}-{newlyCreatedBatch.endTime} &bull; {newlyCreatedBatch.room}
                  </p>
                </div>
                <Badge variant="success">{newlyCreatedBatch.enrolledStudents} enrolled</Badge>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, ID, or course..."
                value={searchStudentTerm}
                onChange={(e) => setSearchStudentTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none text-gray-900"
              />
            </div>

            {/* Filters: Faculty, Schedule (MWF/TTS), About to Complete Batches */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                value={studentFilterFaculty}
                onChange={(e) => setStudentFilterFaculty(e.target.value)}
                options={[
                  { value: 'all', label: 'All Faculty' },
                  ...teachers.map(t => ({ value: t.id, label: t.name }))
                ]}
                className="w-full text-sm"
              />
              <Select
                value={studentFilterSchedule}
                onChange={(e) => setStudentFilterSchedule(e.target.value)}
                options={[
                  { value: 'all', label: 'All Schedules' },
                  { value: 'mwf', label: 'MWF (Mon/Wed/Fri)' },
                  { value: 'tts', label: 'TTS (Tue/Thu/Sat)' }
                ]}
                className="w-full text-sm"
              />
              <Select
                value={studentFilterBatchProgress}
                onChange={(e) => setStudentFilterBatchProgress(e.target.value)}
                options={[
                  { value: 'all', label: 'All Batch Progress' },
                  { value: 'about-to-complete', label: 'About to Complete Batches' }
                ]}
                className="w-full text-sm"
              />
            </div>
            {(studentFilterFaculty !== 'all' || studentFilterSchedule !== 'all' || studentFilterBatchProgress !== 'all') && (
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-gray-500">Filters active</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStudentFilterFaculty('all');
                    setStudentFilterSchedule('all');
                    setStudentFilterBatchProgress('all');
                  }}
                  className="text-purple-700 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Clear filters
                </Button>
              </div>
            )}

            {/* Selected count badge */}
            {selectedStudents.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl text-sm">
                <span className="text-emerald-800 font-medium">
                  {selectedStudents.size} student(s) selected to add
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudents(new Set())}
                  className="text-emerald-700 text-xs"
                >
                  Clear selection
                </Button>
              </div>
            )}

            {/* Student list */}
            {(() => {
              const allStudents = users.filter(u => u.role === 'student');
              const filtered = allStudents.filter(s => {
                const matchesSearch = !searchStudentTerm ||
                  s.name.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
                  (s.studentId && s.studentId.toLowerCase().includes(searchStudentTerm.toLowerCase())) ||
                  (s.course && s.course.toLowerCase().includes(searchStudentTerm.toLowerCase()));
                if (!matchesSearch) return false;

                const studentBatches = getStudentBatches(s.id);

                // Faculty filter: student is enrolled in at least one batch of this faculty
                if (studentFilterFaculty !== 'all' && !studentBatches.some(b => b.teacherId === studentFilterFaculty)) {
                  return false;
                }

                // Schedule filter: student is enrolled in at least one MWF or TTS batch
                if (studentFilterSchedule !== 'all' && !studentBatches.some(b => batchMatchesSchedule(b, studentFilterSchedule as 'mwf' | 'tts'))) {
                  return false;
                }

                // Batch progress filter: student is in a batch about to complete
                if (studentFilterBatchProgress === 'about-to-complete' && !hasAboutToCompleteBatch(s.id)) {
                  return false;
                }

                return true;
              });
              const alreadyEnrolled = new Set(newlyCreatedBatch?.studentIds || []);

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>No students found.</p>
                    {(studentFilterFaculty !== 'all' || studentFilterSchedule !== 'all' || studentFilterBatchProgress !== 'all' || searchStudentTerm) && (
                      <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                    )}
                  </div>
                );
              }

              return (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
                  {filtered.map(s => {
                    const isSelected = selectedStudents.has(s.id);
                    const isAlreadyEnrolled = alreadyEnrolled.has(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => { if (!isAlreadyEnrolled) toggleSelectStudent(s.id); }}
                        className={`flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                          isAlreadyEnrolled
                            ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                            : 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          isSelected ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}>
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500">
                            {s.studentId} &bull; {s.course || 'N/A'}
                            {isAlreadyEnrolled && <span className="ml-2 text-amber-600">Already enrolled</span>}
                          </p>
                          {(() => {
                            const sBatches = getStudentBatches(s.id);
                            if (sBatches.length === 0) return null;
                            return (
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                In: {sBatches.map(b => `${b.name} (${b.teacherName}, ${b.classesCompleted ?? 0}/${(b.classesCompleted ?? 0) + (b.classesRemaining ?? 0)})`).join(', ')}
                              </p>
                            );
                          })()}
                        </div>
                        {isAlreadyEnrolled ? (
                          <Badge variant="warning" className="shrink-0">Enrolled</Badge>
                        ) : (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600'
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <p className="text-[11px] text-gray-400 text-center">
              The batch is saved to the database even with no students — you can enroll students later from its batch card.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={handleCancelCreate}
                className="text-xs text-red-600 hover:bg-red-50 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Discard &amp; Start Over
              </Button>
              <Button
                onClick={handleFinishCreateBatch}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {selectedStudents.size > 0
                  ? `Create Batch with ${selectedStudents.size} Student(s)`
                  : 'Create Batch Now'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Software Session Breakdown Modal */}
      {viewingBreakdownBatch && (
        <Modal
          isOpen={!!viewingBreakdownBatch}
          onClose={() => setViewingBreakdownBatch(null)}
          title={`Software Curriculum & Session Breakdown — ${viewingBreakdownBatch.name}`}
          size="xl"
        >
          {(() => {
            const sw = findSoftwareDetails(viewingBreakdownBatch.course);
            const sessions = sw ? sw.sessions : getSoftwareSessionBreakdown(viewingBreakdownBatch.course);
            const completedCount = viewingBreakdownBatch.classesCompleted || 0;

            return (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-purple-500/20">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded text-xs font-mono font-bold">
                        {viewingBreakdownBatch.batchIdCode || `BATCH-${viewingBreakdownBatch.id}`}
                      </span>
                      <span className="text-xs text-white/90 font-medium">
                        {sw?.category || 'MAAC Academic Course'}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold">{sw?.name || viewingBreakdownBatch.course}</h4>
                    <p className="text-xs text-white/80 mt-0.5">Faculty: <strong>{viewingBreakdownBatch.teacherName}</strong> • Lab: <strong>{viewingBreakdownBatch.room}</strong> • Time: <strong>{viewingBreakdownBatch.startTime} - {viewingBreakdownBatch.endTime}</strong></p>
                  </div>
                  <div className="text-right sm:border-l sm:border-white/20 sm:pl-4">
                    <span className="text-3xl font-black">{sessions.length}</span>
                    <p className="text-xs text-white/80 font-medium">Total Sessions</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <span className="font-semibold">Syllabus Progress: <strong>{completedCount}</strong> of <strong>{sessions.length}</strong> sessions completed</span>
                    <span className="font-bold text-emerald-700">{Math.min(100, Math.round((completedCount / (sessions.length || 1)) * 100))}% syllabus covered</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((completedCount / (sessions.length || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-2xl">
                  {sessions.map((sess, idx) => {
                    const isCompleted = idx < completedCount;
                    return (
                      <div
                        key={sess.sessionNumber}
                        className={`p-3.5 flex items-start gap-3 transition-colors ${
                          isCompleted ? 'bg-emerald-50/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-purple-100 text-purple-700 font-mono'
                        }`}>
                          {isCompleted ? '✓' : sess.sessionNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-mono font-bold text-purple-700">Session {sess.sessionNumber}</p>
                              <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-950' : 'text-gray-900'}`}>
                                {sess.title}
                              </p>
                            </div>
                            <Badge variant={isCompleted ? 'success' : 'default'} className="text-[10px] shrink-0">
                              {isCompleted ? 'Completed' : 'Upcoming'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewingBreakdownBatch(null);
                      router.push(`/attendance?batch=${viewingBreakdownBatch.id}`);
                    }}
                    className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-bold"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-1.5" />
                    Mark Attendance For This Batch
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setViewingBreakdownBatch(null)}>
                    Close
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

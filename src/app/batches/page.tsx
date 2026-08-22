'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { courseOptions, weekDays } from '@/lib/mockData';
import { Batch } from '@/types';

export default function BatchesPage() {
  const { batches, addBatch, updateBatch, deleteBatch, users, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null);

  if (currentUser?.role === 'counselor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 text-2xl font-bold">
          🚫
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 max-w-md text-sm">
          Batch scheduling and management is restricted to <strong>Academic Managers</strong> and <strong>Teachers</strong>. Counselors have rights for student admissions, inquiry leads, and student master profiles.
        </p>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    batchIdCode: 'MAAC-BAT-01',
    name: '',
    course: '',
    teacherId: '',
    startTime: '09:00',
    endTime: '12:00',
    days: [] as string[],
    capacity: 30,
    startDate: '',
    endDate: '',
    room: '',
    classesCompleted: 0,
    classesRemaining: 30,
    isPracticeDoubtClass: false
  });

  const teachers = users.filter(u => u.role === 'teacher');

  const filteredBatches = batches.filter(batch => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.batchIdCode && batch.batchIdCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      batch.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === formData.teacherId);
    if (editingBatch) {
      updateBatch(editingBatch.id, {
        ...formData,
        teacherName: teacher?.name || ''
      });
    } else {
      addBatch({
        id: Date.now().toString(),
        ...formData,
        teacherName: teacher?.name || '',
        enrolledStudents: 0,
        studentIds: [],
        status: 'upcoming'
      });
    }
    setIsModalOpen(false);
    setEditingBatch(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      batchIdCode: `MAAC-BAT-${Math.floor(10 + Math.random() * 90)}`,
      name: '',
      course: '',
      teacherId: '',
      startTime: '09:00',
      endTime: '12:00',
      days: [],
      capacity: 30,
      startDate: '',
      endDate: '',
      room: '',
      classesCompleted: 0,
      classesRemaining: 30,
      isPracticeDoubtClass: false
    });
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
      capacity: batch.capacity,
      startDate: batch.startDate,
      endDate: batch.endDate,
      room: batch.room,
      classesCompleted: batch.classesCompleted || 0,
      classesRemaining: batch.classesRemaining || 30,
      isPracticeDoubtClass: !!batch.isPracticeDoubtClass
    });
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
          <p className="text-gray-500 mt-1">Configure class batches, schedules, rooms, and practice / doubt classes</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" />
          Create New Batch
        </Button>
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
            className="w-full md:w-48"
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
                  <p className="text-xs font-medium text-emerald-600 mb-3">{batch.course} • Faculty: {batch.teacherName}</p>

                  <div className="space-y-2 mb-4 text-xs bg-gray-50/80 p-3 rounded-xl">
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-3.5 h-3.5 mr-2 text-purple-500 shrink-0" />
                      <span>{batch.startTime} - {batch.endTime}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="w-3.5 h-3.5 mr-2 text-cyan-500 shrink-0" />
                      <span>{batch.enrolledStudents}/{batch.capacity} Students Enrolled</span>
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
                      <p className="text-gray-500 text-[11px]">Classes Done</p>
                      <p className="font-bold text-emerald-700">{batch.classesCompleted ?? 24} Sessions</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[11px]">Remaining</p>
                      <p className="font-bold text-orange-600">{batch.classesRemaining ?? 16} Sessions</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Occupancy</span>
                      <span className="font-medium">{Math.round((batch.enrolledStudents / batch.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(batch.enrolledStudents / batch.capacity) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1.5 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
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
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View Enrolled Students Modal */}
      <Modal
        isOpen={!!viewingBatch}
        onClose={() => setViewingBatch(null)}
        title={viewingBatch ? `Students in ${viewingBatch.name}` : 'Students'}
        size="lg"
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
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batchStudents.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-900">{s.name}</td>
                          <td className="py-2 px-3 text-xs font-mono text-emerald-700">{s.studentId || 'MAAC-STU'}</td>
                          <td className="py-2 px-3 text-xs text-gray-600">{s.phone}</td>
                          <td className="py-2 px-3">
                            <Badge variant="success">Active in Class</Badge>
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

      {/* Create/Edit Modal with Section 3 fields */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBatch(null); }}
        title={editingBatch ? 'Edit Batch Configuration' : 'Create New Batch & Schedule'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
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
              label="Course Program *"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              options={[
                { value: '', label: 'Select Course' },
                ...courseOptions.map(c => ({ value: c, label: c }))
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
              label="Batch Capacity *"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              min="1"
              required
            />
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

          {/* Section 3: Practice / Doubt Class Option */}
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
              {editingBatch ? 'Update Batch' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

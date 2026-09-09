'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Edit2,
  Eye,
  Award
} from 'lucide-react';

export default function TeachersPage() {
  const { users, batches } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teachers = users.filter(u => u.role === 'teacher');

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeacherBatches = (teacherId: string) => {
    return batches.filter(b => b.teacherId === teacherId);
  };

  const getTeacherStats = (teacherId: string) => {
    const teacherBatches = getTeacherBatches(teacherId);
    const totalStudents = teacherBatches.reduce((acc, b) => acc + b.enrolledStudents, 0);
    return {
      batches: teacherBatches.length,
      students: totalStudents,
      hours: teacherBatches.length * 3
    };
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
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 mt-1">Manage institute faculty members</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Teacher
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Teachers', value: teachers.length, color: 'bg-purple-500', icon: <Users className="w-5 h-5" /> },
          { label: 'Total Batches', value: batches.length, color: 'bg-cyan-500', icon: <BookOpen className="w-5 h-5" /> },
          { label: 'Avg Students/Teacher', value: Math.round(teachers.reduce((acc, t) => acc + getTeacherStats(t.id).students, 0) / teachers.length), color: 'bg-emerald-500', icon: <Award className="w-5 h-5" /> },
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

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>
      </Card>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher, index) => {
          const stats = getTeacherStats(teacher.id);
          const teacherBatches = getTeacherBatches(teacher.id);
          
          return (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full" gradient>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                    {teacher.name.charAt(0)}
                  </div>
                  <Badge variant={teacher.isActive ? 'success' : 'default'}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{teacher.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {teacher.email}
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {teacher.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Joined {new Date(teacher.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">{stats.batches}</p>
                    <p className="text-xs text-gray-500">Batches</p>
                  </div>
                  <div className="text-center p-2 bg-cyan-50 rounded-lg">
                    <p className="text-lg font-bold text-cyan-600">{stats.students}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <p className="text-lg font-bold text-emerald-600">{stats.hours}h</p>
                    <p className="text-xs text-gray-500">Weekly</p>
                  </div>
                </div>

                {/* Assigned Batches */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Assigned Batches</p>
                  <div className="flex flex-wrap gap-2">
                    {teacherBatches.map(batch => (
                      <Badge key={batch.id} variant="info">{batch.name.split(' ')[0]}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Profile
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Teacher"
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Enter teacher name" required />
            <Input label="Email" type="email" placeholder="Enter email" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Phone" placeholder="Enter phone number" />
            <Input label="Specialization" placeholder="e.g., Animation, VFX" />
          </div>
          <Input label="Join Date" type="date" required />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Teacher</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

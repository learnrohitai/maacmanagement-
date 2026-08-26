'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Table';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronRight,
  FileText
} from 'lucide-react';

export default function TeacherDashboard() {
  const { currentUser, batches, attendance, lessonPlans } = useStore();

  const myBatches = batches.filter(b => b.teacherId === currentUser?.id);
  const todayAttendance = attendance.filter(a => a.date === new Date().toISOString().split('T')[0]);
  const myLessonPlans = lessonPlans.filter(lp => lp.teacherId === currentUser?.id);

  const stats = [
    { title: 'My Batches', value: myBatches.length, icon: <BookOpen className="w-6 h-6" />, color: 'purple' as const, trend: 'Active' },
    { title: 'Total Students', value: myBatches.reduce((acc, b) => acc + b.enrolledStudents, 0), icon: <Users className="w-6 h-6" />, color: 'cyan' as const, trend: '+5 this week' },
    { title: 'Today\'s Classes', value: 3, icon: <Clock className="w-6 h-6" />, color: 'green' as const, trend: 'All scheduled' },
    { title: 'Attendance Marked', value: todayAttendance.length, icon: <CheckCircle className="w-6 h-6" />, color: 'orange' as const, trend: 'Pending: 2 batches' },
  ];

  const todaySchedule = [
    { time: '09:00 - 12:00', batch: 'Animation Premium', room: 'Lab 1', students: 25, status: 'completed' },
    { time: '14:00 - 16:00', batch: 'Graphic Design Basics', room: 'Lab 3', students: 18, status: 'ongoing' },
    { time: '16:00 - 18:00', batch: 'Animation Premium', room: 'Lab 1', students: 25, status: 'upcoming' },
  ];

  const pendingTasks = [
    { task: 'Mark attendance for Animation Premium', priority: 'high', due: 'Today' },
    { task: 'Update lesson plan for next week', priority: 'medium', due: 'Tomorrow' },
    { task: 'Submit weekly progress report', priority: 'low', due: 'Friday' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Good Morning, {currentUser?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-white/80">You have 3 classes scheduled today. Keep up the great work!</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h3>
            <Button variant="ghost" size="sm">View Calendar</Button>
          </div>
          <div className="space-y-4">
            {todaySchedule.map((schedule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border-l-4 ${
                  schedule.status === 'completed' ? 'border-green-500 bg-green-50/50' :
                  schedule.status === 'ongoing' ? 'border-purple-500 bg-purple-50/50' :
                  'border-gray-300 bg-gray-50/50'
                }`}
              >
                <div className="w-16 text-center">
                  <p className="text-sm font-bold text-gray-900">{schedule.time.split(' - ')[0]}</p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{schedule.batch}</p>
                  <p className="text-sm text-gray-500">{schedule.room} • {schedule.students} students</p>
                </div>
                <Badge variant={
                  schedule.status === 'completed' ? 'success' :
                  schedule.status === 'ongoing' ? 'info' :
                  'default'
                }>
                  {schedule.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Tasks</h3>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </Card>
      </div>

      {/* My Batches */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">My Batches</h3>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Batch
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBatches.map((batch, index) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{batch.name}</h4>
                  <p className="text-sm text-gray-500">{batch.course}</p>
                </div>
                <Badge variant={batch.status === 'active' ? 'success' : 'default'}>
                  {batch.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {batch.startTime} - {batch.endTime}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {batch.enrolledStudents} students
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {batch.days.join(', ')}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

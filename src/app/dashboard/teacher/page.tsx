'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  ClipboardList,
  ShieldCheck
} from 'lucide-react';

export default function TeacherDashboard() {
  const { currentUser, batches, attendance } = useStore();
  const router = useRouter();

  const myBatches = batches.filter(b => b.teacherId === currentUser?.id);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);

  // Today's day name (e.g. 'monday') to filter which of my batches run today
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Real schedule: only batches assigned to me that run today (or all if day doesn't match)
  const todaySchedule = myBatches
    .filter(b => b.days.map(d => d.toLowerCase()).includes(todayDayName))
    .map(b => {
      const marked = attendance.filter(a => a.batchId === b.id && a.date === today).length;
      return {
        id: b.id,
        time: `${b.startTime} - ${b.endTime}`,
        batch: b.name,
        course: b.course,
        room: b.room,
        students: b.enrolledStudents,
        status: marked > 0 ? 'completed' : new Date().getHours() >= parseInt(b.startTime) ? 'ongoing' : 'upcoming',
        markedCount: marked,
      };
    });

  const totalMyStudents = myBatches.reduce((acc, b) => acc + b.enrolledStudents, 0);

  const stats = [
    { title: 'My Batches', value: myBatches.length, icon: <BookOpen className="w-6 h-6" />, color: 'purple' as const, trend: 'Assigned by Academic' },
    { title: 'Total Students', value: totalMyStudents, icon: <Users className="w-6 h-6" />, color: 'cyan' as const, trend: 'Across all batches' },
    { title: "Today's Classes", value: todaySchedule.length, icon: <Clock className="w-6 h-6" />, color: 'green' as const, trend: 'Scheduled today' },
    {
      title: "Attendance Marked Today",
      value: todaySchedule.filter(s => s.markedCount > 0).length,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'orange' as const,
      trend: `${todaySchedule.filter(s => s.markedCount === 0).length} batch(es) pending`,
    },
  ];

  // Real pending tasks: only attendance-related, driven by actual data
  const pendingTasks = myBatches
    .filter(b => attendance.filter(a => a.batchId === b.id && a.date === today).length === 0)
    .slice(0, 5)
    .map(b => ({
      id: b.id,
      task: `Mark attendance for ${b.name}`,
      batchId: b.id,
      priority: 'high' as const,
      due: 'Today',
    }));

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
          <p className="text-white/80">
            You have {todaySchedule.length} class{todaySchedule.length === 1 ? '' : 'es'} scheduled today across {myBatches.length} assigned batch{myBatches.length === 1 ? '' : 'es'}.
          </p>
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
            <Badge variant="info">{todayDayName.slice(0, 3).toUpperCase()}</Badge>
          </div>
          <div className="space-y-4">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No batches scheduled for today.</p>
              </div>
            ) : (
              todaySchedule.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-l-4 ${
                    schedule.status === 'completed' ? 'border-green-500 bg-green-50/50' :
                    schedule.status === 'ongoing' ? 'border-purple-500 bg-purple-50/50' :
                    'border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="w-24 text-center">
                    <p className="text-xs font-bold text-gray-900">{schedule.time.split(' - ')[0]}</p>
                    <p className="text-[10px] text-gray-400">{schedule.time.split(' - ')[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{schedule.batch}</p>
                    <p className="text-sm text-gray-500">
                      {schedule.room} • {schedule.students} students
                      <span className="ml-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{schedule.course}</span>
                    </p>
                  </div>
                  <Badge variant={
                    schedule.status === 'completed' ? 'success' :
                    schedule.status === 'ongoing' ? 'info' :
                    'default'
                  }>
                    {schedule.status}
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Tasks</h3>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                <p className="text-sm">All attendance marked for today! 🎉</p>
              </div>
            ) : (
              pendingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/attendance?batch=${task.batchId}`)}
                  className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.task}</p>
                      <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* My Batches — assigned by Academic Manager */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Batches</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Software batches assigned to you by the Academic Manager
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            Batch creation is managed by Academic
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myBatches.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No batches assigned to you yet.</p>
              <p className="text-xs mt-1">The Academic Manager assigns software batches to faculty.</p>
            </div>
          ) : (
            myBatches.map((batch, index) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{batch.name}</h4>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Software: {batch.course}
                    </span>
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

                {/* Attendance quick action */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-semibold"
                    onClick={() => router.push(`/attendance?batch=${batch.id}`)}
                  >
                    <ClipboardList className="w-4 h-4 mr-1.5" />
                    Attendance
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

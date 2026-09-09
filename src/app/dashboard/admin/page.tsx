'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  IndianRupee,
  MoreVertical
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const attendanceData = [
  { day: 'Mon', present: 142, absent: 14 },
  { day: 'Tue', present: 138, absent: 18 },
  { day: 'Wed', present: 145, absent: 11 },
  { day: 'Thu', present: 140, absent: 16 },
  { day: 'Fri', present: 135, absent: 21 },
  { day: 'Sat', present: 120, absent: 36 },
];

const courseDistribution = [
  { name: 'Animation', value: 45, color: '#8b5cf6' },
  { name: 'VFX', value: 35, color: '#06b6d4' },
  { name: 'Graphic Design', value: 25, color: '#10b981' },
  { name: 'Motion Graphics', value: 20, color: '#f59e0b' },
  { name: 'Game Design', value: 15, color: '#ef4444' },
];

const recentActivities = [
  { id: 1, action: 'New student enrolled', student: 'Rahul Verma', batch: 'Animation Premium', time: '5 mins ago', type: 'enrollment' },
  { id: 2, action: 'Fee payment received', student: 'Priya Singh', batch: 'VFX Professional', time: '15 mins ago', type: 'payment' },
  { id: 3, action: 'Attendance marked', student: 'Amit Kumar', batch: 'Animation Premium', time: '1 hour ago', type: 'attendance' },
  { id: 4, action: 'Lesson plan updated', student: 'Rahul Sharma', batch: 'Animation Premium', time: '2 hours ago', type: 'lesson' },
];

export default function AdminDashboard() {
  const { dashboardStats, batches, students } = useStore();

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
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening at your institute.</p>
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
        <StatCard
          title="Total Students"
          value={dashboardStats.totalStudents}
          icon={<GraduationCap className="w-6 h-6" />}
          color="purple"
          trend="+12% from last month"
        />
        <StatCard
          title="Active Batches"
          value={dashboardStats.activeBatches}
          icon={<BookOpen className="w-6 h-6" />}
          color="cyan"
          trend="+2 new this week"
        />
        <StatCard
          title="Attendance Today"
          value={dashboardStats.attendanceToday}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          trend="92% present"
        />

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
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
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Distribution</h3>
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
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                <span className="text-sm text-gray-600">{course.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</a>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'enrollment' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                  activity.type === 'attendance' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {activity.type === 'enrollment' ? <GraduationCap className="w-5 h-5" /> :
                   activity.type === 'payment' ? <IndianRupee className="w-5 h-5" /> :
                   activity.type === 'attendance' ? <Calendar className="w-5 h-5" /> :
                   <BookOpen className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.student} • {activity.batch}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

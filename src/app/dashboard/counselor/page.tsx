'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  UserCheck,
  UserPlus,
  PhoneCall,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Send,
  GraduationCap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { InquiryLead } from '@/types';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export default function CounselorDashboard() {
  const { inquiries, addInquiry, updateInquiry, batches } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    interestedCourse: 'Animation',
    source: 'Walk-in' as InquiryLead['source'],
    notes: '',
    followUpDate: new Date().toISOString().split('T')[0],
    budget: 75000,
  });

  const totalInquiries = inquiries.length;
  const enrolledCount = inquiries.filter(i => i.status === 'enrolled').length;
  const pendingFollowUps = inquiries.filter(i => i.status !== 'enrolled' && i.status !== 'lost').length;
  const conversionRate = totalInquiries > 0 ? Math.round((enrolledCount / totalInquiries) * 100) : 0;

  const stats = [
    {
      title: 'Total Inquiries',
      value: totalInquiries,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'purple' as const,
      trend: '+18% this month'
    },
    {
      title: 'Admissions Converted',
      value: enrolledCount,
      icon: <Award className="w-6 h-6" />,
      color: 'green' as const,
      trend: `${conversionRate}% conversion rate`
    },
    {
      title: 'Pending Follow-ups',
      value: pendingFollowUps,
      icon: <Clock className="w-6 h-6" />,
      color: 'orange' as const,
      trend: '4 scheduled today'
    },
    {
      title: 'Active Batches',
      value: batches.filter(b => b.status === 'active').length,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'cyan' as const,
      trend: 'Admissions open'
    }
  ];

  // Course Interest Breakdown Data
  const courseCountMap: Record<string, number> = {};
  inquiries.forEach(i => {
    courseCountMap[i.interestedCourse] = (courseCountMap[i.interestedCourse] || 0) + 1;
  });
  const courseData = Object.keys(courseCountMap).map(course => ({
    name: course,
    count: courseCountMap[course]
  }));

  // Lead Source Distribution Data
  const sourceCountMap: Record<string, number> = {};
  inquiries.forEach(i => {
    sourceCountMap[i.source] = (sourceCountMap[i.source] || 0) + 1;
  });
  const sourceData = Object.keys(sourceCountMap).map(source => ({
    name: source,
    value: sourceCountMap[source]
  }));

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch =
      i.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.phone.includes(searchTerm) ||
      i.interestedCourse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: InquiryLead = {
      id: `inq-${Date.now()}`,
      studentName: formData.studentName,
      phone: formData.phone,
      email: formData.email,
      interestedCourse: formData.interestedCourse,
      source: formData.source,
      status: 'new',
      counselorName: 'Priya Sharma',
      counselorId: '8',
      notes: formData.notes,
      followUpDate: formData.followUpDate,
      createdAt: new Date().toISOString().split('T')[0],
      budget: Number(formData.budget) || 0
    };
    addInquiry(newLead);
    setIsAddModalOpen(false);
    setFormData({
      studentName: '',
      phone: '',
      email: '',
      interestedCourse: 'Animation',
      source: 'Walk-in',
      notes: '',
      followUpDate: new Date().toISOString().split('T')[0],
      budget: 75000,
    });
  };

  const getStatusBadge = (status: InquiryLead['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="info">New Lead</Badge>;
      case 'contacted':
        return <Badge variant="warning">Contacted</Badge>;
      case 'counseling-scheduled':
        return <Badge variant="purple">Visit Scheduled</Badge>;
      case 'demo-booked':
        return <Badge variant="purple">Demo Booked</Badge>;
      case 'enrolled':
        return <Badge variant="success">Admitted 🎉</Badge>;
      case 'lost':
        return <Badge variant="danger">Dropped</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/10"
      >
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Admission & Counseling Hub
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Admission Counselor 🎓</h1>
            <p className="text-emerald-50 max-w-xl text-sm md:text-base">
              Track student inquiries, manage walk-ins, schedule counseling sessions, and guide future artists toward the right career program.
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shrink-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            New Walk-in / Inquiry
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Interest Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Interest Breakdown</h3>
              <p className="text-xs text-gray-500">Student inquiry volume by creative specialization</p>
            </div>
            <Badge variant="purple">Live Trends</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lead Source Pie Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Inquiry Channels</h3>
            <p className="text-xs text-gray-500 mb-4">Where prospective students discover MAAC</p>
          </div>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {sourceData.map((s, idx) => (
              <div key={s.name} className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Inquiry Leads Management Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Prospective Student Pipeline</h3>
            <p className="text-xs text-gray-500">Manage follow-ups, demos, and conversions</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="counseling-scheduled">Counseling Scheduled</option>
              <option value="demo-booked">Demo Booked</option>
              <option value="enrolled">Enrolled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Student / Candidate</th>
                <th className="py-3 px-4 font-semibold">Interested Program</th>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold">Follow-Up Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No inquiries found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900">{lead.studentName}</div>
                      <div className="text-xs text-gray-500">{lead.phone} • {lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {lead.interestedCourse}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {lead.followUpDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {lead.status !== 'enrolled' ? (
                        <button
                          onClick={() => updateInquiry(lead.id, { status: 'enrolled' })}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          Enroll
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Admitted
                        </span>
                      )}
                      {lead.status === 'new' && (
                        <button
                          onClick={() => updateInquiry(lead.id, { status: 'contacted' })}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Call
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add New Inquiry Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student Inquiry / Lead"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Candidate Full Name"
            placeholder="e.g. Sahil Verma"
            value={formData.studentName}
            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="candidate@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Interested Program
              </label>
              <select
                value={formData.interestedCourse}
                onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
              >
                <option value="Animation">3D Animation</option>
                <option value="VFX">VFX & Compositing</option>
                <option value="Game Design">Game Art & Design</option>
                <option value="Graphic Design">Graphic Design & UI/UX</option>
                <option value="Motion Graphics">Motion Graphics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as InquiryLead['source'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
              >
                <option value="Walk-in">Campus Walk-in</option>
                <option value="Website">Official Website</option>
                <option value="Social Media">Instagram / YouTube</option>
                <option value="Phone Call">Direct Phone Call</option>
                <option value="Referral">Alumni / Student Referral</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Follow-up Date"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              required
            />
            <Input
              label="Estimated Budget (INR)"
              type="number"
              value={formData.budget.toString()}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Counseling Notes & Student Background
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Candidate background, career aspirations, questions asked during session..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save Inquiry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

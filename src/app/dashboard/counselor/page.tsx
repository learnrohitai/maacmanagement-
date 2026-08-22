'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import AdmissionModal from '@/components/admission/AdmissionModal';
import {
  UserCheck,
  UserPlus,
  PhoneCall,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  GraduationCap,
  AlertCircle,
  FileSpreadsheet,
  Users,
  Eye
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
import { InquiryLead, StudentStatus, User as UserType } from '@/types';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export default function CounselorDashboard() {
  const { inquiries, addInquiry, updateInquiry, batches, users, students } = useStore();
  const [activeTab, setActiveTab] = useState<'leads' | 'admissions' | 'waiting'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [leadForAdmission, setLeadForAdmission] = useState<{ studentName?: string; phone?: string; email?: string; interestedCourse?: string } | undefined>(undefined);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<UserType | null>(null);

  // Form State for Quick Lead
  const [leadFormData, setLeadFormData] = useState({
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
  const enrolledStudents = students;
  const waitingForBatchStudents = students.filter(s => s.studentStatus === 'Waiting for Batch');
  const activeStudents = students.filter(s => s.studentStatus === 'Active');
  const totalAdmissionsCount = enrolledStudents.length;

  const stats = [
    {
      title: 'Total Inquiries',
      value: totalInquiries,
      icon: <UserCheck className="w-6 h-6" />,
      color: 'purple' as const,
      trend: `${inquiries.filter(i => i.status === 'new').length} new this week`
    },
    {
      title: 'Total Admissions',
      value: totalAdmissionsCount,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'green' as const,
      trend: `${activeStudents.length} active in class`
    },
    {
      title: 'Waiting for Batch',
      value: waitingForBatchStudents.length,
      icon: <Clock className="w-6 h-6" />,
      color: 'orange' as const,
      trend: 'AM notified for allocation'
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

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: InquiryLead = {
      id: `inq-${Date.now()}`,
      studentName: leadFormData.studentName,
      phone: leadFormData.phone,
      email: leadFormData.email,
      interestedCourse: leadFormData.interestedCourse,
      source: leadFormData.source,
      status: 'new',
      counselorName: 'Priya Sharma',
      counselorId: '8',
      notes: leadFormData.notes,
      followUpDate: leadFormData.followUpDate,
      createdAt: new Date().toISOString().split('T')[0],
      budget: Number(leadFormData.budget) || 0
    };
    addInquiry(newLead);
    setIsAddLeadModalOpen(false);
    setLeadFormData({
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

  const openAdmissionForLead = (lead: InquiryLead) => {
    setLeadForAdmission({
      studentName: lead.studentName,
      phone: lead.phone,
      email: lead.email,
      interestedCourse: lead.interestedCourse
    });
    updateInquiry(lead.id, { status: 'enrolled' });
    setIsAdmissionModalOpen(true);
  };

  const getStudentStatusBadge = (status?: StudentStatus) => {
    switch (status) {
      case 'Waiting for Batch':
        return <Badge variant="warning">⏳ Waiting for Batch</Badge>;
      case 'Active':
        return <Badge variant="success">✅ Active</Badge>;
      case 'On Hold/Pause':
        return <Badge variant="default">⏸️ On Hold/Pause</Badge>;
      case 'Course Completed':
        return <Badge variant="purple">🎓 Completed</Badge>;
      case 'Passout/Certificate':
        return <Badge variant="info">📜 Certificate Issued</Badge>;
      case 'Dropped (ADO/FDO)':
        return <Badge variant="danger">❌ Dropped</Badge>;
      default:
        return <Badge variant="default">Active</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Primary Actions Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/10"
      >
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Admission & Counseling Management Portal
            </div>
            <h1 className="text-3xl font-bold mb-2">Admission Counselor Desk 🎓</h1>
            <p className="text-emerald-50 max-w-xl text-sm md:text-base">
              Register new student admissions into the master database, manage prospective leads, track document submission, and coordinate batch assignments with Academic Managers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => {
                setLeadForAdmission(undefined);
                setIsAdmissionModalOpen(true);
              }}
              className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-xl font-bold text-sm px-5 py-3 rounded-xl border border-white"
            >
              <GraduationCap className="w-5 h-5 mr-2 text-emerald-600" />
              Create Admission
            </Button>
            <Button
              onClick={() => setIsAddLeadModalOpen(true)}
              className="bg-emerald-800/80 hover:bg-emerald-900 text-white shadow-lg text-sm px-4 py-3 rounded-xl border border-emerald-400/30"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Quick Walk-in Lead
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Students Waiting for Batch Notification Banner (Section 2 from notes) */}
      {waitingForBatchStudents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-base">
                  {waitingForBatchStudents.length} Student{waitingForBatchStudents.length > 1 ? 's' : ''} Waiting for Batch Assignment
                </h4>
                <p className="text-amber-800 text-xs mt-0.5">
                  Academic Manager has been notified. Newly admitted or module-completed candidates waiting for batch allocation:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {waitingForBatchStudents.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-900 shadow-sm">
                      <span>{s.name}</span>
                      <span className="text-amber-600 font-normal">({s.course} • {s.studentId || 'New'})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveTab('waiting')}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0"
            >
              View Queue
            </Button>
          </div>
        </motion.div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Program Interest Distribution</h3>
              <p className="text-xs text-gray-500">Breakdown of student admissions and inquiries by creative domain</p>
            </div>
            <Badge variant="purple">Live Statistics</Badge>
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

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Inquiry Lead Channels</h3>
            <p className="text-xs text-gray-500 mb-4">Channel attribution for admissions</p>
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

      {/* Main Tabbed Management Panel */}
      <Card className="p-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('admissions')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'admissions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎓 Student Master Database ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('waiting')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'waiting'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⏳ Waiting for Batch ({waitingForBatchStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'leads'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Inquiries & Leads ({inquiries.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Student Master Database Table (Section 1 from handwritten note) */}
        {activeTab === 'admissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student ID & Name</th>
                  <th className="py-3 px-4 font-semibold">Course & Admission Date</th>
                  <th className="py-3 px-4 font-semibold">Parent & Contact</th>
                  <th className="py-3 px-4 font-semibold">Student Status</th>
                  <th className="py-3 px-4 font-semibold">Fee Status & Due</th>
                  <th className="py-3 px-4 font-semibold">Documents</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students
                  .filter(s =>
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    s.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{student.name}</div>
                        <div className="text-xs text-emerald-700 font-mono font-medium">{student.studentId || 'MAAC-STU'}</div>
                        <div className="text-xs text-gray-400">{student.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-800">{student.course || 'Animation'}</div>
                        <div className="text-xs text-gray-500">Admitted: {student.admissionDate || student.joinDate}</div>
                        <div className="text-xs text-gray-400">Counselor: {student.counselorName || 'Priya Sharma'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-gray-800 text-xs font-medium">{student.parentName || 'Parent / Guardian'}</div>
                        <div className="text-xs text-gray-500">{student.parentContact || student.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStudentStatusBadge(student.studentStatus)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-gray-800">
                          ₹{student.feesPaid?.toLocaleString() || '0'} / ₹{student.totalFees?.toLocaleString() || '0'}
                        </div>
                        <span className={`inline-block text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          student.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : student.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.paymentStatus || 'Pending'}
                        </span>
                        {student.feesDueDate && (
                          <div className="text-[10px] text-gray-400 mt-0.5">Due: {student.feesDueDate}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-600">
                          {student.documentsSubmitted && student.documentsSubmitted.length > 0 ? (
                            <span className="text-emerald-700 font-medium">{student.documentsSubmitted.length} Verified ✓</span>
                          ) : (
                            <span className="text-amber-600">Pending</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedStudentDetail(student)}
                          className="text-xs px-2.5 py-1 text-gray-600 hover:text-emerald-700"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Students Waiting for Batch (Section 2 from handwritten note) */}
        {activeTab === 'waiting' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div>
                <strong>Section 2 Rule:</strong> These students have completed admission or module completion and are currently waiting for batch scheduling.
              </div>
              <Badge variant="warning">{waitingForBatchStudents.length} Waiting</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student ID & Name</th>
                    <th className="py-3 px-4 font-semibold">Enrolled Program</th>
                    <th className="py-3 px-4 font-semibold">Admission Date</th>
                    <th className="py-3 px-4 font-semibold">Waiting For Module</th>
                    <th className="py-3 px-4 font-semibold">Counselor</th>
                    <th className="py-3 px-4 font-semibold">Remarks</th>
                    <th className="py-3 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {waitingForBatchStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{s.name}</div>
                        <div className="text-xs font-mono text-emerald-700">{s.studentId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">{s.course}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">{s.admissionDate || s.joinDate}</td>
                      <td className="py-3.5 px-4 text-xs text-amber-800 font-medium">
                        {s.waitingForModule || 'Module 1: Foundation'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">{s.counselorName || 'Priya Sharma'}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 max-w-xs truncate">{s.remarks || 'No notes'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Badge variant="warning">AM Notified 🔔</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Leads Pipeline */}
        {activeTab === 'leads' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3 px-4 font-semibold">Interested Program</th>
                  <th className="py-3 px-4 font-semibold">Lead Source</th>
                  <th className="py-3 px-4 font-semibold">Stage</th>
                  <th className="py-3 px-4 font-semibold">Follow-Up Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Direct Admission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-900">{lead.studentName}</div>
                      <div className="text-xs text-gray-500">{lead.phone} • {lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{lead.interestedCourse}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{lead.source}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={lead.status === 'enrolled' ? 'success' : lead.status === 'new' ? 'info' : 'purple'}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">{lead.followUpDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      {lead.status !== 'enrolled' ? (
                        <button
                          onClick={() => openAdmissionForLead(lead)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all inline-flex items-center gap-1.5"
                        >
                          <GraduationCap className="w-4 h-4" />
                          Create Admission
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Admitted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Comprehensive Admission Modal (Section 1 of handwritten notes) */}
      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => {
          setIsAdmissionModalOpen(false);
          setLeadForAdmission(undefined);
        }}
        initialLead={leadForAdmission}
      />

      {/* Quick Lead Modal */}
      <Modal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        title="Record Quick Walk-in Inquiry"
      >
        <form onSubmit={handleAddLeadSubmit} className="space-y-4">
          <Input
            label="Candidate Name"
            placeholder="e.g. Sahil Verma"
            value={leadFormData.studentName}
            onChange={(e) => setLeadFormData({ ...leadFormData, studentName: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 00000"
              value={leadFormData.phone}
              onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="candidate@example.com"
              value={leadFormData.email}
              onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Program</label>
              <select
                value={leadFormData.interestedCourse}
                onChange={(e) => setLeadFormData({ ...leadFormData, interestedCourse: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm"
              >
                <option value="Animation">3D Animation</option>
                <option value="VFX">VFX & Compositing</option>
                <option value="Game Design">Game Art & Design</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Motion Graphics">Motion Graphics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
              <select
                value={leadFormData.source}
                onChange={(e) => setLeadFormData({ ...leadFormData, source: e.target.value as InquiryLead['source'] })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm"
              >
                <option value="Walk-in">Campus Walk-in</option>
                <option value="Website">Website</option>
                <option value="Social Media">Social Media</option>
                <option value="Phone Call">Phone Call</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAddLeadModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 text-white">Save Inquiry</Button>
          </div>
        </form>
      </Modal>

      {/* Student Profile Inspection Modal */}
      {selectedStudentDetail && (
        <Modal
          isOpen={!!selectedStudentDetail}
          onClose={() => setSelectedStudentDetail(null)}
          title={`Student Master Profile: ${selectedStudentDetail.name}`}
        >
          <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedStudentDetail.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedStudentDetail.name}</h3>
                <p className="text-xs font-mono text-emerald-800 font-semibold">{selectedStudentDetail.studentId || 'MAAC-STUDENT'}</p>
                <p className="text-xs text-gray-500">{selectedStudentDetail.course} • Admitted: {selectedStudentDetail.admissionDate || selectedStudentDetail.joinDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-gray-400">Student Status</p>
                <div className="mt-1">{getStudentStatusBadge(selectedStudentDetail.studentStatus)}</div>
              </div>
              <div>
                <p className="text-gray-400">Fees Status</p>
                <p className="font-bold text-gray-900 mt-1">₹{selectedStudentDetail.feesPaid?.toLocaleString()} / ₹{selectedStudentDetail.totalFees?.toLocaleString()} ({selectedStudentDetail.paymentStatus})</p>
              </div>
              <div>
                <p className="text-gray-400">Parent / Guardian</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.parentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Parent Contact</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.parentContact || selectedStudentDetail.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Counselor In-charge</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.counselorName || 'Priya Sharma'}</p>
              </div>
              <div>
                <p className="text-gray-400">Next Due Date</p>
                <p className="font-semibold text-gray-800">{selectedStudentDetail.feesDueDate || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Documents Submitted</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudentDetail.documentsSubmitted?.map(doc => (
                  <span key={doc} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    ✓ {doc}
                  </span>
                )) || <span className="text-xs text-gray-400">None recorded</span>}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Counselor Remarks</p>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl italic">
                &ldquo;{selectedStudentDetail.remarks || 'Standard enrollment.'}&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" onClick={() => setSelectedStudentDetail(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

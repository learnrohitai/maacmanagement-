'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Card, { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  BookOpen,
  Search,
  Eye,
  FileCheck2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { StudentStatus, User as UserType } from '@/types';

export default function CounselorDashboard() {
  const router = useRouter();
  const { students } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<UserType | null>(null);

  const totalAdmissionsCount = students.length;

  const stats = [
    {
      title: 'Total Admissions Recorded',
      value: totalAdmissionsCount,
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'green' as const,
      trend: `${totalAdmissionsCount} master entries`
    },
    {
      title: 'Enrolled Courses',
      value: '5 Programs',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'cyan' as const,
      trend: 'Animation, VFX, Gaming...'
    },
    {
      title: 'Admission Status',
      value: 'Active',
      icon: <FileCheck2 className="w-6 h-6" />,
      color: 'orange' as const,
      trend: 'Forwarding to AM'
    }
  ];

  // Course Admissions Breakdown Data
  const courseCountMap: Record<string, number> = {};
  students.forEach(s => {
    const course = s.course || 'Animation';
    courseCountMap[course] = (courseCountMap[course] || 0) + 1;
  });
  const courseData = Object.keys(courseCountMap).map(course => ({
    name: course,
    count: courseCountMap[course]
  }));

  const getStudentStatusBadge = (status?: StudentStatus) => {
    switch (status) {
      case 'Waiting for Batch':
        return <Badge variant="warning">⏳ Waiting for AM Batch</Badge>;
      case 'Active':
        return <Badge variant="success">✅ Active in Class</Badge>;
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

  const filteredAdmissions = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.includes(searchTerm))
  );

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
              MAAC Counselor Admission Portal
            </div>
            <h1 className="text-3xl font-bold mb-2">Counselor Admission Desk 🎓</h1>
            <p className="text-emerald-50 max-w-xl text-sm md:text-base">
              Create new student admissions, record candidate details, guardian contacts, and submitted documents. Admissions are submitted and automatically forwarded to Academic Managers for batch scheduling.
            </p>
          </div>
          <Button
            onClick={() => router.push('/admission/new')}
            className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-2xl font-bold text-base px-6 py-3.5 rounded-xl border border-white shrink-0"
          >
            <GraduationCap className="w-5 h-5 mr-2 text-emerald-600" />
            Create Admission
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
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Admissions by Course Program</h3>
              <p className="text-xs text-gray-500">Distribution of enrolled candidates across creative programs</p>
            </div>
            <Badge variant="purple">Master Records</Badge>
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
      </div>

      {/* Student Admissions Master Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recorded Student Admissions ({students.length})</h3>
            <p className="text-xs text-gray-500">Master database entries created by counselors</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/admission/new')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 mr-1" />
              New Admission
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs">
              <tr>
                <th className="py-3 px-4 font-semibold">Student ID & Name</th>
                <th className="py-3 px-4 font-semibold">Course & Admission Date</th>
                <th className="py-3 px-4 font-semibold">Parent & Contact</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Documents</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No admission records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((student) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
            </div>              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-gray-400">Student Status</p>
                <div className="mt-1">{getStudentStatusBadge(selectedStudentDetail.studentStatus)}</div>
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

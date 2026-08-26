'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Table';
import {
  Plus,
  Search,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  RefreshCw,
  ArrowRight,
  ArrowLeftRight
} from 'lucide-react';
import { StudentStatus, User as UserType } from '@/types';

export default function StudentsPage() {
  const router = useRouter();
  const { students, batches, deleteStudent, changeStudentBatch, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);

  // Batch Transfer Modal State
  const [studentForTransfer, setStudentForTransfer] = useState<{
    student: UserType;
    currentBatchId: string;
  } | null>(null);
  const [transferTargetBatchId, setTransferTargetBatchId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('Timing & Schedule Shift Request');

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.phone && student.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || student.studentStatus === statusFilter;
    const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

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

  const activeCount = students.filter(s => s.studentStatus === 'Active').length;
  const waitingCount = students.filter(s => s.studentStatus === 'Waiting for Batch').length;
  const completedCount = students.filter(s => s.studentStatus === 'Course Completed' || s.studentStatus === 'Passout/Certificate').length;

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
      if (selectedStudent && selectedStudent.id === studentForTransfer.student.id) {
        setSelectedStudent(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Master Database</h1>
          <p className="text-gray-500 mt-1">Complete institute student records, statuses, fee schedules, and batch allocations</p>
        </div>
        <Button
          onClick={() => router.push('/admission/new')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 font-bold"
        >
          <GraduationCap className="w-5 h-5 mr-2" />
          Create Admission
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enrolled', value: students.length, color: 'bg-purple-500' },
          { label: 'Active in Class', value: activeCount, color: 'bg-emerald-500' },
          { label: 'Waiting for Batch', value: waitingCount, color: 'bg-amber-500' },
          { label: 'Alumni / Certified', value: completedCount, color: 'bg-cyan-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Student Statuses</option>
            <option value="Waiting for Batch">⏳ Waiting for Batch</option>
            <option value="Active">✅ Active</option>
            <option value="On Hold/Pause">⏸️ On Hold / Pause</option>
            <option value="Course Completed">🎓 Course Completed</option>
            <option value="Passout/Certificate">📜 Passout / Certificate</option>
            <option value="Dropped (ADO/FDO)">❌ Dropped (ADO/FDO)</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Course Programs</option>
            <option value="Animation">3D Animation Film Making</option>
            <option value="VFX">VFX & Compositing</option>
            <option value="Game Design">Game Art & Design</option>
            <option value="Graphic Design">Graphic Design & UI/UX</option>
            <option value="Motion Graphics">Motion Graphics</option>
          </select>
        </div>
      </Card>

      {/* Main Student Master Database Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">Student ID & Name</th>
                <th className="py-3 px-4 font-semibold">Course & Admission Date</th>
                <th className="py-3 px-4 font-semibold">Parent & Contact</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Assigned Batch</th>
                <th className="py-3 px-4 font-semibold">Fee Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No student records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const assignedBatchIds = student.assignedBatches || [];
                  const assignedBatchNames = batches
                    .filter(b => assignedBatchIds.includes(b.id) || b.studentIds.includes(student.id))
                    .map(b => b.name);

                  const firstBatch = batches.find(b => assignedBatchIds.includes(b.id) || b.studentIds.includes(student.id));

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{student.name}</div>
                        <div className="text-xs font-mono text-emerald-700 font-bold">{student.studentId || 'MAAC-STU'}</div>
                        <div className="text-xs text-gray-400">{student.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{student.course || 'Animation'}</div>
                        <div className="text-xs text-gray-500">Admitted: {student.admissionDate || student.joinDate}</div>
                        <div className="text-xs text-gray-400">Counselor: {student.counselorName || 'Priya Sharma'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-gray-800">{student.parentName || 'Parent / Guardian'}</div>
                        <div className="text-xs text-gray-500">{student.parentContact || student.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getStudentStatusBadge(student.studentStatus)}
                      </td>
                      <td className="py-3.5 px-4">
                        {assignedBatchNames.length > 0 ? (
                          <div>
                            <div className="text-xs font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg inline-block">
                              {assignedBatchNames.join(', ')}
                            </div>
                            {firstBatch && (
                              <div className="text-[10px] text-gray-500 mt-0.5">{firstBatch.startTime}-{firstBatch.endTime} • {firstBatch.room}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                            Unassigned (Waiting)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-bold text-gray-900">
                          ₹{student.feesPaid?.toLocaleString() || '0'} / ₹{student.totalFees?.toLocaleString() || '0'}
                        </div>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-medium mt-0.5 ${
                          student.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : student.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setStudentForTransfer({
                                student,
                                currentBatchId: firstBatch?.id || ''
                              });
                              const altBatch = batches.find(b => b.id !== firstBatch?.id && b.course === student.course) || batches[0];
                              setTransferTargetBatchId(altBatch?.id || '');
                            }}
                            className="text-xs px-2.5 py-1 text-orange-700 hover:bg-orange-50 font-semibold"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            Transfer
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedStudent(student)}
                            className="text-xs px-2 py-1 text-gray-600 hover:text-emerald-700"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                          <button
                            onClick={() => deleteStudent(student.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Details Inspection Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Master Profile: ${selectedStudent.name}`}
        >
          <div className="space-y-5 text-sm max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-lg">{selectedStudent.name}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const curB = batches.find(b => selectedStudent.assignedBatches?.includes(b.id) || b.studentIds.includes(selectedStudent.id));
                      setStudentForTransfer({
                        student: selectedStudent,
                        currentBatchId: curB?.id || ''
                      });
                      const altBatch = batches.find(b => b.id !== curB?.id && b.course === selectedStudent.course) || batches[0];
                      setTransferTargetBatchId(altBatch?.id || '');
                    }}
                    className="text-xs px-2.5 py-1 text-orange-700 border-orange-200 hover:bg-orange-50 font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Change Batch
                  </Button>
                </div>
                <p className="text-xs font-mono text-emerald-800 font-bold">{selectedStudent.studentId || 'MAAC-STUDENT'}</p>
                <p className="text-xs text-gray-600">{selectedStudent.course} • Admitted: {selectedStudent.admissionDate || selectedStudent.joinDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-gray-400 font-medium">Student Status</p>
                <div className="mt-1">{getStudentStatusBadge(selectedStudent.studentStatus)}</div>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Fee / Payment</p>
                <p className="font-bold text-gray-900 mt-1">₹{selectedStudent.feesPaid?.toLocaleString()} / ₹{selectedStudent.totalFees?.toLocaleString()} ({selectedStudent.paymentStatus})</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Parent / Guardian</p>
                <p className="font-semibold text-gray-800">{selectedStudent.parentName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Parent Contact</p>
                <p className="font-semibold text-gray-800">{selectedStudent.parentContact || selectedStudent.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Assigned Batch</p>
                <p className="font-semibold text-purple-700">
                  {batches.filter(b => selectedStudent.assignedBatches?.includes(b.id) || b.studentIds.includes(selectedStudent.id)).map(b => b.name).join(', ') || 'Waiting for Batch'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Counselor In-charge</p>
                <p className="font-semibold text-gray-800">{selectedStudent.counselorName || 'Priya Sharma'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Documents Submitted</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.documentsSubmitted?.map(doc => (
                  <span key={doc} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    ✓ {doc}
                  </span>
                )) || <span className="text-xs text-gray-400">None recorded</span>}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Audit Remarks & Transfer Log</p>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl italic">
                &ldquo;{selectedStudent.remarks || 'Standard enrollment.'}&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

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
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  GraduationCap,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  CheckSquare,
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';
import { User as UserType, StudentStatus, PaymentStatus } from '@/types';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: {
    studentName?: string;
    phone?: string;
    email?: string;
    interestedCourse?: string;
  };
}

const AVAILABLE_DOCUMENTS = [
  '10th Marksheet',
  '12th Marksheet',
  'Aadhar Card / Govt ID',
  'Passport Size Photographs (x2)',
  'Address Proof',
  'Signed Admission Rules Form',
  'Portfolio / Previous Work'
];

export default function AdmissionModal({ isOpen, onClose, initialLead }: AdmissionModalProps) {
  const { addStudent, batches, currentUser } = useStore();

  // Generate next Student ID
  const defaultStudentId = `MAAC-2026-${Math.floor(100 + Math.random() * 900)}`;

  const [formData, setFormData] = useState({
    fullName: initialLead?.studentName || '',
    contactNo: initialLead?.phone || '',
    email: initialLead?.email || '',
    parentName: '',
    parentContact: '',
    dob: '2005-01-01',
    studentId: defaultStudentId,
    course: initialLead?.interestedCourse || 'Animation',
    admissionDate: new Date().toISOString().split('T')[0],
    counselorName: currentUser?.name || 'Priya Sharma',
    counselorId: currentUser?.id || '8',
    assignedBatch: '', // if empty, student status defaults to "Waiting for Batch"
    feesDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalFees: 120000,
    feesPaid: 35000,
    studentStatus: 'Waiting for Batch' as StudentStatus,
    profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    documentsSubmitted: ['10th Marksheet', '12th Marksheet', 'Aadhar Card / Govt ID', 'Signed Admission Rules Form'],
    remarks: 'New admission enrolled via counselor portal.',
    waitingForModule: 'Module 1: Foundation'
  });

  const handleDocToggle = (doc: string) => {
    setFormData(prev => {
      const exists = prev.documentsSubmitted.includes(doc);
      return {
        ...prev,
        documentsSubmitted: exists
          ? prev.documentsSubmitted.filter(d => d !== doc)
          : [...prev.documentsSubmitted, doc]
      };
    });
  };

  const calculatePaymentStatus = (total: number, paid: number): PaymentStatus => {
    if (paid >= total && total > 0) return 'Paid';
    if (paid > 0) return 'Partial';
    return 'Pending';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentStatus = calculatePaymentStatus(Number(formData.totalFees), Number(formData.feesPaid));
    const assignedBatches = formData.assignedBatch ? [formData.assignedBatch] : [];
    
    // Automatically set status to Active if batch is selected and status was Waiting for Batch
    let effectiveStatus = formData.studentStatus;
    if (assignedBatches.length > 0 && effectiveStatus === 'Waiting for Batch') {
      effectiveStatus = 'Active';
    }

    const newStudent: UserType = {
      id: `usr-${Date.now()}`,
      name: formData.fullName,
      email: formData.email,
      role: 'student',
      phone: formData.contactNo,
      joinDate: formData.admissionDate,
      isActive: effectiveStatus === 'Active' || effectiveStatus === 'Waiting for Batch',
      avatar: formData.profilePhoto,
      studentId: formData.studentId,
      parentName: formData.parentName,
      parentContact: formData.parentContact,
      dob: formData.dob,
      course: formData.course,
      admissionDate: formData.admissionDate,
      counselorName: formData.counselorName,
      counselorId: formData.counselorId,
      assignedBatches: assignedBatches,
      feesDueDate: formData.feesDueDate,
      totalFees: Number(formData.totalFees),
      feesPaid: Number(formData.feesPaid),
      paymentStatus: paymentStatus,
      studentStatus: effectiveStatus,
      documentsSubmitted: formData.documentsSubmitted,
      remarks: formData.remarks,
      waitingForModule: effectiveStatus === 'Waiting for Batch' ? formData.waitingForModule : undefined
    };

    addStudent(newStudent);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Student Admission (Master Database)"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[78vh] overflow-y-auto pr-2">
        {/* Form Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-800">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-emerald-900 mb-0.5">MAAC Admission Master Entry</strong>
            Fill in all required candidate & guardian details. If no batch is selected right now, the student is marked as <strong>&quot;Waiting for Batch&quot;</strong> and the Academic Manager will be notified to assign a batch.
          </div>
        </div>

        {/* Section 1: Candidate Basic Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
            <User className="w-4 h-4 text-emerald-600" />
            1. Student Candidate Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Rahul Verma"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Student ID Code *"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="e.g. MAAC-2026-001"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Contact No. *"
              placeholder="+91 98765 00000"
              value={formData.contactNo}
              onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
              required
            />
            <Input
              label="Email ID *"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Date of Birth (D.O.B.) *"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name *"
              placeholder="e.g. Suresh Verma"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              required
            />
            <Input
              label="Parent Contact No. *"
              placeholder="+91 98765 00001"
              value={formData.parentContact}
              onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Section 2: Course, Admission & Batch Allocation */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            2. Program, Counselor & Status
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Course Enrolled *
              </label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
              >
                <option value="Animation">3D Animation Film Making (ADVFX+ / 3D MAX)</option>
                <option value="VFX">VFX & Compositing (Nuke / Houdini)</option>
                <option value="Game Design">Game Art & Design (Unity / Unreal)</option>
                <option value="Graphic Design">Graphic Design & UI/UX</option>
                <option value="Motion Graphics">Motion Graphics & Broadcast</option>
              </select>
            </div>

            <Input
              label="Admission Date *"
              type="date"
              value={formData.admissionDate}
              onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
              required
            />

            <Input
              label="Counselor Name *"
              value={formData.counselorName}
              onChange={(e) => setFormData({ ...formData, counselorName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Initial Student Status
              </label>
              <div className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/70 text-sm text-amber-900 font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⏳ Waiting for Batch Allocation</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                New admissions automatically notify Academic Manager for batch scheduling.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Starting Module / Level
              </label>
              <input
                type="text"
                value={formData.waitingForModule}
                onChange={(e) => setFormData({ ...formData, waitingForModule: e.target.value })}
                placeholder="e.g. Module 1: Foundation"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Forwarded to Academic Manager (AM) for batch alignment.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Batch Assignment Rights Notice:</strong> Counselors record the candidate admission and fee collection. Batch scheduling & allocation is strictly processed by the <strong>Academic Manager (AM)</strong> to ensure batch capacity and timetable balance.
            </div>
          </div>
        </div>

        {/* Section 3: Fee & Payment Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            3. Fee & Payment Status
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Total Course Fee (INR) *"
              type="number"
              value={formData.totalFees.toString()}
              onChange={(e) => setFormData({ ...formData, totalFees: Number(e.target.value) })}
              required
            />
            <Input
              label="Initial Amount / Token Paid (INR) *"
              type="number"
              value={formData.feesPaid.toString()}
              onChange={(e) => setFormData({ ...formData, feesPaid: Number(e.target.value) })}
              required
            />
            <Input
              label="Next Fees Due Date *"
              type="date"
              value={formData.feesDueDate}
              onChange={(e) => setFormData({ ...formData, feesDueDate: e.target.value })}
              required
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-xs flex items-center justify-between text-gray-700">
            <span>
              Calculated Payment Status: <strong className="text-emerald-700 uppercase font-bold">{calculatePaymentStatus(formData.totalFees, formData.feesPaid)}</strong>
            </span>
            <span>
              Pending Balance: <strong>₹{(formData.totalFees - formData.feesPaid).toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Section 4: Documents Submitted & Remarks */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 border-b pb-1">
            <FileText className="w-4 h-4 text-emerald-600" />
            4. Documents Submitted & Notes
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checklist of Documents Received:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_DOCUMENTS.map((doc) => {
                const isChecked = formData.documentsSubmitted.includes(doc);
                return (
                  <label
                    key={doc}
                    onClick={() => handleDocToggle(doc)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{doc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Remarks & Admission Notes
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Any special remarks, batch timing preferences, previous experience..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-6"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Complete Admission Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}

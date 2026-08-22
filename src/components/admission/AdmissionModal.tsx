'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check
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
  { id: '10th Marksheet', label: '10th Standard Marksheet / Certificate' },
  { id: '12th Marksheet', label: '12th Standard Marksheet / Diploma' },
  { id: 'Aadhar Card / Govt ID', label: 'Aadhar Card / Passport / Govt ID' },
  { id: 'Passport Size Photographs (x2)', label: 'Passport Size Photographs (x2)' },
  { id: 'Address Proof', label: 'Address Proof (Electricity / Utility / Voter ID)' },
  { id: 'Signed Admission Rules Form', label: 'Signed MAAC Institute Rules & Policy Form' },
  { id: 'Portfolio / Previous Work', label: 'Creative Portfolio / Artwork / Showreel' }
];

const COURSES = [
  { id: 'Animation', name: '3D Animation Film Making (ADVFX+ / Maya)', duration: '24 Months' },
  { id: 'VFX', name: 'VFX & Compositing Professional (Nuke / Houdini)', duration: '18 Months' },
  { id: 'Game Design', name: 'Game Art, Design & Unreal Engine', duration: '18 Months' },
  { id: 'Graphic Design', name: 'Graphic Design, UI/UX & Web Master', duration: '12 Months' },
  { id: 'Motion Graphics', name: 'Motion Graphics & Broadcast Design', duration: '12 Months' }
];

export default function AdmissionModal({ isOpen, onClose, initialLead }: AdmissionModalProps) {
  const { addStudent, currentUser } = useStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Auto-generated ID Code
  const defaultStudentId = `MAAC-2026-${Math.floor(100 + Math.random() * 900)}`;

  const [formData, setFormData] = useState({
    fullName: initialLead?.studentName || '',
    contactNo: initialLead?.phone || '',
    email: initialLead?.email || '',
    parentName: '',
    parentContact: '',
    dob: '2005-01-15',
    studentId: defaultStudentId,
    course: initialLead?.interestedCourse || 'Animation',
    admissionDate: new Date().toISOString().split('T')[0],
    counselorName: currentUser?.name || 'Priya Sharma',
    counselorId: currentUser?.id || '8',
    feesDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalFees: 120000,
    feesPaid: 35000,
    profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    documentsSubmitted: [
      '10th Marksheet',
      '12th Marksheet',
      'Aadhar Card / Govt ID',
      'Signed Admission Rules Form'
    ],
    remarks: 'Candidate registered through Counselor Desk. Ready for Academic Manager batch scheduling.',
    waitingForModule: 'Module 1: Fundamentals & Foundation'
  });

  const handleDocToggle = (docId: string) => {
    setFormData(prev => {
      const exists = prev.documentsSubmitted.includes(docId);
      return {
        ...prev,
        documentsSubmitted: exists
          ? prev.documentsSubmitted.filter(d => d !== docId)
          : [...prev.documentsSubmitted, docId]
      };
    });
  };

  const calculatePaymentStatus = (total: number, paid: number): PaymentStatus => {
    if (paid >= total && total > 0) return 'Paid';
    if (paid > 0) return 'Partial';
    return 'Pending';
  };

  const balanceAmount = Math.max(0, Number(formData.totalFees) - Number(formData.feesPaid));
  const paymentStatus = calculatePaymentStatus(Number(formData.totalFees), Number(formData.feesPaid));

  const validateStep1 = () => {
    return formData.fullName.trim() !== '' && formData.contactNo.trim() !== '' && formData.email.trim() !== '';
  };

  const validateStep2 = () => {
    return Number(formData.totalFees) > 0 && Number(formData.feesPaid) >= 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStudent: UserType = {
      id: `usr-${Date.now()}`,
      name: formData.fullName,
      email: formData.email,
      role: 'student',
      phone: formData.contactNo,
      joinDate: formData.admissionDate,
      isActive: true,
      avatar: formData.profilePhoto,
      studentId: formData.studentId,
      parentName: formData.parentName,
      parentContact: formData.parentContact,
      dob: formData.dob,
      course: formData.course,
      admissionDate: formData.admissionDate,
      counselorName: formData.counselorName,
      counselorId: formData.counselorId,
      assignedBatches: [], // Handed over to Academic Manager
      feesDueDate: formData.feesDueDate,
      totalFees: Number(formData.totalFees),
      feesPaid: Number(formData.feesPaid),
      paymentStatus: paymentStatus,
      studentStatus: 'Waiting for Batch' as StudentStatus,
      documentsSubmitted: formData.documentsSubmitted,
      remarks: formData.remarks,
      waitingForModule: formData.waitingForModule
    };

    addStudent(newStudent);
    setCurrentStep(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Student Admission Entry"
      size="xl"
      noPadding
    >
      <div className="flex flex-col h-full">
        {/* Step Indicator Header */}
        <div className="bg-slate-900 text-white px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 1
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">Candidate & Guardian</p>
                <p className="text-[10px] text-slate-400">Basic information</p>
              </div>
            </button>

            <div className={`h-0.5 flex-1 mx-3 ${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => validateStep1() && setCurrentStep(2)}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 2
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">Program & Fees</p>
                <p className="text-[10px] text-slate-400">Course & initial token</p>
              </div>
            </button>

            <div className={`h-0.5 flex-1 mx-3 ${currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => validateStep1() && validateStep2() && setCurrentStep(3)}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                3
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">Documents & Handover</p>
                <p className="text-[10px] text-slate-400">Verification & AM queue</p>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 md:p-8 flex-1">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* STEP 1: Candidate & Guardian Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        Candidate & Guardian Details
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Please enter the student candidate&apos;s full name, contact numbers, and parent details.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                      {formData.studentId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Candidate Full Name *"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                    <Input
                      label="Student ID Code"
                      placeholder="e.g. MAAC-2026-001"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Student Contact No. *"
                      placeholder="+91 98765 00000"
                      value={formData.contactNo}
                      onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                      required
                    />
                    <Input
                      label="Student Email ID *"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <Input
                      label="Parent / Guardian Name"
                      placeholder="e.g. Ramesh Sharma (Father)"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    />
                    <Input
                      label="Parent Contact Number"
                      placeholder="+91 98765 00001"
                      value={formData.parentContact}
                      onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Program & Fees */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                        Program & Fee Structure
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select the enrolled specialization program and record initial token amount.
                      </p>
                    </div>
                  </div>

                  {/* Course Selector Grid */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Selected Course Program *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {COURSES.map((course) => {
                        const isSelected = formData.course === course.id;
                        return (
                          <div
                            key={course.id}
                            onClick={() => setFormData({ ...formData, course: course.id })}
                            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-gray-900">{course.name}</span>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                            <span className="text-[11px] text-gray-500 mt-1 block">Duration: {course.duration}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fee Inputs */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Total Course Fee (INR) *"
                        type="number"
                        value={formData.totalFees.toString()}
                        onChange={(e) => setFormData({ ...formData, totalFees: Number(e.target.value) })}
                        required
                      />
                      <Input
                        label="Initial Fee / Token Paid (INR) *"
                        type="number"
                        value={formData.feesPaid.toString()}
                        onChange={(e) => setFormData({ ...formData, feesPaid: Number(e.target.value) })}
                        required
                      />
                      <Input
                        label="Next Installment Due Date"
                        type="date"
                        value={formData.feesDueDate}
                        onChange={(e) => setFormData({ ...formData, feesDueDate: e.target.value })}
                      />
                    </div>

                    {/* Live Balance Summary */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500">Payment Status: </span>
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-md ${
                            paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : paymentStatus === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Remaining Balance: </span>
                        <strong className="text-gray-900 font-mono text-sm">₹{balanceAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Admission Date"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      required
                    />
                    <Input
                      label="Counselor In-charge"
                      value={formData.counselorName}
                      onChange={(e) => setFormData({ ...formData, counselorName: e.target.value })}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Documents & Handover */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        Documents Verification & AM Handover
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Verify student physical/digital documents submitted and review the Academic Manager queue handover.
                      </p>
                    </div>
                  </div>

                  {/* Documents Checklist */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Documents Checklist:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AVAILABLE_DOCUMENTS.map((doc) => {
                        const isChecked = formData.documentsSubmitted.includes(doc.id);
                        return (
                          <div
                            key={doc.id}
                            onClick={() => handleDocToggle(doc.id)}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all text-xs ${
                              isChecked
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{doc.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Starting Module & Remarks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Starting Module / Level"
                      placeholder="e.g. Module 1: Foundation"
                      value={formData.waitingForModule}
                      onChange={(e) => setFormData({ ...formData, waitingForModule: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Admission Remarks / Notes
                      </label>
                      <textarea
                        rows={2}
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Any batch timing preferences or student remarks..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  {/* Clear Handover Notice */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-900">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-amber-950 mb-0.5">
                        Automatic Academic Manager Handover
                      </strong>
                      Upon submitting this admission, <strong>{formData.fullName || 'the student'}</strong> will be registered with status <strong>&quot;Waiting for Batch&quot;</strong>. The Academic Manager (AM) will be notified immediately to allocate a batch and schedule faculty.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal Bottom Footer Navigation */}
            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="text-xs px-4 py-2 text-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Previous Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-xs px-4 py-2 text-gray-500"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-6 py-2.5 shadow-md font-semibold"
                  >
                    Continue to {currentStep === 1 ? 'Program & Fees' : 'Verification'}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-7 py-3 shadow-lg font-bold shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Admission Entry
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Table';
import {
  GraduationCap,
  User,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  HeartHandshake,
  BookOpen
} from 'lucide-react';
import { User as UserType, StudentStatus } from '@/types';

const COURSES = [
  {
    id: 'Animation',
    name: '3D Animation Film Making',
    badge: 'ADVFX+ / Maya',
    duration: '24 Months',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'VFX',
    name: 'VFX & Compositing Professional',
    badge: 'Nuke / Houdini',
    duration: '18 Months',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'Game Design',
    name: 'Game Art, Design & Unreal Engine',
    badge: 'Unreal / Unity',
    duration: '18 Months',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'Graphic Design',
    name: 'Graphic Design & UI/UX Master',
    badge: 'Figma / Adobe Suite',
    duration: '12 Months',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'Motion Graphics',
    name: 'Motion Graphics & Broadcast Design',
    badge: 'After Effects / Cinema 4D',
    duration: '12 Months',
    color: 'from-amber-500 to-orange-600'
  }
];

const AVAILABLE_DOCUMENTS = [
  { id: '10th Marksheet', label: '10th Standard Marksheet / Secondary Certificate' },
  { id: '12th Marksheet', label: '12th Standard Marksheet / Higher Secondary Diploma' },
  { id: 'Aadhar Card / Govt ID', label: 'Aadhar Card / Passport / National ID Proof' },
  { id: 'Passport Size Photographs (x2)', label: 'Passport Size Photographs (x2 Copies)' },
  { id: 'Address Proof', label: 'Residential Address Proof (Utility / Electricity / Voter ID)' },
  { id: 'Signed Admission Rules Form', label: 'Signed MAAC Institute Rules & Policy Undertaking' },
  { id: 'Portfolio / Artwork Samples', label: 'Creative Artwork / Portfolio / Showreel (Optional)' }
];

export default function NewAdmissionPage() {
  const router = useRouter();
  const { addStudent, currentUser } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const defaultStudentId = `MAAC-2026-${Math.floor(100 + Math.random() * 900)}`;

  const [formData, setFormData] = useState({
    fullName: '',
    contactNo: '',
    email: '',
    dob: '2005-06-15',
    gender: 'Male',
    studentId: defaultStudentId,
    parentName: '',
    parentRelation: 'Father',
    parentContact: '',
    parentEmail: '',
    address: 'Mumbai, Maharashtra',
    course: 'Animation',
    admissionDate: new Date().toISOString().split('T')[0],
    counselorName: currentUser?.name || 'Priya Sharma',
    counselorId: currentUser?.id || '8',

    profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    documentsSubmitted: [
      '10th Marksheet',
      '12th Marksheet',
      'Aadhar Card / Govt ID',
      'Signed Admission Rules Form'
    ],
    waitingForModule: 'Module 1: Fundamentals & Computer Graphics',
    remarks: 'Student enrolled via Counselor Desk. Forwarded for Academic Manager batch scheduling.',
    // School / Education Details
    previousSchool: '',
    schoolAddress: '',
    schoolCity: '',
    schoolBoard: 'CBSE',
    lastClassPassed: '12th',
    // How did you know about MAAC?
    referralSource: '',
    referralDetails: ''
  });

  const handleSelectCourse = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      course: courseId
    }));
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      parentName: `${formData.parentName} (${formData.parentRelation})`,
      parentContact: formData.parentContact,
      dob: formData.dob,
      course: formData.course,
      admissionDate: formData.admissionDate,
      counselorName: formData.counselorName,
      counselorId: formData.counselorId,
      assignedBatches: [], // Strictly handed off to Academic Manager

      studentStatus: 'Waiting for Batch' as StudentStatus,
      documentsSubmitted: formData.documentsSubmitted,
      remarks: formData.remarks,
      waitingForModule: formData.waitingForModule,
      // School / Education Details
      previousSchool: formData.previousSchool,
      schoolAddress: formData.schoolAddress,
      schoolCity: formData.schoolCity,
      schoolBoard: formData.schoolBoard,
      lastClassPassed: formData.lastClassPassed,
      // How did you know about MAAC?
      referralSource: formData.referralSource,
      referralDetails: formData.referralDetails
    };

    addStudent(newStudent);
    setShowSuccessBanner(true);

    setTimeout(() => {
      router.push('/dashboard/counselor');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              MAAC Institute • Student Master Enrollment Portal
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create New Student Admission 🎓
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Counselor Desk: <strong>{formData.counselorName}</strong>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="text-sm font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {showSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-base">Admission Successfully Recorded!</h4>
                <p className="text-emerald-100 text-xs mt-0.5">
                  Student record created in Master Database and notification dispatched to Academic Manager (AM) for batch allocation. Redirecting...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Comprehensive Multi-Section Form (2 Columns span) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 1: Candidate Personal Details */}
          <Card className="p-6 md:p-8 space-y-6 shadow-md border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">1. Candidate Information</h3>
                  <p className="text-xs text-gray-500">Personal details and generated Institute identification</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">
                {formData.studentId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Candidate Full Name *"
                placeholder="e.g. Rohan Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Student ID Code *"
                placeholder="e.g. MAAC-2026-001"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Contact Number *"
                placeholder="+91 98765 00000"
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                required
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="candidate@example.com"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none text-sm text-gray-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="Profile Photo Avatar URL"
                placeholder="https://images.unsplash.com/..."
                value={formData.profilePhoto}
                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
              />
            </div>
          </Card>

          {/* SECTION 2: Guardian & Emergency Contacts */}
          <Card className="p-6 md:p-8 space-y-6 shadow-md border-gray-100">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">2. Guardian & Parent Details</h3>
                <p className="text-xs text-gray-500">Contact information for parent notifications and emergency reach</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Parent / Guardian Name *"
                placeholder="e.g. Ramesh Sharma"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship *</label>
                <select
                  value={formData.parentRelation}
                  onChange={(e) => setFormData({ ...formData, parentRelation: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-cyan-200 outline-none text-sm text-gray-900"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Legal Guardian</option>
                  <option value="Sibling">Elder Sibling</option>
                </select>
              </div>
              <Input
                label="Parent Contact Phone *"
                placeholder="+91 98765 00001"
                value={formData.parentContact}
                onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Parent Email (Optional)"
                type="email"
                placeholder="parent@example.com"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />
              <Input
                label="Residential Address"
                placeholder="Apartment, Street, City, State"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </Card>

          {/* SECTION 2B: School / Previous Education Details */}
          <Card className="p-6 md:p-8 space-y-6 shadow-md border-gray-100">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">2B. School / Previous Education Details</h3>
                <p className="text-xs text-gray-500">Academic background and previous school information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Previous School / College Name"
                placeholder="e.g. St. Xavier's High School"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
              />
              <Input
                label="School Address / City"
                placeholder="e.g. Andheri West, Mumbai"
                value={formData.schoolAddress}
                onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="School City"
                placeholder="e.g. Mumbai"
                value={formData.schoolCity}
                onChange={(e) => setFormData({ ...formData, schoolCity: e.target.value })}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Board / Affiliation</label>
                <select
                  value={formData.schoolBoard}
                  onChange={(e) => setFormData({ ...formData, schoolBoard: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none text-sm text-gray-900"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB (International Baccalaureate)</option>
                  <option value="NIOS">NIOS</option>
                  <option value="University">University / College</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Class Passed</label>
                <select
                  value={formData.lastClassPassed}
                  onChange={(e) => setFormData({ ...formData, lastClassPassed: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none text-sm text-gray-900"
                >
                  <option value="10th">10th Standard</option>
                  <option value="12th">12th Standard / HSC</option>
                  <option value="Graduation">Graduation / Degree</option>
                  <option value="Post-Graduation">Post-Graduation</option>
                  <option value="Dropped">Dropped Out</option>
                </select>
              </div>
            </div>
          </Card>

          {/* SECTION 3: Academic Program Selection */}
          <Card className="p-6 md:p-8 space-y-6 shadow-md border-gray-100">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">3. Program & Specialization</h3>
                <p className="text-xs text-gray-500">Select course program and starting foundation module</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Select Enrolled Course Program *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {COURSES.map((c) => {
                  const isSelected = formData.course === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCourse(c.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {c.badge}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm mt-1">{c.name}</h4>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>Duration: <strong>{c.duration}</strong></span>
                        <span className="font-bold text-gray-900 font-mono">{c.duration}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Starting Module / Level *"
                placeholder="e.g. Module 1: Foundation"
                value={formData.waitingForModule}
                onChange={(e) => setFormData({ ...formData, waitingForModule: e.target.value })}
                required
              />
              <Input
                label="Admission Date *"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                required
              />
              <Input
                label="Counselor In-charge *"
                value={formData.counselorName}
                onChange={(e) => setFormData({ ...formData, counselorName: e.target.value })}
                required
              />
            </div>
          </Card>



          {/* SECTION 5: Documents Submitted & Remarks */}
          <Card className="p-6 md:p-8 space-y-6 shadow-md border-gray-100">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">5. Document Verification Checklist</h3>
                <p className="text-xs text-gray-500">Mark all submitted physical / digital documents verified at desk</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_DOCUMENTS.map((doc) => {
                const isChecked = formData.documentsSubmitted.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDocToggle(doc.id)}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs leading-snug">{doc.label}</span>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Counselor Remarks / Special Student Notes
              </label>
              <textarea
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any special batch timing preferences, previous experience, or fee terms..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-900 bg-white"
              />
            </div>

            {/* SECTION 5B: How did you know about MAAC? */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">How did you know about MAAC?</h4>
                  <p className="text-xs text-gray-500">Referral source tracking for marketing analytics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Referral Source *</label>
                  <select
                    value={formData.referralSource}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none text-sm text-gray-900"
                    required
                  >
                    <option value="">-- Select Source --</option>
                    <option value="Website">MAAC Website</option>
                    <option value="Social Media">Social Media (Instagram / Facebook / YouTube)</option>
                    <option value="Walk-in">Walk-in / Direct Visit</option>
                    <option value="Friend / Family Referral">Friend / Family Referral</option>
                    <option value="Existing Student Referral">Existing Student Referral</option>
                    <option value="Newspaper / Print Ad">Newspaper / Print Advertisement</option>
                    <option value="TV / Radio Ad">TV / Radio Advertisement</option>
                    <option value="Education Fair / Seminar">Education Fair / Seminar / Workshop</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Phone Inquiry">Phone Inquiry / Helpline</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input
                  label="Referral Details (Optional)"
                  placeholder="e.g. Referred by friend Rahul, saw ad on Instagram"
                  value={formData.referralDetails}
                  onChange={(e) => setFormData({ ...formData, referralDetails: e.target.value })}
                />
              </div>
            </div>

            {/* Clear Academic Manager Handover Notice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 text-xs text-amber-900">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950 mb-0.5">
                  Academic Manager (AM) Handover Queue
                </strong>
                Upon submission, this candidate will be saved in the Master Database with initial status <strong>&quot;Waiting for Batch&quot;</strong>. The Academic Manager will be notified immediately to allocate the student to an appropriate batch and faculty timetable.
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Student ID Card Preview & Actions (Sticky) */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            
            {/* Live Student ID Preview Card */}
            <Card className="p-6 overflow-hidden relative shadow-xl border-purple-100" gradient>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">
                  Master ID Preview
                </span>
                <span className="text-xs font-mono font-bold text-gray-400">
                  {formData.studentId}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-purple-100 border-2 border-purple-200 shrink-0 flex items-center justify-center text-purple-600 font-bold text-2xl">
                  {formData.fullName ? formData.fullName.charAt(0) : 'S'}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                    {formData.fullName || 'Candidate Name'}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {COURSES.find(c => c.id === formData.course)?.name || 'Course Program'}
                  </p>
                  <p className="text-[11px] text-gray-500">{formData.contactNo || '+91 00000 00000'}</p>
                </div>
              </div>

              <div className="space-y-2.5 bg-gray-50/80 p-3.5 rounded-2xl text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <Badge variant="warning">⏳ Waiting for AM Batch</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Parent:</span>
                  <span className="font-semibold text-gray-800">{formData.parentName || 'Parent Name'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Documents:</span>
                  <span className="font-semibold text-emerald-700">{formData.documentsSubmitted.length} Verified ✓</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.fullName || !formData.contactNo}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-600/30 rounded-2xl transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Registering Admission...' : 'Submit & Create Admission'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/counselor')}
                  className="w-full py-3 text-sm font-semibold rounded-2xl"
                >
                  Save as Draft & Exit
                </Button>
              </div>
            </Card>

            {/* Policy & Guidance Note */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                Institute Admission Policy
              </p>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Admissions recorded through this portal generate an immutable master profile. Batch allocation is scheduled by the Academic Dean.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

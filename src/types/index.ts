export type UserRole = 'admin' | 'teacher' | 'student' | 'academic-manager' | 'account-manager' | 'counselor';

export type StudentStatus =
  | 'Waiting for Batch'
  | 'Active'
  | 'On Hold/Pause'
  | 'Course Completed'
  | 'Passout/Certificate'
  | 'Dropped (ADO/FDO)';

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  joinDate: string;
  isActive: boolean;
  // Student Master specific fields
  studentId?: string;
  parentName?: string;
  parentContact?: string;
  dob?: string;
  course?: string;
  admissionDate?: string;
  counselorName?: string;
  counselorId?: string;
  assignedBatches?: string[];
  feesDueDate?: string;
  totalFees?: number;
  feesPaid?: number;
  paymentStatus?: PaymentStatus;
  studentStatus?: StudentStatus;
  profilePhoto?: string;
  documentsSubmitted?: string[];
  remarks?: string;
  waitingForModule?: string;
}

export interface StudentMaster {
  id: string;
  studentId: string;
  fullName: string;
  contactNo: string;
  email: string;
  parentName: string;
  parentContact: string;
  dob: string;
  course: string;
  admissionDate: string;
  counselorName: string;
  counselorId: string;
  assignedBatches: string[];
  feesDueDate: string;
  totalFees: number;
  feesPaid: number;
  paymentStatus: PaymentStatus;
  studentStatus: StudentStatus;
  profilePhoto?: string;
  documentsSubmitted: string[];
  remarks: string;
  waitingForModule?: string;
  isActive: boolean;
}

export interface InquiryLead {
  id: string;
  studentName: string;
  phone: string;
  email: string;
  interestedCourse: string;
  source: 'Website' | 'Walk-in' | 'Social Media' | 'Referral' | 'Phone Call';
  status: 'new' | 'contacted' | 'counseling-scheduled' | 'demo-booked' | 'enrolled' | 'lost';
  counselorName: string;
  counselorId: string;
  notes: string;
  followUpDate: string;
  createdAt: string;
  budget?: number;
}

export interface Batch {
  id: string;
  batchIdCode?: string;
  name: string;
  course: string;
  teacherId: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  days: string[];
  capacity: number;
  enrolledStudents: number;
  studentIds: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  room: string;
  classesCompleted?: number;
  classesRemaining?: number;
  isPracticeDoubtClass?: boolean;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  markedAt: string;
}

export interface SubTopic {
  id: string;
  name: string;
  isCompleted: boolean;
  startedAt?: string | null;
  completedAt?: string | null;
  timeSpentMinutes?: number;
}

export interface Chapter {
  id: string;
  name: string;
  subTopics: SubTopic[];
  plannedDurationMinutes?: number;
}

export interface LessonPlan {
  id: string;
  batchId: string;
  batchName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  chapters: Chapter[];
  status: 'planned' | 'in-progress' | 'completed';
  materials: string[];
}

export interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  overallScore: number;
  attendancePercentage: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastUpdated: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  amount: number;
  paidDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  transactionId?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalBatches: number;
  activeBatches: number;
  attendanceToday: number;
  feesCollected: number;
  feesPending: number;
  newAdmissions: number;
}

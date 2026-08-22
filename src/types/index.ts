export type UserRole = 'admin' | 'teacher' | 'student' | 'academic-manager' | 'account-manager' | 'counselor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  joinDate: string;
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

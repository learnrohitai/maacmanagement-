import { create } from 'zustand';
import { User, UserRole, Batch, Attendance, LessonPlan, StudentProgress, FeeRecord, DashboardStats, InquiryLead } from '@/types';
import { mockUsers, mockBatches, mockAttendance, mockLessonPlans, mockStudentProgress, mockFeeRecords, mockDashboardStats, mockInquiries } from '@/lib/mockData';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Data
  users: User[];
  students: User[];
  batches: Batch[];
  attendance: Attendance[];
  lessonPlans: LessonPlan[];
  studentProgress: StudentProgress[];
  feeRecords: FeeRecord[];
  dashboardStats: DashboardStats;
  inquiries: InquiryLead[];

  // Actions
  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, batch: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;

  addAttendance: (attendance: Attendance) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;

  addLessonPlan: (plan: LessonPlan) => void;
  updateLessonPlan: (id: string, plan: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;

  updateStudentProgress: (id: string, progress: Partial<StudentProgress>) => void;

  addFeeRecord: (record: FeeRecord) => void;
  updateFeeRecord: (id: string, record: Partial<FeeRecord>) => void;

  addInquiry: (inquiry: InquiryLead) => void;
  updateInquiry: (id: string, inquiry: Partial<InquiryLead>) => void;
  deleteInquiry: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  isAuthenticated: false,
  login: async (email: string, _password: string) => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ currentUser: null, isAuthenticated: false }),
  switchRole: (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      set({ currentUser: user });
    }
  },

  // Data
  users: mockUsers,
  students: mockUsers.filter(u => u.role === 'student'),
  batches: mockBatches,
  attendance: mockAttendance,
  lessonPlans: mockLessonPlans,
  studentProgress: mockStudentProgress,
  feeRecords: mockFeeRecords,
  dashboardStats: mockDashboardStats,
  inquiries: mockInquiries,

  // Batch Actions
  addBatch: (batch) => set((state) => ({ batches: [...state.batches, batch] })),
  updateBatch: (id, updates) => set((state) => ({
    batches: state.batches.map(b => b.id === id ? { ...b, ...updates } : b)
  })),
  deleteBatch: (id) => set((state) => ({
    batches: state.batches.filter(b => b.id !== id)
  })),

  // Attendance Actions
  addAttendance: (attendance) => set((state) => ({
    attendance: [...state.attendance, attendance]
  })),
  updateAttendance: (id, updates) => set((state) => ({
    attendance: state.attendance.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  // Lesson Plan Actions
  addLessonPlan: (plan) => set((state) => ({
    lessonPlans: [...state.lessonPlans, plan]
  })),
  updateLessonPlan: (id, updates) => set((state) => ({
    lessonPlans: state.lessonPlans.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteLessonPlan: (id) => set((state) => ({
    lessonPlans: state.lessonPlans.filter(p => p.id !== id)
  })),

  // Student Progress Actions
  updateStudentProgress: (id, updates) => set((state) => ({
    studentProgress: state.studentProgress.map(p =>
      p.id === id ? { ...p, ...updates } : p
    )
  })),

  // Fee Record Actions
  addFeeRecord: (record) => set((state) => ({
    feeRecords: [...state.feeRecords, record]
  })),
  updateFeeRecord: (id, updates) => set((state) => ({
    feeRecords: state.feeRecords.map(r => r.id === id ? { ...r, ...updates } : r)
  })),

  // Inquiry Actions
  addInquiry: (inquiry) => set((state) => ({
    inquiries: [inquiry, ...state.inquiries]
  })),
  updateInquiry: (id, updates) => set((state) => ({
    inquiries: state.inquiries.map(i => i.id === id ? { ...i, ...updates } : i)
  })),
  deleteInquiry: (id) => set((state) => ({
    inquiries: state.inquiries.filter(i => i.id !== id)
  }))
}));

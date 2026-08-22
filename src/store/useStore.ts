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

  // Student Master Actions
  addStudent: (student: User) => void;
  updateStudent: (id: string, student: Partial<User>) => void;
  deleteStudent: (id: string) => void;
  assignBatchToStudent: (studentId: string, batchId: string) => void;
  changeStudentBatch: (studentId: string, fromBatchId: string, toBatchId: string, reason?: string) => void;
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
  })),

  // Student Master Actions
  addStudent: (student) => set((state) => {
    const updatedUsers = [student, ...state.users];
    const updatedStudents = updatedUsers.filter(u => u.role === 'student');
    
    // If student was assigned to a batch, update the batch's enrolled count & studentIds
    let updatedBatches = state.batches;
    if (student.assignedBatches && student.assignedBatches.length > 0) {
      updatedBatches = state.batches.map(b => {
        if (student.assignedBatches?.includes(b.id) && !b.studentIds.includes(student.id)) {
          return {
            ...b,
            enrolledStudents: b.enrolledStudents + 1,
            studentIds: [...b.studentIds, student.id]
          };
        }
        return b;
      });
    }

    // Also create initial fee record if fee paid > 0
    let updatedFeeRecords = state.feeRecords;
    if (student.feesPaid && student.feesPaid > 0) {
      const newFeeRecord: FeeRecord = {
        id: `fee-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        batchId: student.assignedBatches?.[0] || 'Unassigned',
        batchName: student.course || 'MAAC Program',
        amount: student.feesPaid,
        paidDate: student.admissionDate || new Date().toISOString().split('T')[0],
        dueDate: student.feesDueDate || new Date().toISOString().split('T')[0],
        status: (student.feesPaid >= (student.totalFees || 0)) ? 'paid' : 'pending',
        paymentMethod: 'UPI / Card'
      };
      updatedFeeRecords = [newFeeRecord, ...state.feeRecords];
    }

    return {
      users: updatedUsers,
      students: updatedStudents,
      batches: updatedBatches,
      feeRecords: updatedFeeRecords
    };
  }),

  updateStudent: (id, updates) => set((state) => {
    const updatedUsers = state.users.map(u => u.id === id ? { ...u, ...updates } : u);
    return {
      users: updatedUsers,
      students: updatedUsers.filter(u => u.role === 'student')
    };
  }),

  deleteStudent: (id) => set((state) => {
    const updatedUsers = state.users.filter(u => u.id !== id);
    return {
      users: updatedUsers,
      students: updatedUsers.filter(u => u.role === 'student'),
      batches: state.batches.map(b => ({
        ...b,
        studentIds: b.studentIds.filter(sId => sId !== id),
        enrolledStudents: b.studentIds.filter(sId => sId !== id).length
      }))
    };
  }),

  assignBatchToStudent: (studentId, batchId) => set((state) => {
    const updatedUsers = state.users.map(u => {
      if (u.id === studentId) {
        const existingBatches = u.assignedBatches || [];
        return {
          ...u,
          assignedBatches: Array.from(new Set([...existingBatches, batchId])),
          studentStatus: 'Active' as const,
          waitingForModule: undefined
        };
      }
      return u;
    });

    const updatedBatches = state.batches.map(b => {
      if (b.id === batchId && !b.studentIds.includes(studentId)) {
        return {
          ...b,
          enrolledStudents: b.enrolledStudents + 1,
          studentIds: [...b.studentIds, studentId]
        };
      }
      return b;
    });

    return {
      users: updatedUsers,
      students: updatedUsers.filter(u => u.role === 'student'),
      batches: updatedBatches
    };
  }),

  changeStudentBatch: (studentId, fromBatchId, toBatchId, reason) => set((state) => {
    const transferNote = `[Transferred to new batch on ${new Date().toLocaleDateString('en-IN')}${reason ? `: ${reason}` : ''}]`;

    const updatedUsers = state.users.map(u => {
      if (u.id === studentId) {
        const currentBatches = u.assignedBatches || [];
        const filtered = currentBatches.filter(bId => bId !== fromBatchId);
        return {
          ...u,
          assignedBatches: Array.from(new Set([...filtered, toBatchId])),
          studentStatus: 'Active' as const,
          remarks: u.remarks ? `${u.remarks} | ${transferNote}` : transferNote
        };
      }
      return u;
    });

    const updatedBatches = state.batches.map(b => {
      // Remove from old batch
      if (b.id === fromBatchId) {
        const newStudentIds = b.studentIds.filter(id => id !== studentId);
        return {
          ...b,
          studentIds: newStudentIds,
          enrolledStudents: Math.max(0, newStudentIds.length)
        };
      }
      // Add to new batch
      if (b.id === toBatchId && !b.studentIds.includes(studentId)) {
        const newStudentIds = [...b.studentIds, studentId];
        return {
          ...b,
          studentIds: newStudentIds,
          enrolledStudents: newStudentIds.length
        };
      }
      return b;
    });

    return {
      users: updatedUsers,
      students: updatedUsers.filter(u => u.role === 'student'),
      batches: updatedBatches
    };
  })
}));

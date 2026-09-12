'use client';

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

  // DB sync
  batchesLoadedFromDb: boolean;
  loadBatches: () => Promise<void>;

  // Attendance lock: keys are `${batchId}|${date}`. Once submitted, attendance is
  // locked — only the academic-manager role may re-adjust it.
  submittedAttendanceKeys: string[];
  markAttendanceSubmitted: (key: string) => void;

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

// Attendance lock persistence (survives reloads in this browser).
const SUBMITTED_ATTENDANCE_STORAGE_KEY = 'maac-submitted-attendance-keys';

function loadSubmittedAttendanceKeys(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SUBMITTED_ATTENDANCE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

function persistSubmittedAttendanceKeys(keys: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SUBMITTED_ATTENDANCE_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // storage unavailable (private mode etc.) — lock applies for this session only
  }
}

// Batch ids generated locally (Date.now()) are replaced by Mongo _ids after save.
// This map bridges the local id -> Mongo id so subsequent updates target the DB doc.
const pendingBatchIdMap = new Map<string, string>();
// Batch ids deleted locally while their create-request is still in flight.
// When the create resolves we must also remove the doc from the DB.
const cancelledBatchIds = new Set<string>();

async function apiCreateBatch(batch: Batch): Promise<string | null> {
  try {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    const data = (await res.json().catch(() => ({}))) as { batch?: { _id?: string } ; message?: string };
    if (!res.ok || !data.batch?._id) {
      console.error('Batch save failed:', data.message || res.status);
      return null;
    }
    return String(data.batch._id);
  } catch (e) {
    console.error('Batch save failed:', e);
    return null;
  }
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

  // DB sync
  batchesLoadedFromDb: false,
  loadBatches: async () => {
    if (get().batchesLoadedFromDb) return;
    try {
      const res = await fetch('/api/batches');
      if (!res.ok) return;
      const data = (await res.json()) as {
        batches?: Array<Record<string, unknown> & { _id?: string }>;
      };
      const dbBatches: Batch[] = (data.batches || []).map((b) => {
        const { _id, ...rest } = b;
        return {
          ...(rest as unknown as Batch),
          id: String(_id ?? rest.id ?? ''),
        };
      });
      // Merge: keep local (mock) batches not yet in the DB, then DB batches.
      // Local batches created before persistence existed remain visible.
      const dbIds = new Set(dbBatches.map((b) => b.id));
      const localOnly = mockBatches.filter((mb) => !dbIds.has(mb.id) && !mb.id.startsWith('local-'));
      set({ batches: [...dbBatches, ...localOnly], batchesLoadedFromDb: true });
    } catch {
      // DB unreachable — keep working with mock data
    }
  },

  // Batch Actions — optimistic local update + best-effort MongoDB persistence
  addBatch: (batch) => {
    const localId = batch.id.startsWith('mongo-') ? batch.id.slice(6) : batch.id;
    // Optimistic local insert
    set((state) => ({ batches: [...state.batches, { ...batch, id: localId }] }));

    void (async () => {
      const mongoId = await apiCreateBatch({ ...batch, id: localId });
      if (cancelledBatchIds.has(localId)) {
        // The batch was rolled back locally while the create was in flight —
        // make sure the DB doc is removed too.
        cancelledBatchIds.delete(localId);
        if (mongoId) {
          void fetch(`/api/batches?id=${encodeURIComponent(mongoId)}`, { method: 'DELETE' }).catch(() => undefined);
        }
        return;
      }
      if (mongoId) {
        pendingBatchIdMap.set(localId, mongoId);
        set((state) => ({
          batches: state.batches.map((b) => (b.id === localId ? { ...b, id: mongoId } : b)),
        }));
      }
    })();
  },

  updateBatch: (id, updates) => {
    const dbId = pendingBatchIdMap.get(id) ?? id;
    set((state) => ({
      batches: state.batches.map(b => b.id === id ? { ...b, ...updates } : b)
    }));

    void (async () => {
      try {
        const res = await fetch(`/api/batches?id=${encodeURIComponent(dbId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          console.error('Batch update failed:', data.message || res.status);
        }
      } catch (e) {
        console.error('Batch update failed:', e);
      }
    })();
  },

  deleteBatch: (id) => {
    const dbId = pendingBatchIdMap.get(id) ?? id;
    set((state) => ({
      batches: state.batches.filter(b => b.id !== id)
    }));

    // If the create-request is still in flight, remember the cancellation so the
    // in-flight create can clean up after itself when it resolves.
    cancelledBatchIds.add(id);

    void (async () => {
      try {
        const res = await fetch(`/api/batches?id=${encodeURIComponent(dbId)}`, {
          method: 'DELETE',
        });
        if (!res.ok && res.status !== 404) {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          console.error('Batch delete failed:', data.message || res.status);
          return;
        }
        pendingBatchIdMap.delete(id);
        cancelledBatchIds.delete(id);
      } catch (e) {
        console.error('Batch delete failed:', e);
      }
    })();
  },

  // Attendance lock
  submittedAttendanceKeys: loadSubmittedAttendanceKeys(),
  markAttendanceSubmitted: (key) => set((state) => {
    if (state.submittedAttendanceKeys.includes(key)) return state;
    const next = [...state.submittedAttendanceKeys, key];
    persistSubmittedAttendanceKeys(next);
    return { submittedAttendanceKeys: next };
  }),

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

    let touchedBatchIds: string[] = [];
    const updatedBatches = state.batches.map(b => {
      if (b.id === batchId && !b.studentIds.includes(studentId)) {
        touchedBatchIds.push(b.id);
        return {
          ...b,
          enrolledStudents: b.enrolledStudents + 1,
          studentIds: [...b.studentIds, studentId]
        };
      }
      return b;
    });

    touchedBatchIds.forEach((bid) => {
      const updated = updatedBatches.find(b => b.id === bid);
      if (updated) {
        void fetch(`/api/batches?id=${encodeURIComponent(bid)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentIds: updated.studentIds,
            enrolledStudents: updated.enrolledStudents,
          }),
        }).catch(() => undefined);
      }
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

    const touchedBatchIds: string[] = [fromBatchId, toBatchId];
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

    touchedBatchIds.filter(Boolean).forEach((bid) => {
      const updated = updatedBatches.find(b => b.id === bid);
      if (updated) {
        void fetch(`/api/batches?id=${encodeURIComponent(bid)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentIds: updated.studentIds,
            enrolledStudents: updated.enrolledStudents,
          }),
        }).catch(() => undefined);
      }
    });

    return {
      users: updatedUsers,
      students: updatedUsers.filter(u => u.role === 'student'),
      batches: updatedBatches
    };
  })
}));

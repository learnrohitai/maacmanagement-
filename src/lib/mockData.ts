import { User, Batch, Attendance, LessonPlan, StudentProgress, FeeRecord, DashboardStats, InquiryLead } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@maac.com',
    role: 'admin',
    avatar: '/avatars/admin.jpg',
    phone: '+91 9876543210',
    joinDate: '2024-01-01',
    isActive: true
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    email: 'rahul@maac.com',
    role: 'teacher',
    avatar: '/avatars/teacher1.jpg',
    phone: '+91 9876543211',
    joinDate: '2024-02-15',
    isActive: true
  },
  {
    id: '3',
    name: 'Priya Patel',
    email: 'priya@maac.com',
    role: 'teacher',
    avatar: '/avatars/teacher2.jpg',
    phone: '+91 9876543212',
    joinDate: '2024-03-01',
    isActive: true
  },
  {
    id: '4',
    name: 'Amit Kumar',
    email: 'amit@student.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43213',
    joinDate: '2026-04-01',
    isActive: true,
    studentId: 'MAAC-2026-001',
    parentName: 'Ramesh Kumar',
    parentContact: '+91 98765 99001',
    dob: '2004-05-14',
    course: 'Animation',
    admissionDate: '2026-04-01',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    assignedBatches: ['1'],
    feesDueDate: '2026-09-10',
    totalFees: 120000,
    feesPaid: 80000,
    paymentStatus: 'Partial',
    studentStatus: 'Active',
    documentsSubmitted: ['10th Marksheet', '12th Marksheet', 'Aadhar Card', 'Signed Form'],
    remarks: 'Strong foundation in sketching, keen on character animation.'
  },
  {
    id: '5',
    name: 'Sneha Gupta',
    email: 'sneha@student.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43214',
    joinDate: '2026-04-15',
    isActive: true,
    studentId: 'MAAC-2026-002',
    parentName: 'Sunil Gupta',
    parentContact: '+91 98765 99002',
    dob: '2005-08-22',
    course: 'VFX',
    admissionDate: '2026-04-15',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    assignedBatches: ['2'],
    feesDueDate: '2026-10-15',
    totalFees: 140000,
    feesPaid: 140000,
    paymentStatus: 'Paid',
    studentStatus: 'Active',
    documentsSubmitted: ['10th Marksheet', '12th Marksheet', 'Aadhar Card', 'Photo ID', 'Signed Form'],
    remarks: 'Full fees paid upfront. Excellent progress in Houdini fundamentals.'
  },
  {
    id: '9',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@student.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98112 34567',
    joinDate: '2026-08-20',
    isActive: true,
    studentId: 'MAAC-2026-003',
    parentName: 'Anil Deshmukh',
    parentContact: '+91 98112 99003',
    dob: '2005-11-03',
    course: 'Animation',
    admissionDate: '2026-08-20',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    assignedBatches: [],
    feesDueDate: '2026-09-01',
    totalFees: 110000,
    feesPaid: 35000,
    paymentStatus: 'Partial',
    studentStatus: 'Waiting for Batch',
    documentsSubmitted: ['12th Marksheet', 'Aadhar Card', 'Signed Form'],
    remarks: 'New admission by Priya Sharma. Needs morning batch assignment for Module 1 (Maya 3D).',
    waitingForModule: 'Module 1: 3D Maya Fundamentals'
  },
  {
    id: '10',
    name: 'Tanvi Saxena',
    email: 'tanvi.s@student.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98445 67890',
    joinDate: '2026-08-15',
    isActive: true,
    studentId: 'MAAC-2026-004',
    parentName: 'Rajeev Saxena',
    parentContact: '+91 98445 99004',
    dob: '2004-02-18',
    course: 'Graphic Design',
    admissionDate: '2026-08-15',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    assignedBatches: [],
    feesDueDate: '2026-09-05',
    totalFees: 75000,
    feesPaid: 25000,
    paymentStatus: 'Partial',
    studentStatus: 'Waiting for Batch',
    documentsSubmitted: ['10th Marksheet', '12th Marksheet', 'Aadhar Card', 'Signed Form'],
    remarks: 'Waiting for upcoming UI/UX Graphic Design batch commencing next Monday.',
    waitingForModule: 'Module 1: Design Principles & Figma'
  },
  {
    id: '11',
    name: 'Karan Malhotra',
    email: 'karan.m@student.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98331 22334',
    joinDate: '2025-11-10',
    isActive: false,
    studentId: 'MAAC-2025-089',
    parentName: 'Vikram Malhotra',
    parentContact: '+91 98331 99005',
    dob: '2003-09-12',
    course: 'Game Design',
    admissionDate: '2025-11-10',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    assignedBatches: [],
    feesDueDate: '2026-01-15',
    totalFees: 130000,
    feesPaid: 65000,
    paymentStatus: 'Overdue',
    studentStatus: 'On Hold/Pause',
    documentsSubmitted: ['10th Marksheet', '12th Marksheet', 'Aadhar Card'],
    remarks: 'Paused for college semester exams. Will resume in next quarter.'
  },
  {
    id: '12',
    name: 'Ananya Verma',
    email: 'ananya.v@student.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98223 45678',
    joinDate: '2025-06-01',
    isActive: true,
    studentId: 'MAAC-2025-045',
    parentName: 'Mahesh Verma',
    parentContact: '+91 98223 99006',
    dob: '2004-12-25',
    course: 'VFX',
    admissionDate: '2025-06-01',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    assignedBatches: ['2'],
    feesDueDate: '2026-05-01',
    totalFees: 150000,
    feesPaid: 150000,
    paymentStatus: 'Paid',
    studentStatus: 'Passout/Certificate',
    documentsSubmitted: ['10th Marksheet', '12th Marksheet', 'Aadhar Card', 'Photo ID', 'Signed Form', 'Showreel Submitted'],
    remarks: 'Completed VFX program with honors showreel. Certificate issued.'
  },
  {
    id: '6',
    name: 'Academic Manager',
    email: 'academic@maac.com',
    role: 'academic-manager',
    avatar: '/avatars/academic.jpg',
    phone: '+91 9876543215',
    joinDate: '2024-01-15',
    isActive: true
  },
  {
    id: '7',
    name: 'Account Manager',
    email: 'account@maac.com',
    role: 'account-manager',
    avatar: '/avatars/account.jpg',
    phone: '+91 9876543216',
    joinDate: '2024-01-20',
    isActive: true
  },
  {
    id: '8',
    name: 'Priya Sharma',
    email: 'counselor@maac.com',
    role: 'counselor',
    avatar: '/avatars/counselor.jpg',
    phone: '+91 9876543217',
    joinDate: '2024-02-01',
    isActive: true
  }
];

export const mockBatches: Batch[] = [
  {
    id: '1',
    batchIdCode: 'MAAC-ANI-01',
    name: 'Animation Premium',
    course: 'Animation',
    teacherId: '2',
    teacherName: 'Rahul Sharma',
    startTime: '09:00',
    endTime: '12:00',
    days: ['Monday', 'Wednesday', 'Friday'],
    capacity: 30,
    enrolledStudents: 25,
    studentIds: ['4', '5'],
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    status: 'active',
    room: 'Lab 1 - Maya Studio',
    classesCompleted: 36,
    classesRemaining: 24,
    isPracticeDoubtClass: false
  },
  {
    id: '2',
    batchIdCode: 'MAAC-VFX-02',
    name: 'VFX Professional',
    course: 'VFX',
    teacherId: '3',
    teacherName: 'Priya Patel',
    startTime: '14:00',
    endTime: '17:00',
    days: ['Tuesday', 'Thursday', 'Saturday'],
    capacity: 25,
    enrolledStudents: 22,
    studentIds: ['4', '5', '12'],
    startDate: '2026-04-01',
    endDate: '2026-10-31',
    status: 'active',
    room: 'Lab 2 - Nuke Suite',
    classesCompleted: 42,
    classesRemaining: 18,
    isPracticeDoubtClass: false
  },
  {
    id: '3',
    batchIdCode: 'MAAC-GD-03',
    name: 'Graphic Design Masterclass',
    course: 'Graphic Design',
    teacherId: '2',
    teacherName: 'Rahul Sharma',
    startTime: '10:00',
    endTime: '12:00',
    days: ['Monday', 'Wednesday', 'Friday'],
    capacity: 20,
    enrolledStudents: 18,
    studentIds: ['5'],
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    status: 'active',
    room: 'Lab 3 - Design Bay',
    classesCompleted: 28,
    classesRemaining: 8,
    isPracticeDoubtClass: false
  },
  {
    id: '4',
    batchIdCode: 'MAAC-MG-04',
    name: 'Motion Graphics & C4D',
    course: 'Motion Graphics',
    teacherId: '3',
    teacherName: 'Priya Patel',
    startTime: '16:00',
    endTime: '18:00',
    days: ['Tuesday', 'Thursday'],
    capacity: 15,
    enrolledStudents: 12,
    studentIds: ['4'],
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    status: 'upcoming',
    room: 'Lab 4 - After Effects Hub',
    classesCompleted: 0,
    classesRemaining: 32,
    isPracticeDoubtClass: false
  },
  {
    id: '5',
    batchIdCode: 'MAAC-PRACTICE-01',
    name: '3D Maya Practice & Doubt Session',
    course: 'Animation',
    teacherId: '2',
    teacherName: 'Rahul Sharma',
    startTime: '12:30',
    endTime: '14:00',
    days: ['Wednesday', 'Saturday'],
    capacity: 20,
    enrolledStudents: 14,
    studentIds: ['4', '5'],
    startDate: '2026-05-01',
    endDate: '2026-10-31',
    status: 'active',
    room: 'Lab 1 - Maya Studio',
    classesCompleted: 16,
    classesRemaining: 16,
    isPracticeDoubtClass: true
  }
];

export const mockAttendance: Attendance[] = [
  {
    id: '1',
    studentId: '4',
    studentName: 'Amit Kumar',
    batchId: '1',
    batchName: 'Animation Premium',
    date: '2024-07-15',
    status: 'present',
    topic: 'Maya Interface Basics',
    assignmentSubmitted: true,
    grade: 'A',
    markedBy: '2',
    markedAt: '2024-07-15T09:05:00'
  },
  {
    id: '2',
    studentId: '5',
    studentName: 'Sneha Gupta',
    batchId: '1',
    batchName: 'Animation Premium',
    date: '2024-07-15',
    status: 'late',
    topic: 'Maya Interface Basics',
    assignmentSubmitted: false,
    grade: 'B+',
    markedBy: '2',
    markedAt: '2024-07-15T09:15:00'
  },
  {
    id: '3',
    studentId: '4',
    studentName: 'Amit Kumar',
    batchId: '1',
    batchName: 'Animation Premium',
    date: '2024-07-14',
    status: 'present',
    topic: 'Viewport Navigation',
    assignmentSubmitted: true,
    grade: 'A+',
    markedBy: '2',
    markedAt: '2024-07-14T09:03:00'
  },
  {
    id: '4',
    studentId: '5',
    studentName: 'Sneha Gupta',
    batchId: '1',
    batchName: 'Animation Premium',
    date: '2024-07-14',
    status: 'absent',
    topic: '',
    assignmentSubmitted: false,
    markedBy: '2',
    markedAt: '2024-07-14T09:05:00'
  }
];

export const mockLessonPlans: LessonPlan[] = [
  {
    id: '1',
    batchId: '1',
    batchName: 'Animation Premium',
    teacherId: '2',
    teacherName: 'Rahul Sharma',
    title: 'Introduction to Maya Interface',
    description: 'Learn the basic interface elements of Autodesk Maya including viewport, menus, and tool shelves.',
    date: '2024-07-15',
    duration: '2 hours',
    chapters: [
      {
        id: 'c1',
        name: 'Chapter 1: Maya Interface Basics',
        plannedDurationMinutes: 30,
        subTopics: [
          { id: 'st1', name: 'Maya UI Overview', isCompleted: true, startedAt: '2024-07-15T09:00:00', completedAt: '2024-07-15T09:12:00', timeSpentMinutes: 12 },
          { id: 'st2', name: 'Viewport Navigation', isCompleted: true, startedAt: '2024-07-15T09:12:00', completedAt: '2024-07-15T09:25:00', timeSpentMinutes: 13 },
          { id: 'st3', name: 'Menu Bar & Shelf', isCompleted: true, startedAt: '2024-07-15T09:25:00', completedAt: '2024-07-15T09:38:00', timeSpentMinutes: 13 },
          { id: 'st4', name: 'Channel Box & Attribute Editor', isCompleted: true, startedAt: '2024-07-15T09:38:00', completedAt: '2024-07-15T09:50:00', timeSpentMinutes: 12 }
        ]
      },
      {
        id: 'c2',
        name: 'Chapter 2: Essential Tools',
        plannedDurationMinutes: 45,
        subTopics: [
          { id: 'st5', name: 'Selection Tools', isCompleted: true, startedAt: '2024-07-15T10:00:00', completedAt: '2024-07-15T10:15:00', timeSpentMinutes: 15 },
          { id: 'st6', name: 'Transform Tools', isCompleted: true, startedAt: '2024-07-15T10:15:00', completedAt: '2024-07-15T10:32:00', timeSpentMinutes: 17 },
          { id: 'st7', name: 'Hotkeys & Shortcuts', isCompleted: false, startedAt: '2024-07-15T10:32:00', completedAt: null, timeSpentMinutes: 8 },
          { id: 'st8', name: 'Customizing the UI', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 }
        ]
      },
      {
        id: 'c3',
        name: 'Chapter 3: Viewport Mastery',
        plannedDurationMinutes: 45,
        subTopics: [
          { id: 'st9', name: 'Camera Controls', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st10', name: 'Display Modes', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st11', name: 'Panel Layouts', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 }
        ]
      }
    ],
    status: 'in-progress',
    materials: ['Maya Software', 'Practice Files', 'Video Tutorial']
  },
  {
    id: '2',
    batchId: '1',
    batchName: 'Animation Premium',
    teacherId: '2',
    teacherName: 'Rahul Sharma',
    title: '3D Modeling Fundamentals',
    description: 'Understanding polygonal modeling and creating basic 3D shapes.',
    date: '2024-07-17',
    duration: '2.5 hours',
    chapters: [
      {
        id: 'c4',
        name: 'Chapter 1: Polygon Basics',
        plannedDurationMinutes: 40,
        subTopics: [
          { id: 'st12', name: 'Polygon Primitives', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st13', name: 'Component Mode', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st14', name: 'Vertex, Edge, Face', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 }
        ]
      },
      {
        id: 'c5',
        name: 'Chapter 2: Modeling Tools',
        plannedDurationMinutes: 50,
        subTopics: [
          { id: 'st15', name: 'Extrude', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st16', name: 'Bevel', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st17', name: 'Bridge', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st18', name: 'Multi-Cut Tool', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 }
        ]
      }
    ],
    status: 'planned',
    materials: ['Maya Software', 'Modeling References']
  },
  {
    id: '3',
    batchId: '2',
    batchName: 'VFX Professional',
    teacherId: '3',
    teacherName: 'Priya Patel',
    title: 'Introduction to Nuke',
    description: 'Getting started with The Foundry Nuke for compositing.',
    date: '2024-07-16',
    duration: '3 hours',
    chapters: [
      {
        id: 'c6',
        name: 'Chapter 1: Nuke Fundamentals',
        plannedDurationMinutes: 50,
        subTopics: [
          { id: 'st19', name: 'Nuke Interface', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st20', name: 'Node Graph Basics', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st21', name: 'Reading Footage', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 }
        ]
      },
      {
        id: 'c7',
        name: 'Chapter 2: Basic Compositing',
        plannedDurationMinutes: 50,
        subTopics: [
          { id: 'st22', name: 'Merge & Copy', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st23', name: 'Color Correction', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 },
          { id: 'st24', name: 'Roto & Paint', isCompleted: false, startedAt: null, completedAt: null, timeSpentMinutes: 0 }
        ]
      }
    ],
    status: 'planned',
    materials: ['Nuke Software', 'Demo Footage']
  }
];

export const mockStudentProgress: StudentProgress[] = [
  {
    id: '1',
    studentId: '4',
    studentName: 'Amit Kumar',
    batchId: '1',
    batchName: 'Animation Premium',
    overallScore: 85,
    attendancePercentage: 92,
    assignmentsCompleted: 12,
    totalAssignments: 15,
    lastUpdated: '2024-07-15'
  },
  {
    id: '2',
    studentId: '5',
    studentName: 'Sneha Gupta',
    batchId: '1',
    batchName: 'Animation Premium',
    overallScore: 78,
    attendancePercentage: 88,
    assignmentsCompleted: 10,
    totalAssignments: 15,
    lastUpdated: '2024-07-15'
  }
];

export const mockFeeRecords: FeeRecord[] = [
  {
    id: '1',
    studentId: '4',
    studentName: 'Amit Kumar',
    batchId: '1',
    batchName: 'Animation Premium',
    amount: 25000,
    paidDate: '2024-04-01',
    dueDate: '2024-04-01',
    status: 'paid',
    paymentMethod: 'UPI',
    transactionId: 'TXN123456'
  },
  {
    id: '2',
    studentId: '5',
    studentName: 'Sneha Gupta',
    batchId: '1',
    batchName: 'Animation Premium',
    amount: 25000,
    paidDate: '2024-04-01',
    dueDate: '2024-04-01',
    status: 'paid',
    paymentMethod: 'Cash',
    transactionId: 'TXN123457'
  },
  {
    id: '3',
    studentId: '4',
    studentName: 'Amit Kumar',
    batchId: '1',
    batchName: 'Animation Premium',
    amount: 25000,
    paidDate: '',
    dueDate: '2024-07-01',
    status: 'overdue',
    paymentMethod: ''
  }
];

export const mockDashboardStats: DashboardStats = {
  totalStudents: 156,
  totalTeachers: 12,
  totalBatches: 8,
  activeBatches: 6,
  attendanceToday: 142,
  feesCollected: 1250000,
  feesPending: 350000,
  newAdmissions: 24
};

export const courseOptions = [
  'Animation',
  'VFX',
  'Graphic Design',
  'Motion Graphics',
  'Web Design',
  'Game Design'
];

export const timeSlots = [
  '09:00-12:00',
  '10:00-12:00',
  '14:00-17:00',
  '16:00-18:00'
];

export const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const mockInquiries: InquiryLead[] = [
  {
    id: 'inq-1',
    studentName: 'Rohan Deshmukh',
    phone: '+91 98112 34567',
    email: 'rohan.d@gmail.com',
    interestedCourse: 'Animation',
    source: 'Website',
    status: 'counseling-scheduled',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    notes: 'Interested in 3D Character Animation. Scheduled campus visit for counseling demo.',
    followUpDate: '2026-08-23',
    createdAt: '2026-08-20',
    budget: 85000
  },
  {
    id: 'inq-2',
    studentName: 'Ananya Verma',
    phone: '+91 98223 45678',
    email: 'ananya.v@yahoo.com',
    interestedCourse: 'VFX',
    source: 'Walk-in',
    status: 'demo-booked',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    notes: 'Completed 12th standard, passionate about Hollywood VFX pipelines. Demo booked for tomorrow.',
    followUpDate: '2026-08-24',
    createdAt: '2026-08-19',
    budget: 120000
  },
  {
    id: 'inq-3',
    studentName: 'Varun Joshi',
    phone: '+91 98334 56789',
    email: 'varun.j@gmail.com',
    interestedCourse: 'Game Design',
    source: 'Social Media',
    status: 'new',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    notes: 'Enquired via Instagram ad about Unity & Unreal Engine courses. Needs intro call.',
    followUpDate: '2026-08-23',
    createdAt: '2026-08-22',
    budget: 95000
  },
  {
    id: 'inq-4',
    studentName: 'Tanvi Saxena',
    phone: '+91 98445 67890',
    email: 'tanvi.s@gmail.com',
    interestedCourse: 'Graphic Design',
    source: 'Referral',
    status: 'enrolled',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    notes: 'Enrolled in Batch 3 Graphic Design masterclass. Advance token fee paid.',
    followUpDate: '2026-08-21',
    createdAt: '2026-08-15',
    budget: 65000
  },
  {
    id: 'inq-5',
    studentName: 'Aditya Mehta',
    phone: '+91 98556 78901',
    email: 'aditya.m@outlook.com',
    interestedCourse: 'Motion Graphics',
    source: 'Phone Call',
    status: 'contacted',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    notes: 'Working professional looking for weekend batch for After Effects and Cinema 4D.',
    followUpDate: '2026-08-25',
    createdAt: '2026-08-18',
    budget: 70000
  },
  {
    id: 'inq-6',
    studentName: 'Kavya Nair',
    phone: '+91 98667 89012',
    email: 'kavya.nair@gmail.com',
    interestedCourse: 'Animation',
    source: 'Walk-in',
    status: 'enrolled',
    counselorName: 'Priya Sharma',
    counselorId: '8',
    notes: 'Enrolled into 3D Animation Foundation course.',
    followUpDate: '2026-08-20',
    createdAt: '2026-08-10',
    budget: 90000
  }
];


import { Schema, models, model, Document } from 'mongoose';

export interface IBatch extends Document {
  batchIdCode: string;
  name: string;
  course: string;
  software?: string;
  totalSessions?: number;
  currentSessionIndex?: number;
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
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    batchIdCode: { type: String, required: true, index: true },
    name: { type: String, required: true },
    course: { type: String, required: true, index: true },
    software: { type: String, default: '' },
    totalSessions: { type: Number, default: 16 },
    currentSessionIndex: { type: Number, default: 0 },
    teacherId: { type: String, required: true },
    teacherName: { type: String, default: '' },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '12:00' },
    days: { type: [String], default: [] },
    capacity: { type: Number, default: 999 },
    enrolledStudents: { type: Number, default: 0 },
    studentIds: { type: [String], default: [] },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'completed', 'upcoming'],
      default: 'upcoming',
      index: true,
    },
    room: { type: String, default: '' },
    classesCompleted: { type: Number, default: 0 },
    classesRemaining: { type: Number, default: 16 },
    isPracticeDoubtClass: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// A human-readable batch code should be unique when provided
BatchSchema.index({ batchIdCode: 1 }, { unique: true, sparse: true });

const BatchModel =
  models.Batch || model<IBatch>('Batch', BatchSchema);

export default BatchModel;

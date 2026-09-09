import { Schema, models, model, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  topic: string;
  assignmentSubmitted: boolean;
  grade: string;
  markedBy: string;
  markedAt: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    batchId: { type: String, required: true, index: true },
    batchName: { type: String, default: '' },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },
    topic: { type: String, default: '' },
    assignmentSubmitted: { type: Boolean, default: false },
    grade: { type: String, default: '' },
    markedBy: { type: String, default: '' },
    markedAt: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// One record per student per batch per day — prevents duplicates
AttendanceSchema.index({ studentId: 1, batchId: 1, date: 1 }, { unique: true });

const AttendanceModel =
  models.Attendance || model<IAttendance>('Attendance', AttendanceSchema);

export default AttendanceModel;

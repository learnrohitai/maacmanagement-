import { Schema, models, model, Document } from 'mongoose';

export type EmiStatus = 'paid' | 'unpaid';

export interface IEmiSchedule extends Document {
  studentId: string; // Mongo _id of the Student doc
  studentCode: string; // human code e.g. MAAC-2026-001
  studentName: string;
  course: string;
  totalFees: number;
  months: number; // course duration months = EMI count
  installmentNo: number; // 1-based within the plan
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: EmiStatus;
  paidAmount: number;
  paidDate: string | null;
  paymentMethod: string;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmiScheduleSchema = new Schema<IEmiSchedule>(
  {
    studentId: { type: String, required: true, index: true },
    studentCode: { type: String, default: '', index: true },
    studentName: { type: String, default: '' },
    course: { type: String, default: '' },
    totalFees: { type: Number, default: 0 },
    months: { type: Number, default: 0 },
    installmentNo: { type: Number, required: true },
    amount: { type: Number, default: 0 },
    dueDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'unpaid',
      index: true,
    },
    paidAmount: { type: Number, default: 0 },
    paidDate: { type: String, default: null },
    paymentMethod: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// One installment per student per number — regenerating a plan replaces
// the student's docs (deleteMany + insertMany inside the API).
EmiScheduleSchema.index({ studentId: 1, installmentNo: 1 }, { unique: true });

const EmiScheduleModel =
  models.EmiSchedule || model<IEmiSchedule>('EmiSchedule', EmiScheduleSchema);

export default EmiScheduleModel;

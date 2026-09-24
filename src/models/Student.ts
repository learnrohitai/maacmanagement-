import { Schema, models, model, Document } from 'mongoose';

export interface IStudentDoc extends Document {
  studentCode: string; // human code, e.g. MAAC-0001
  fullName: string;
  contactNo: string;
  email: string;
  parentName: string;
  parentContact: string;
  dob: string;
  course: string;
  admissionDate: string;
  counselorName: string;
  assignedBatches: string[];
  feesDueDate: string;
  totalFees: number;
  feesPaid: number;
  paymentStatus: string;
  studentStatus: string;
  remarks: string;
  contactVerified: boolean; // student contactNo confirmed via WhatsApp OTP
  parentContactVerified: boolean; // parentContact confirmed via WhatsApp OTP
  createdAt: Date;
  updatedAt: Date;
}

const StudentDocSchema = new Schema<IStudentDoc>(
  {
    studentCode: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    contactNo: { type: String, default: '' },
    email: { type: String, default: '' },
    parentName: { type: String, default: '' },
    parentContact: { type: String, default: '', index: true },
    dob: { type: String, default: '' },
    course: { type: String, default: '', index: true },
    admissionDate: { type: String, default: '' },
    counselorName: { type: String, default: '' },
    assignedBatches: { type: [String], default: [] },
    feesDueDate: { type: String, default: '' },
    totalFees: { type: Number, default: 0 },
    feesPaid: { type: Number, default: 0 },
    paymentStatus: { type: String, default: 'Pending' },
    studentStatus: { type: String, default: 'Active', index: true },
    remarks: { type: String, default: '' },
    contactVerified: { type: Boolean, default: false },
    parentContactVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One student per unique student code
StudentDocSchema.index({ studentCode: 1 }, { unique: true });

const StudentModel =
  models.Student || model<IStudentDoc>('Student', StudentDocSchema);

export default StudentModel;

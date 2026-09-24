import { Schema, models, model, Document } from 'mongoose';

export type OtpRole = 'student' | 'parent';
export type OtpStatus = 'pending' | 'verified' | 'expired' | 'failed';

export interface IOtpVerification extends Document {
  phone: string; // normalized 91XXXXXXXXXX
  role: OtpRole; // which number of the student we are verifying
  studentId: string; // optional link to the student (studentCode or _id)
  codeHash: string; // sha256(phone:code:secret) — never store the raw code
  status: OtpStatus;
  attempts: number; // wrong-code attempts for the current code
  sendCount: number; // how many codes have been sent to this phone
  lastSentAt: Date;
  expiresAt: Date;
  verifiedAt: Date | null;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    phone: { type: String, required: true, index: true },
    role: { type: String, enum: ['student', 'parent'], required: true },
    studentId: { type: String, default: '', index: true },
    codeHash: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired', 'failed'],
      default: 'pending',
    },
    attempts: { type: Number, default: 0 },
    sendCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Latest lookup per number + role
OtpVerificationSchema.index({ phone: 1, role: 1, createdAt: -1 });

const OtpVerificationModel =
  models.OtpVerification ||
  model<IOtpVerification>('OtpVerification', OtpVerificationSchema);

export default OtpVerificationModel;

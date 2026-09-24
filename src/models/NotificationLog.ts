import { Schema, models, model, Document } from 'mongoose';

export interface INotificationLog extends Document {
  type: string; // e.g. 'absence_alert'
  studentId: string;
  studentName: string;
  parentContact: string; // normalized WhatsApp number
  batchId: string;
  templateName: string;
  dates: string[]; // absent dates that triggered the alert
  watiStatus: number; // HTTP status from WATI
  ok: boolean;
  error: string;
  createdAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    type: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: '' },
    parentContact: { type: String, default: '' },
    batchId: { type: String, default: '', index: true },
    templateName: { type: String, default: '' },
    dates: { type: [String], default: [] },
    watiStatus: { type: Number, default: 0 },
    ok: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

const NotificationLogModel =
  models.NotificationLog ||
  model<INotificationLog>('NotificationLog', NotificationLogSchema);

export default NotificationLogModel;

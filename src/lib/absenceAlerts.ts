import AttendanceModel from '@/models/Attendance';
import NotificationLogModel from '@/models/NotificationLog';
import StudentModel from '@/models/Student';
import { sendAbsenceAlert, isWatiConfigured } from '@/lib/wati';

/**
 * Parent absence alerts.
 *
 * Rule: when a student is marked ABSENT and this is their 2nd (or later)
 * CONSECUTIVE absent session in the same batch, send the parent a WhatsApp
 * message via WATI listing all consecutive absent dates.
 *
 * Delivery is fire-and-forget: a failure to reach WATI must never break the
 * attendance save. Every attempt (success or failure) is logged in the
 * `notificationlogs` collection so the institute has an audit trail and we
 * never re-send the same alert for the same date chain.
 */

/** Dates (YYYY-MM-DD) of the current consecutive-absent run ending at `date`. */
export async function getConsecutiveAbsences(
  studentId: string,
  batchId: string,
  currentDate: string
): Promise<string[]> {
  const docs = await AttendanceModel.find({
    studentId,
    batchId,
    status: 'absent',
  })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  // Walk backwards from the current date collecting the unbroken absent run.
  const run: string[] = [];
  let expected = currentDate;
  for (const doc of docs) {
    const d = String(doc.date);
    if (d === expected) {
      run.push(d);
      // step back one day (calendar days; fine for session-per-day cadence)
      const prev = new Date(`${d}T00:00:00Z`);
      prev.setUTCDate(prev.getUTCDate() - 1);
      expected = prev.toISOString().slice(0, 10);
    } else {
      break;
    }
  }
  return run.reverse(); // oldest → newest
}

function formatDatesForMessage(dates: string[]): string {
  return dates
    .map((d) => {
      try {
        return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        });
      } catch {
        return d;
      }
    })
    .join(', ');
}

/**
 * Check a just-saved absent record and alert the parent if needed.
 * Called from the attendance POST API after a successful bulk write.
 */
export async function processAbsenceAlerts(
  savedRecords: Array<{
    studentId: string;
    studentName: string;
    batchId: string;
    batchName: string;
    date: string;
    status: string;
  }>
): Promise<void> {
  if (!isWatiConfigured()) return;

  const absentRecords = savedRecords.filter((r) => r.status === 'absent');
  if (absentRecords.length === 0) return;

  // All alerts for one submit run in parallel but never throw.
  await Promise.allSettled(absentRecords.map(handleOne));
}

async function handleOne(rec: {
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  date: string;
}): Promise<void> {
  try {
    const dates = await getConsecutiveAbsences(rec.studentId, rec.batchId, rec.date);
    if (dates.length < 2) return; // only alert from the 2nd consecutive absence

    // Skip if we already notified for this exact date chain.
    const existing = await NotificationLogModel.findOne({
      type: 'absence_alert',
      studentId: rec.studentId,
      batchId: rec.batchId,
      dates: { $all: dates, $size: dates.length },
      ok: true,
    }).lean();
    if (existing) return;

    // Parent contact: prefer the Student master record, fall back to the
    // legacy User collection fields.
    let parentContact = '';
    let parentName = '';
    const student = await StudentModel.findOne({
      $or: [{ studentCode: rec.studentId }, { fullName: rec.studentName }],
    })
      .sort({ updatedAt: -1 })
      .lean();
    if (student?.parentContact) {
      parentContact = student.parentContact;
      parentName = student.parentName || '';
    }

    const result = await sendAbsenceAlert({
      parentContact,
      studentName: rec.studentName,
      absentDates: formatDatesForMessage(dates),
      batchName: rec.batchName || 'their batch',
    });

    await NotificationLogModel.create({
      type: 'absence_alert',
      studentId: rec.studentId,
      studentName: rec.studentName,
      parentContact,
      batchId: rec.batchId,
      templateName: process.env.WATI_ABSENT_TEMPLATE_NAME || '',
      dates,
      watiStatus: result.status,
      ok: result.ok,
      error: result.error || (!result.ok ? JSON.stringify(result.response).slice(0, 500) : ''),
    });
  } catch (e) {
    // Never break the attendance save because of notification issues.
    console.error('absence alert failed:', e);
  }
}

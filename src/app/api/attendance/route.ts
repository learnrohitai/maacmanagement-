import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AttendanceModel from '@/models/Attendance';

// GET /api/attendance?batchId=...&date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const date = searchParams.get('date');

    const query: Record<string, string> = {};
    if (batchId) query.batchId = batchId;
    if (date) query.date = date;

    const records = await AttendanceModel.find(query).lean();
    return NextResponse.json({ records });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch attendance';
    return NextResponse.json({ message }, { status: 500 });
  }
}

interface AttendanceInput {
  studentId?: unknown;
  studentName?: unknown;
  batchId?: unknown;
  batchName?: unknown;
  date?: unknown;
  status?: unknown;
  topic?: unknown;
  assignmentSubmitted?: unknown;
  grade?: unknown;
  markedBy?: unknown;
  markedAt?: unknown;
}

function normalizeRecord(raw: AttendanceInput) {
  return {
    studentId: String(raw.studentId ?? ''),
    studentName: String(raw.studentName ?? ''),
    batchId: String(raw.batchId ?? ''),
    batchName: String(raw.batchName ?? ''),
    date: String(raw.date ?? ''),
    status: raw.status === 'absent' || raw.status === 'late' ? raw.status : 'present',
    topic: String(raw.topic ?? ''),
    assignmentSubmitted: Boolean(raw.assignmentSubmitted),
    grade: String(raw.grade ?? ''),
    markedBy: String(raw.markedBy ?? ''),
    markedAt: String(raw.markedAt ?? new Date().toISOString()),
  };
}

// POST /api/attendance — bulk upsert (one record per student/batch/date)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = (await request.json()) as { records?: AttendanceInput[] };
    const rawRecords = Array.isArray(body.records) ? body.records : [];

    if (rawRecords.length === 0) {
      return NextResponse.json(
        { message: 'No attendance records provided' },
        { status: 400 }
      );
    }

    const docs = rawRecords.map(normalizeRecord).filter(
      (r) => r.studentId && r.batchId && r.date
    );

    const ops = docs.map((doc) => ({
      replaceOne: {
        filter: { studentId: doc.studentId, batchId: doc.batchId, date: doc.date },
        replacement: doc,
        upsert: true,
      },
    }));

    const result = await AttendanceModel.bulkWrite(ops);

    const saved = await AttendanceModel.find({
      batchId: docs[0].batchId,
      date: docs[0].date,
    }).lean();

    return NextResponse.json({
      upserted: result.upsertedCount ?? 0,
      modified: result.modifiedCount ?? 0,
      records: saved,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save attendance';
    return NextResponse.json({ message }, { status: 500 });
  }
}

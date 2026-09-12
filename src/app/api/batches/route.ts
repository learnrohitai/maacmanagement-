import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BatchModel, { IBatch } from '@/models/Batch';

// GET /api/batches — list all batches (optionally ?course=... or ?id=...)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');

    const query: Record<string, string> = {};
    if (course) query.course = course;

    const batches = await BatchModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ batches });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch batches';
    return NextResponse.json({ message }, { status: 500 });
  }
}

function normalizeBatchInput(body: Record<string, unknown>) {
  const days = Array.isArray(body.days)
    ? body.days.map((d) => String(d))
    : typeof body.days === 'string' && body.days.length > 0
      ? body.days.split(',').map((d) => d.trim())
      : [];

  const studentIds = Array.isArray(body.studentIds)
    ? body.studentIds.map((s) => String(s))
    : [];

  return {
    batchIdCode: String(body.batchIdCode ?? ''),
    name: String(body.name ?? '').trim(),
    course: String(body.course ?? '').trim(),
    software: String(body.software ?? body.course ?? ''),
    totalSessions: Number(body.totalSessions ?? 16),
    currentSessionIndex: Number(body.currentSessionIndex ?? 0),
    teacherId: String(body.teacherId ?? ''),
    teacherName: String(body.teacherName ?? ''),
    startTime: String(body.startTime ?? '09:00'),
    endTime: String(body.endTime ?? '12:00'),
    days,
    capacity: Number(body.capacity ?? 999),
    enrolledStudents: studentIds.length,
    studentIds,
    startDate: String(body.startDate ?? ''),
    endDate: String(body.endDate ?? ''),
    status:
      body.status === 'active' || body.status === 'completed' || body.status === 'upcoming'
        ? body.status
        : 'upcoming',
    room: String(body.room ?? ''),
    classesCompleted: Number(body.classesCompleted ?? 0),
    classesRemaining: Number(body.classesRemaining ?? 16),
    isPracticeDoubtClass: Boolean(body.isPracticeDoubtClass),
  };
}

// POST /api/batches — create a new batch
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = (await request.json()) as Record<string, unknown>;
    const data = normalizeBatchInput(body);

    if (!data.name || !data.course) {
      return NextResponse.json(
        { message: 'Batch name and course/software are required' },
        { status: 400 }
      );
    }

    // Avoid duplicate batch codes
    if (data.batchIdCode) {
      const existing = await BatchModel.findOne({ batchIdCode: data.batchIdCode }).lean();
      if (existing) {
        return NextResponse.json(
          { message: `Batch code "${data.batchIdCode}" already exists. Please use a unique batch code.` },
          { status: 409 }
        );
      }
    }

    const doc = await BatchModel.create(data);

    return NextResponse.json({ batch: doc }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create batch';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PUT /api/batches?id=... — update an existing batch
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Batch id is required' }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const data = normalizeBatchInput(body);
    delete (data as Record<string, unknown>).batchIdCode; // never overwrite the unique code blindly

    const updated = await BatchModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json({ batch: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update batch';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/batches?id=... — remove a batch
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Batch id is required' }, { status: 400 });
    }

    const deleted = await BatchModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ message: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete batch';
    return NextResponse.json({ message }, { status: 500 });
  }
}

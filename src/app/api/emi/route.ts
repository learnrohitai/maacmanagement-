import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import EmiScheduleModel from '@/models/EmiSchedule';
import StudentModel from '@/models/Student';
import { generateEmiPlan, getCourseDurationMonths } from '@/lib/emi';

/**
 * EMI Schedule API — monthly installments derived from course duration.
 *
 * GET    /api/emi                        → all installments (joined with student list)
 * GET    /api/emi?studentId=...          → one student's plan
 * POST   /api/emi  { studentId }         → (re)generate plan from course duration
 *                                          { feeMode: 'split' | 'auto' } splits the
 *                                          student's actual totalFees over the months.
 * PUT    /api/emi?id=...                 → mark installment paid/unpaid
 *                                          { status, paidDate?, paymentMethod?, remarks? }
 *                                          Syncs feesPaid / paymentStatus on the student.
 */

function toEmiJson(d: Record<string, unknown>) {
  return {
    id: String(d._id ?? ''),
    studentId: String(d.studentId ?? ''),
    studentCode: String(d.studentCode ?? ''),
    studentName: String(d.studentName ?? ''),
    course: String(d.course ?? ''),
    totalFees: Number(d.totalFees ?? 0),
    months: Number(d.months ?? 0),
    installmentNo: Number(d.installmentNo ?? 0),
    amount: Number(d.amount ?? 0),
    dueDate: String(d.dueDate ?? ''),
    status: d.status === 'paid' ? 'paid' : 'unpaid',
    paidAmount: Number(d.paidAmount ?? 0),
    paidDate: d.paidDate ? String(d.paidDate) : null,
    paymentMethod: String(d.paymentMethod ?? ''),
    remarks: String(d.remarks ?? ''),
  };
}

/** Recompute student-master fee aggregates from the EMI plan. */
async function syncStudentFeeStatus(studentId: string) {
  const emis = await EmiScheduleModel.find({ studentId }).lean();
  if (emis.length === 0) return;

  const paidAmount = emis
    .filter((e) => e.status === 'paid')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalFees = emis.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const today = new Date().toISOString().slice(0, 10);
  const overdue = emis.some((e) => e.status !== 'paid' && e.dueDate && e.dueDate < today);

  let paymentStatus: string;
  if (paidAmount >= totalFees - 0.01) paymentStatus = 'Paid';
  else if (overdue) paymentStatus = 'Overdue';
  else if (paidAmount > 0) paymentStatus = 'Partial';
  else paymentStatus = 'Pending';

  await StudentModel.updateOne(
    { _id: studentId },
    { $set: { feesPaid: Math.round(paidAmount * 100) / 100, paymentStatus } }
  );
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const query = studentId ? { studentId } : {};
    const emis = await EmiScheduleModel.find(query).sort({ studentId: 1, installmentNo: 1 }).lean();

    // Students without a plan yet (so accounts can generate one from the UI)
    const students = await StudentModel.find({}).sort({ createdAt: -1 }).lean();
    const withPlan = new Set(emis.map((e) => String(e.studentId)));
    const missingPlans = students
      .filter((s) => !withPlan.has(String(s._id)))
      .map((s) => ({
        id: String(s._id),
        studentCode: s.studentCode,
        fullName: s.fullName,
        course: s.course,
        totalFees: s.totalFees,
        months: getCourseDurationMonths(s.course) ?? 0,
      }));

    return NextResponse.json({
      emis: emis.map((e) => toEmiJson(e as unknown as Record<string, unknown>)),
      missingPlans,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch EMI schedule';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = (await request.json()) as Record<string, unknown>;
    const studentId = String(body.studentId ?? '').trim();
    if (!studentId) {
      return NextResponse.json({ message: 'studentId is required' }, { status: 400 });
    }

    const student = await StudentModel.findById(studentId).lean();
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const months = getCourseDurationMonths(student.course);
    if (!months) {
      return NextResponse.json(
        { message: `Course duration not found for "${student.course}" — cannot generate EMI plan` },
        { status: 400 }
      );
    }
    if (!student.totalFees || student.totalFees <= 0) {
      return NextResponse.json(
        { message: 'Student has no total fees set — set total fees first' },
        { status: 400 }
      );
    }

    const plan = generateEmiPlan({
      course: student.course,
      totalFees: student.totalFees,
      admissionDate: student.admissionDate || new Date().toISOString().slice(0, 10),
      feesPaid: student.feesPaid ?? 0,
    });
    if (plan.length === 0) {
      return NextResponse.json({ message: 'Could not generate EMI plan' }, { status: 400 });
    }

    // Regenerate = replace the student's previous plan atomically-ish
    await EmiScheduleModel.deleteMany({ studentId });
    const created = await EmiScheduleModel.insertMany(
      plan.map((p) => ({
        studentId,
        studentCode: student.studentCode,
        studentName: student.fullName,
        course: student.course,
        totalFees: student.totalFees,
        months,
        ...p,
      }))
    );

    await syncStudentFeeStatus(studentId);

    return NextResponse.json(
      { emis: created.map((e) => toEmiJson(e as unknown as Record<string, unknown>)), months },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate EMI plan';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'EMI id is required' }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const existing = await EmiScheduleModel.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ message: 'EMI installment not found' }, { status: 404 });
    }

    const status = body.status === 'paid' ? 'paid' : 'unpaid';
    const update: Record<string, unknown> = {
      status,
      paidAmount: status === 'paid' ? existing.amount : 0,
      paidDate:
        status === 'paid'
          ? String(body.paidDate ?? new Date().toISOString().slice(0, 10))
          : null,
      paymentMethod: status === 'paid' ? String(body.paymentMethod ?? 'Cash') : '',
      remarks: String(body.remarks ?? existing.remarks ?? ''),
    };

    const updated = await EmiScheduleModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ message: 'EMI installment not found' }, { status: 404 });
    }

    await syncStudentFeeStatus(String(updated.studentId));

    return NextResponse.json({ emi: toEmiJson(updated as unknown as Record<string, unknown>) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update EMI installment';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) {
      return NextResponse.json({ message: 'studentId is required' }, { status: 400 });
    }

    await EmiScheduleModel.deleteMany({ studentId });
    await syncStudentFeeStatus(studentId).catch(() => undefined);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete EMI plan';
    return NextResponse.json({ message }, { status: 500 });
  }
}

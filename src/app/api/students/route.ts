import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudentModel, { IStudentDoc } from '@/models/Student';
import EmiScheduleModel from '@/models/EmiSchedule';
import { generateEmiPlan } from '@/lib/emi';
import { buildCsvTemplate, parseCsv, rowsToUpserts } from '@/lib/studentCsv';

/**
 * Students API — Student Master database.
 *
 * GET    /api/students            → list all students
 * GET    /api/students?template=1 → download CSV import template
 * POST   /api/students            → create one student
 * POST   /api/students?mode=csv   → bulk import students from CSV text
 * PUT    /api/students?id=...     → update a student
 * DELETE /api/students?id=...     → delete a student
 */

function toStudentJson(d: IStudentDoc) {
  return {
    id: String(d._id),
    studentCode: d.studentCode,
    fullName: d.fullName,
    contactNo: d.contactNo,
    email: d.email,
    parentName: d.parentName,
    parentContact: d.parentContact,
    dob: d.dob,
    course: d.course,
    admissionDate: d.admissionDate,
    counselorName: d.counselorName,
    assignedBatches: d.assignedBatches,
    feesDueDate: d.feesDueDate,
    totalFees: d.totalFees,
    feesPaid: d.feesPaid,
    paymentStatus: d.paymentStatus,
    studentStatus: d.studentStatus,
    remarks: d.remarks,
    contactVerified: Boolean(d.contactVerified),
    parentContactVerified: Boolean(d.parentContactVerified),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get('template') === '1') {
      return new NextResponse(buildCsvTemplate(), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="student-import-template.csv"',
        },
      });
    }

    await connectToDatabase();
    const students = await StudentModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ students: students.map(toStudentJson) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch students';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    // ---- CSV bulk import -------------------------------------------------
    if (searchParams.get('mode') === 'csv') {
      const body = (await request.json()) as { csv?: string };
      const csv = String(body.csv ?? '');
      if (!csv.trim()) {
        return NextResponse.json({ message: 'CSV content is empty' }, { status: 400 });
      }

      const parsed = parseCsv(csv);
      if (parsed.length < 2) {
        return NextResponse.json(
          { message: 'CSV needs a header row plus at least one data row' },
          { status: 400 }
        );
      }

      const { ops, results } = rowsToUpserts(parsed);
      if (ops.length === 0) {
        return NextResponse.json({ message: 'No valid rows found', results }, { status: 400 });
      }

      const bulk = await StudentModel.bulkWrite(ops);
      const failed = results.filter((r) => !r.ok);
      return NextResponse.json({
        imported: bulk.upsertedCount ?? 0,
        updated: bulk.modifiedCount ?? 0,
        failedCount: failed.length,
        failed: failed.slice(0, 50),
      });
    }

    // ---- Single create ---------------------------------------------------
    const body = (await request.json()) as Record<string, unknown>;
    const studentCode = String(body.studentCode ?? '').trim();
    const fullName = String(body.fullName ?? '').trim();
    if (!studentCode || !fullName) {
      return NextResponse.json(
        { message: 'studentCode and fullName are required' },
        { status: 400 }
      );
    }

    const existing = await StudentModel.findOne({ studentCode }).lean();
    if (existing) {
      return NextResponse.json(
        { message: `Student code "${studentCode}" already exists` },
        { status: 409 }
      );
    }

    const created = await StudentModel.create({
      studentCode,
      fullName,
      contactNo: String(body.contactNo ?? ''),
      email: String(body.email ?? ''),
      parentName: String(body.parentName ?? ''),
      parentContact: String(body.parentContact ?? ''),
      dob: String(body.dob ?? ''),
      course: String(body.course ?? ''),
      admissionDate: String(body.admissionDate ?? ''),
      counselorName: String(body.counselorName ?? ''),
      assignedBatches: Array.isArray(body.assignedBatches)
        ? (body.assignedBatches as unknown[]).map((s) => String(s))
        : [],
      feesDueDate: String(body.feesDueDate ?? ''),
      totalFees: Number(body.totalFees ?? 0) || 0,
      feesPaid: Number(body.feesPaid ?? 0) || 0,
      paymentStatus: String(body.paymentStatus ?? 'Pending'),
      studentStatus: String(body.studentStatus ?? 'Active'),
      remarks: String(body.remarks ?? ''),
      contactVerified: Boolean(body.contactVerified),
      parentContactVerified: Boolean(body.parentContactVerified),
    });

    // Auto-generate the monthly EMI plan from the course duration
    // (e.g. AD3D EDGE = 24 months -> 24 installments). Best-effort:
    // a failure here must never block the admission itself.
    try {
      const plan = generateEmiPlan({
        course: created.course,
        totalFees: created.totalFees,
        admissionDate: created.admissionDate || new Date().toISOString().slice(0, 10),
        feesPaid: created.feesPaid ?? 0,
      });
      if (plan.length > 0) {
        const studentId = String(created._id);
        await EmiScheduleModel.deleteMany({ studentId });
        await EmiScheduleModel.insertMany(
          plan.map((p) => ({
            studentId,
            studentCode: created.studentCode,
            studentName: created.fullName,
            course: created.course,
            totalFees: created.totalFees,
            months: plan.length,
            ...p,
          }))
        );
      }
    } catch {
      // EMI plan is best-effort on admission
    }

    return NextResponse.json({ student: toStudentJson(created) }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create student';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Student id is required' }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    delete body.id;
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;

    const updated = await StudentModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ student: toStudentJson(updated) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update student';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Student id is required' }, { status: 400 });
    }

    const deleted = await StudentModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete student';
    return NextResponse.json({ message }, { status: 500 });
  }
}

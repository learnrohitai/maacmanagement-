import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import OtpVerificationModel from '@/models/OtpVerification';
import StudentModel from '@/models/Student';
import { normalizeWhatsAppNumber } from '@/lib/wati';
import { isOtpCodeWellFormed, otpHashMatches, OTP_MAX_ATTEMPTS } from '@/lib/otp';

/**
 * POST /api/otp/verify
 *
 * Body: { phone: string, role: 'student' | 'parent', code: string, studentId?: string }
 *
 * Checks the newest pending code for that number + role. Wrong codes bump an
 * attempt counter (capped), expired codes are closed out, and a success marks
 * contactVerified / parentContactVerified on the student record when a
 * studentId is supplied.
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = (await request.json()) as Record<string, unknown>;
    const role = String(body.role ?? '');
    const studentId = String(body.studentId ?? '');
    const code = String(body.code ?? '').trim();

    if (role !== 'student' && role !== 'parent') {
      return NextResponse.json(
        { message: 'role must be either "student" or "parent"' },
        { status: 400 }
      );
    }

    const phone = normalizeWhatsAppNumber(String(body.phone ?? ''));
    if (!phone) {
      return NextResponse.json({ message: 'Enter a valid phone number' }, { status: 400 });
    }

    if (!isOtpCodeWellFormed(code)) {
      return NextResponse.json({ message: 'Enter the 6-digit code' }, { status: 400 });
    }

    const record = await OtpVerificationModel.findOne({ phone, role })
      .sort({ createdAt: -1 })
      .exec();

    if (!record || record.status === 'verified') {
      return NextResponse.json(
        { message: 'No pending code for this number. Request a new one.' },
        { status: 400 }
      );
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      record.status = 'expired';
      await record.save();
      return NextResponse.json(
        { message: 'This code has expired. Request a new one.' },
        { status: 400 }
      );
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      record.status = 'failed';
      await record.save();
      return NextResponse.json(
        { message: 'Too many incorrect attempts. Request a new code.' },
        { status: 429 }
      );
    }

    // Count the attempt before comparing, so parallel guesses cannot slip through.
    record.attempts += 1;

    if (!otpHashMatches(phone, code, record.codeHash)) {
      await record.save();
      const left = Math.max(0, OTP_MAX_ATTEMPTS - record.attempts);
      return NextResponse.json(
        { message: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`, attemptsLeft: left },
        { status: 400 }
      );
    }

    record.status = 'verified';
    record.verifiedAt = new Date();
    await record.save();

    // Mark the matching field on the student master, when we know the student.
    let studentUpdated = false;
    if (studentId) {
      const field = role === 'student' ? 'contactVerified' : 'parentContactVerified';
      const or: Record<string, string>[] = [{ studentCode: studentId }];
      // Accept a Mongo _id too, since the UI passes either.
      if (/^[a-f\d]{24}$/i.test(studentId)) or.push({ _id: studentId } as unknown as Record<string, string>);
      const res = await StudentModel.updateOne({ $or: or }, { $set: { [field]: true } });
      studentUpdated = (res.modifiedCount ?? 0) > 0;
    }

    return NextResponse.json({ verified: true, role, studentUpdated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    return NextResponse.json({ message }, { status: 500 });
  }
}

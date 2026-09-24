import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import OtpVerificationModel from '@/models/OtpVerification';
import { normalizeWhatsAppNumber, isWatiConfigured, sendOtp } from '@/lib/wati';
import {
  generateOtpCode,
  hashOtpCode,
  OTP_TTL_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_MAX_SENDS_PER_HOUR,
} from '@/lib/otp';

/**
 * POST /api/otp/send
 *
 * Body: { phone: string, role: 'student' | 'parent', studentId?: string }
 *
 * Sends a 6-digit WhatsApp verification code via WATI and records a pending
 * (hashed) code. Rate limited per number: one send per cooldown window and a
 * hard hourly cap. The raw code is never stored and never returned to the client.
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = (await request.json()) as Record<string, unknown>;
    const role = String(body.role ?? '');
    const studentId = String(body.studentId ?? '');

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

    if (!isWatiConfigured()) {
      return NextResponse.json(
        { message: 'WhatsApp OTP is not configured on the server' },
        { status: 503 }
      );
    }

    const now = Date.now();

    // Cooldown between sends to the same number + role
    const latest = await OtpVerificationModel.findOne({ phone, role })
      .sort({ createdAt: -1 })
      .lean();
    if (latest?.lastSentAt) {
      const waitedMs = now - new Date(latest.lastSentAt).getTime();
      const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
      if (waitedMs < cooldownMs) {
        const retryAfter = Math.ceil((cooldownMs - waitedMs) / 1000);
        return NextResponse.json(
          { message: `Please wait ${retryAfter}s before requesting another code`, retryAfter },
          { status: 429 }
        );
      }
    }

    // Hourly cap per number + role
    const sentLastHour = await OtpVerificationModel.countDocuments({
      phone,
      role,
      lastSentAt: { $gte: new Date(now - 60 * 60 * 1000) },
    });
    if (sentLastHour >= OTP_MAX_SENDS_PER_HOUR) {
      return NextResponse.json(
        { message: 'Too many verification codes requested. Try again later.' },
        { status: 429 }
      );
    }

    const code = generateOtpCode();
    const expiresAt = new Date(now + OTP_TTL_MINUTES * 60 * 1000);

    const record = await OtpVerificationModel.create({
      phone,
      role,
      studentId,
      codeHash: hashOtpCode(phone, code),
      status: 'pending',
      attempts: 0,
      sendCount: (latest?.sendCount ?? 0) + 1,
      lastSentAt: new Date(now),
      expiresAt,
      verifiedAt: null,
    });

    const result = await sendOtp({ phone, code });

    if (!result.ok) {
      // Keep the failure visible for support, but never leak the code.
      await OtpVerificationModel.updateOne(
        { _id: record._id },
        { $set: { status: 'failed' } }
      );
      const detail =
        result.error ||
        JSON.stringify(result.response).slice(0, 300) ||
        `WATI responded ${result.status}`;
      return NextResponse.json(
        { message: `Could not send the WhatsApp code: ${detail}` },
        { status: 502 }
      );
    }

    // Mask the number in the response — the client already knows what it sent.
    const masked = `${phone.slice(0, 4)}…${phone.slice(-4)}`;
    return NextResponse.json({
      sent: true,
      phone: masked,
      expiresInMinutes: OTP_TTL_MINUTES,
      resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    return NextResponse.json({ message }, { status: 500 });
  }
}

import { createHash, randomInt, timingSafeEqual } from 'crypto';

/** OTP policy — shared by the send/verify routes so the limits stay in one place. */
export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5; // wrong codes allowed per issued code
export const OTP_RESEND_COOLDOWN_SECONDS = 60; // min gap between sends to one number
export const OTP_MAX_SENDS_PER_HOUR = 5; // hard cap per number + role

/** Cryptographically random numeric code (never Math.random — these are auth secrets). */
export function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, '0');
}

/**
 * Hash the code before storing it, so a database leak never exposes live codes.
 * The phone number is part of the input, binding the hash to one number.
 */
export function hashOtpCode(phone: string, code: string): string {
  const secret = process.env.OTP_HASH_SECRET || 'maac-otp-verification';
  return createHash('sha256').update(`${phone}:${code}:${secret}`).digest('hex');
}

/** Constant-time comparison of a submitted code against a stored hash. */
export function otpHashMatches(phone: string, code: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashOtpCode(phone, code), 'utf8');
  const expected = Buffer.from(expectedHash || '', 'utf8');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function isOtpCodeWellFormed(code: unknown): boolean {
  return typeof code === 'string' && new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code);
}

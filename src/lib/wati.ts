/**
 * WATI WhatsApp API client.
 *
 * Env vars required (set in .env on the server):
 *   WATI_API_TOKEN          – Bearer token from WATI dashboard
 *   WATI_TENANT_ID          – e.g. 10118800
 *   WATI_ABSENT_TEMPLATE_NAME – approved template used for absence alerts
 *
 * WATI API docs: https://docs.wati.io
 * Send template endpoint (v1, tenant-scoped):
 *   POST {base}/{tenantId}/api/v1/sendTemplateMessage?whatsappNumber={number}
 *   Body: { template_name, broadcast_name, parameters: [{ name, value }] }
 *   - Positional templates ({{1}}, {{2}}) use parameter names "1", "2", ...
 *   - Named templates ({{name}}) use the variable name.
 */

const WATI_BASE = process.env.WATI_BASE_URL || 'https://live-mt-server.wati.io';
const WATI_TENANT = process.env.WATI_TENANT_ID || '';
const WATI_TOKEN = process.env.WATI_API_TOKEN || '';

export interface WatiParam {
  name: string;
  value: string;
}

export interface WatiSendResult {
  ok: boolean;
  status: number;
  response: unknown;
  error?: string;
}

export function isWatiConfigured(): boolean {
  return Boolean(WATI_TENANT && WATI_TOKEN && process.env.WATI_ABSENT_TEMPLATE_NAME);
}

/**
 * Normalize an Indian phone number to the digits-only form WATI expects
 * (country code + number, no "+", no spaces). Returns null if unusable.
 */
export function normalizeWhatsAppNumber(raw: string): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.slice(1)}`;
  }
  // 91XXXXXXXXXX (12) is already fine; anything else is passed through as-is.
  return digits.length >= 10 ? digits : null;
}

async function postJson(url: string, body: unknown): Promise<WatiSendResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WATI_TOKEN}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* keep raw text */
    }
    return { ok: res.ok, status: res.status, response: parsed };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      response: null,
      error: e instanceof Error ? e.message : 'network error',
    };
  }
}

/**
 * Send the "parent absence alert" template to a parent's WhatsApp number.
 * Parameter names default to positional (1, 2, 3) and can be overridden via
 * WATI_ABSENT_TEMPLATE_PARAMS (comma-separated, e.g. "ward_name,absent_dates,batch_name").
 */
export async function sendAbsenceAlert(options: {
  parentContact: string;
  studentName: string;
  absentDates: string;
  batchName: string;
}): Promise<WatiSendResult> {
  const templateName = process.env.WATI_ABSENT_TEMPLATE_NAME || '';
  const paramNames = (process.env.WATI_ABSENT_TEMPLATE_PARAMS || '1,2,3')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const whatsappNumber = normalizeWhatsAppNumber(options.parentContact);
  if (!whatsappNumber) {
    return { ok: false, status: 0, response: null, error: 'invalid parent phone number' };
  }

  const values = [options.studentName, options.absentDates, options.batchName];
  const parameters: WatiParam[] = paramNames.map((name, i) => ({
    name,
    value: values[i] ?? '',
  }));

  const url = `${WATI_BASE}/${WATI_TENANT}/api/v1/sendTemplateMessage?whatsappNumber=${whatsappNumber}`;
  return postJson(url, {
    template_name: templateName,
    broadcast_name: `absence_alert_${Date.now()}`,
    parameters,
  });
}

/**
 * Send a one-time verification code to a phone number.
 *
 * Uses the AUTHENTICATION template (env WATI_OTP_TEMPLATE_NAME, default
 * "otp_verification_auth") whose body is "{{1}} is your MAAC verification code."
 * and which carries the mandatory Copy-code button.
 *
 * The code is passed positionally; WATI fills the matching button parameter.
 */
export async function sendOtp(options: { phone: string; code: string }): Promise<WatiSendResult> {
  const templateName = process.env.WATI_OTP_TEMPLATE_NAME || 'otp_verification_auth';
  const otpParamName = process.env.WATI_OTP_PARAM_NAME || '1';

  const whatsappNumber = normalizeWhatsAppNumber(options.phone);
  if (!whatsappNumber) {
    return { ok: false, status: 0, response: null, error: 'invalid phone number' };
  }

  const url = `${WATI_BASE}/${WATI_TENANT}/api/v1/sendTemplateMessage?whatsappNumber=${whatsappNumber}`;
  return postJson(url, {
    template_name: templateName,
    broadcast_name: `otp_verification_${Date.now()}`,
    parameters: [{ name: otpParamName, value: options.code }],
  });
}

/** Generic template sender (future use: fee reminders, event invites…). */
export async function sendTemplateMessage(
  whatsappNumber: string,
  templateName: string,
  parameters: WatiParam[]
): Promise<WatiSendResult> {
  const normalized = normalizeWhatsAppNumber(whatsappNumber);
  if (!normalized) {
    return { ok: false, status: 0, response: null, error: 'invalid phone number' };
  }
  const url = `${WATI_BASE}/${WATI_TENANT}/api/v1/sendTemplateMessage?whatsappNumber=${normalized}`;
  return postJson(url, {
    template_name: templateName,
    broadcast_name: `${templateName}_${Date.now()}`,
    parameters,
  });
}

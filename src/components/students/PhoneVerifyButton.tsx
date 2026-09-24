'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CheckCircle2, ShieldCheck, MessageCircle, AlertCircle } from 'lucide-react';

interface PhoneVerifyButtonProps {
  /** Phone number exactly as entered in the form (raw is fine — the API normalizes). */
  phone: string;
  /** Which number of the student this is. */
  role: 'student' | 'parent';
  /** Optional student link so the student record is flagged when verified. */
  studentId?: string;
  /** Current verified state, from the student record. */
  verified?: boolean;
  /** Called after a successful verification. */
  onVerified?: () => void;
  className?: string;
}

type Phase = 'idle' | 'sending' | 'awaiting' | 'verifying' | 'done';

/**
 * Sends a WhatsApp OTP to a student/parent number and confirms it.
 *
 * Verification is optional — this only reports status and never blocks a save.
 */
export default function PhoneVerifyButton({
  phone,
  role,
  studentId,
  verified = false,
  onVerified,
  className = '',
}: PhoneVerifyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>(verified ? 'done' : 'idle');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  useEffect(() => {
    setPhase(verified ? 'done' : 'idle');
  }, [verified]);

  const hasPhone = phone.replace(/\D/g, '').length >= 10;

  const requestCode = async () => {
    setError('');
    setInfo('');
    setAttemptsLeft(null);
    setPhase('sending');

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role, studentId }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (!res.ok) {
        setError(data.message || `Could not send the code (${res.status})`);
        setPhase('idle');
        return;
      }

      setPhase('awaiting');
      setInfo(`Code sent on WhatsApp to ${role === 'student' ? 'the student' : 'the parent'}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setPhase('idle');
    }
  };

  const submitCode = async () => {
    setError('');
    setPhase('verifying');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role, studentId, code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        attemptsLeft?: number;
      };

      if (!res.ok) {
        setError(data.message || `Verification failed (${res.status})`);
        if (typeof data.attemptsLeft === 'number') setAttemptsLeft(data.attemptsLeft);
        setPhase('awaiting');
        return;
      }

      setPhase('done');
      setInfo('Number verified.');
      onVerified?.();
      setTimeout(() => setIsOpen(false), 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setPhase('awaiting');
    }
  };

  const isDone = phase === 'done';

  return (
    <>
      <button
        type="button"
        disabled={!hasPhone || isDone}
        onClick={() => {
          setIsOpen(true);
          if (!isDone) void requestCode();
        }}
        title={!hasPhone ? 'Enter a valid phone number first' : undefined}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isDone
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
        } ${className}`}
      >
        {isDone ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5" />
            Verify
          </>
        )}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isDone ? 'Number verified' : 'WhatsApp verification'}
        size="sm"
      >
        <div className="space-y-4">
          {isDone ? (
            <div className="flex flex-col items-center text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="mt-3 text-sm font-semibold text-gray-900">{info || 'Number verified.'}</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                We are sending a 6-digit code on WhatsApp to{' '}
                <span className="font-semibold text-gray-800">{phone}</span>
                {role === 'parent' ? ' (parent/guardian)' : ' (student)'}.
              </p>

              {phase === 'sending' && (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  Sending the code…
                </p>
              )}

              {info && phase !== 'sending' && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  {info}
                </p>
              )}

              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Enter the 6-digit code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] font-mono rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white"
                />
                {attemptsLeft !== null && attemptsLeft > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} remaining.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => void requestCode()}
                  disabled={phase === 'sending' || phase === 'verifying'}
                  className="text-xs font-semibold text-gray-500 hover:text-emerald-700 disabled:opacity-50"
                >
                  Resend code
                </button>
                <Button
                  type="button"
                  variant="success"
                  disabled={code.length !== 6 || phase === 'verifying' || phase === 'sending'}
                  onClick={() => void submitCode()}
                  className="text-xs px-5 py-2 font-semibold"
                >
                  {phase === 'verifying' ? 'Checking…' : 'Verify code'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

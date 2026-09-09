'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Attendance } from '@/types';

interface UseAttendanceSyncOptions {
  /** Batch id whose records should be loaded (empty = skip) */
  batchId: string;
  /** Local records already present in the Zustand store (mock + session marks) */
  storeRecords: Attendance[];
  /** Marks already saved to the DB are skipped on flush */
  storeRecordIds: Set<string>;
  addAttendance: (record: Attendance) => void;
}

interface UseAttendanceSyncResult {
  /** True while the initial DB fetch is in flight */
  loading: boolean;
  /** True while a DB flush is in flight (used by the Submit button) */
  saving: boolean;
  /** Human-readable status: 'saved' | 'pending' | 'error' | 'idle' */
  saveState: 'idle' | 'saved' | 'pending' | 'error';
  /** Last error message if a save failed */
  error: string | null;
  /** Force-save all unsaved local records to MongoDB now */
  flush: () => Promise<boolean>;
}

export function useAttendanceSync({
  batchId,
  storeRecords,
  storeRecordIds,
  addAttendance,
}: UseAttendanceSyncOptions): UseAttendanceSyncResult {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'pending' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Records queued locally but not yet persisted
  const pendingRef = useRef<Map<string, Attendance>>(new Map());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (): Promise<boolean> => {
    const pending = Array.from(pendingRef.current.values());
    if (pending.length === 0) return true;

    setSaving(true);
    setSaveState('pending');
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: pending }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Save failed (${res.status})`);
      }

      // Persisted — clear the queue
      pendingRef.current.clear();
      setSaveState('saved');
      setError(null);
      return true;
    } catch (e) {
      setSaveState('error');
      setError(e instanceof Error ? e.message : 'Failed to save attendance');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // Queue every new/updated local record and debounce-flush to the DB
  useEffect(() => {
    if (!batchId) return;
    let queuedNew = false;
    for (const rec of storeRecords) {
      if (
        rec.batchId === batchId &&
        !storeRecordIds.has(rec.id) &&
        !pendingRef.current.has(rec.id)
      ) {
        pendingRef.current.set(rec.id, rec);
        queuedNew = true;
      }
    }
    if (!queuedNew) return;

    // Keep the local record set in sync when an existing record is re-marked
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void flush();
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [storeRecords, batchId, storeRecordIds, flush]);

  // Initial load from MongoDB for the selected batch/date is handled by the page.
  // Here we just mark loading done once store records for this batch exist or fetch completes.
  const fetchedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!batchId || fetchedRef.current === batchId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(`/api/attendance?batchId=${encodeURIComponent(batchId)}`);
        if (!res.ok) throw new Error('Failed to load attendance');
        const data = (await res.json()) as { records: Array<Attendance & { _id?: string }> };
        if (!cancelled) {
          for (const rec of data.records || []) {
            // Merge DB records into the local store (MongoDB _id becomes the local id)
            const { _id, ...rest } = rec;
            addAttendance({ ...rest, id: String(_id ?? rec.id ?? '') });
          }
        }
        fetchedRef.current = batchId;
      } catch {
        // DB unreachable — keep working with local/mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [batchId, addAttendance]);

  return { loading, saving, saveState, error, flush };
}

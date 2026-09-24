// ==========================================================================
// === LAB TIME-SLOT AVAILABILITY (5 labs × fixed 2-hour slots) ============
// ==========================================================================
// A batch occupies one lab for a fixed 2-hour slot on its scheduled days.
// Before creating a batch we check every lab against existing batches:
// if no lab is free for the chosen slot/days, creation is blocked with
// "No time slot available".

export interface LabSlotInput {
  startTime: string; // "HH:MM" 24h
  days: string[]; // e.g. ['Monday', 'Wednesday']
  durationMinutes?: number;
}

export interface Lab {
  id: string;
  name: string;
}

/** The institute's five labs. */
export const LABS: Lab[] = [
  { id: 'lab1', name: 'Lab 1 - Maya Studio' },
  { id: 'lab2', name: 'Lab 2 - Nuke Suite' },
  { id: 'lab3', name: 'Lab 3 - Design Bay' },
  { id: 'lab4', name: 'Lab 4 - After Effects Hub' },
  { id: 'lab5', name: 'Lab 5 - Edit & Render' },
];

/** Convert "HH:MM" (or "HH:MM:SS") to minutes since midnight. */
export function timeToMinutes(t: string): number {
  const parts = (t || '').split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  return h * 60 + m;
}

/** Format minutes-since-midnight back to "HH:MM". */
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface SlotLike {
  startTime: string;
  endTime: string;
  days: string[];
  room?: string;
  batchIdCode?: string;
  name?: string;
}

function daysOverlap(a: string[], b: string[]): boolean {
  const norm = (arr: string[]) => arr.map((d) => d.trim().toLowerCase());
  const A = norm(a);
  const B = norm(b);
  return A.some((d) => B.includes(d));
}

/**
 * Which labs are free for the given slot & days, given existing batch slots.
 * Overlap = same day AND time ranges intersect (2-hour default).
 */
export function findAvailableLabs<T extends SlotLike>(slot: LabSlotInput, existing: T[]): Lab[] {
  const duration = slot.durationMinutes ?? 120;
  const startMin = timeToMinutes(slot.startTime);
  const endMin = startMin + duration;

  return LABS.filter((lab) => {
    // A lab is busy if ANY batch occupies it on ANY overlapping day/time
    return !existing.some((b) => {
      if ((b.room || '').trim() !== lab.name) return false;
      if (!daysOverlap(slot.days, b.days || [])) return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = b.endTime ? timeToMinutes(b.endTime) : bStart + 120;
      return startMin < bEnd && endMin > bStart; // time ranges intersect
    });
  });
}

/**
 * Convenience: check whether ANY lab is free, and get the free labs list.
 * Used by the Create Batch wizard to block impossible schedules.
 */
export function checkLabAvailability<T extends SlotLike>(slot: LabSlotInput, existing: T[]) {
  const availableLabs = findAvailableLabs(slot, existing);
  return {
    availableLabs,
    isAvailable: availableLabs.length > 0,
    message: availableLabs.length > 0
      ? `Available: ${availableLabs.map((l) => l.name).join(', ')}`
      : 'No time slot available — all 5 labs are occupied for this time on the selected days.',
  };
}

/** All busy lab slots for a given day — used for the availability preview UI. */
export function busySlotsForDay<T extends SlotLike>(day: string, existing: T[]): Array<{
  lab: string;
  start: string;
  end: string;
  batch: string;
}> {
  const d = day.trim().toLowerCase();
  return existing
    .filter((b) => (b.days || []).map((x) => x.trim().toLowerCase()).includes(d) && b.room)
    .map((b) => ({ lab: b.room as string, start: b.startTime, end: b.endTime, batch: b.name || '' }))
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}

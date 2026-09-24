import type { AnyBulkWriteOperation } from 'mongoose';
import type { IStudentDoc } from '@/models/Student';

/**
 * Student CSV import/export helpers.
 * Kept out of route.ts — Next.js only allows HTTP-method exports there.
 */

export const CSV_COLUMNS = [
  'studentCode',
  'fullName',
  'contactNo',
  'email',
  'parentName',
  'parentContact',
  'dob',
  'course',
  'admissionDate',
  'counselorName',
  'assignedBatches',
  'feesDueDate',
  'totalFees',
  'feesPaid',
  'paymentStatus',
  'studentStatus',
  'remarks',
] as const;

const SAMPLE_ROWS = [
  [
    'MAAC-0001',
    'Rahul Sharma',
    '9876543210',
    'rahul@example.com',
    'Suresh Sharma',
    '9876543211',
    '2005-08-15',
    'ADVANCED 3D ANIMATION',
    '2026-09-01',
    'Priya (Counselor)',
    'AD3D-MORNING-A',
    '2026-10-01',
    '120000',
    '50000',
    'Partial',
    'Active',
    '',
  ],
  [
    'MAAC-0002',
    'Simran Kaur',
    '9812345678',
    'simran@example.com',
    'Harjeet Kaur',
    '9812345679',
    '2004-01-20',
    'GRAPHIC AND WEB DEVELOPMENT',
    '2026-09-05',
    'Amit (Counselor)',
    '',
    '2026-10-05',
    '85000',
    '85000',
    'Paid',
    'Active',
    'Joined via referral',
  ],
];

function toCsvValue(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsvTemplate(): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of SAMPLE_ROWS) {
    lines.push(row.map(toCsvValue).join(','));
  }
  return lines.join('\n') + '\n';
}

/** Minimal RFC-4180-ish CSV parser (quotes, escaped quotes, CRLF, BOM). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, ''); // strip BOM

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

const HEADER_ALIASES: Record<string, string> = {
  code: 'studentCode',
  studentid: 'studentCode',
  name: 'fullName',
  studentname: 'fullName',
  contact: 'contactNo',
  phone: 'contactNo',
  mobile: 'contactNo',
  fathername: 'parentName',
  parentphone: 'parentContact',
  parentmobile: 'parentContact',
  fatherphone: 'parentContact',
  dateofbirth: 'dob',
  counselor: 'counselorName',
  batches: 'assignedBatches',
  batch: 'assignedBatches',
  paid: 'feesPaid',
  status: 'studentStatus',
};

const HEADER_MAP = new Map<string, string>();
for (const col of CSV_COLUMNS) {
  HEADER_MAP.set(normalizeHeader(col), col);
}
for (const [alias, canonical] of Object.entries(HEADER_ALIASES)) {
  if (!HEADER_MAP.has(alias)) HEADER_MAP.set(alias, canonical);
}

function coerceNumber(v: string): number {
  const n = Number(String(v).replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeStatus(v: string): string {
  const s = v.trim().toLowerCase();
  if (s.startsWith('wait')) return 'Waiting for Batch';
  if (s.startsWith('hold') || s.startsWith('pause')) return 'On Hold/Pause';
  if (s.startsWith('completed')) return 'Course Completed';
  if (s.startsWith('passout') || s.startsWith('certificate')) return 'Passout/Certificate';
  if (s.startsWith('dropped')) return 'Dropped (ADO/FDO)';
  if (s.startsWith('active')) return 'Active';
  return v.trim() || 'Active';
}

function normalizePaymentStatus(v: string): string {
  const s = v.trim().toLowerCase();
  if (s.startsWith('over')) return 'Overdue';
  if (s.startsWith('part')) return 'Partial';
  if (s.startsWith('paid')) return 'Paid';
  return 'Pending';
}

export interface CsvRowResult {
  rowNumber: number;
  ok: boolean;
  error?: string;
  studentCode?: string;
  fullName?: string;
}

/**
 * Convert parsed CSV rows into bulk upsert operations keyed by studentCode.
 * Re-importing the same studentCode updates the existing record (no duplicates).
 */
export function rowsToUpserts(rows: string[][]): {
  ops: AnyBulkWriteOperation<IStudentDoc>[];
  results: CsvRowResult[];
} {
  const results: CsvRowResult[] = [];
  const ops: AnyBulkWriteOperation<IStudentDoc>[] = [];

  if (rows.length === 0) return { ops, results };

  const header = rows[0].map(normalizeHeader);
  const colIndex = new Map<string, number>();
  header.forEach((h, i) => {
    const canonical = HEADER_MAP.get(h);
    if (canonical && !colIndex.has(canonical)) colIndex.set(canonical, i);
  });

  const dataRows = rows.slice(1);
  const codeIdx = colIndex.get('studentCode');
  const nameIdx = colIndex.get('fullName');
  if (codeIdx === undefined || nameIdx === undefined) {
    return {
      ops,
      results: dataRows.map((_, i) => ({
        rowNumber: i + 2,
        ok: false,
        error: 'CSV must contain "studentCode" and "fullName" columns',
      })),
    };
  }

  dataRows.forEach((cells, i) => {
    const rowNumber = i + 2; // 1-based rows, +1 header offset
    const get = (col: string): string => {
      const idx = colIndex.get(col);
      return idx !== undefined ? String(cells[idx] ?? '').trim() : '';
    };

    const studentCode = get('studentCode');
    const fullName = get('fullName');
    if (!studentCode || !fullName) {
      results.push({
        rowNumber,
        ok: false,
        error: 'studentCode and fullName are required',
        studentCode,
        fullName,
      });
      return;
    }

    const doc: Partial<IStudentDoc> = {
      studentCode,
      fullName,
      contactNo: get('contactNo'),
      email: get('email'),
      parentName: get('parentName'),
      parentContact: get('parentContact'),
      dob: get('dob'),
      course: get('course'),
      admissionDate: get('admissionDate'),
      counselorName: get('counselorName'),
      assignedBatches: get('assignedBatches')
        ? get('assignedBatches')
            .split(/[;|]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      feesDueDate: get('feesDueDate'),
      totalFees: coerceNumber(get('totalFees')),
      feesPaid: coerceNumber(get('feesPaid')),
      paymentStatus: normalizePaymentStatus(get('paymentStatus')),
      studentStatus: normalizeStatus(get('studentStatus')),
      remarks: get('remarks'),
    };

    ops.push({
      updateOne: {
        filter: { studentCode },
        update: { $set: doc },
        upsert: true,
      },
    });

    results.push({ rowNumber, ok: true, studentCode, fullName });
  });

  return { ops, results };
}

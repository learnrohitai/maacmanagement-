'use client';

import { useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful import so the page can refresh from the DB */
  onImported: () => void;
}

interface ImportResult {
  imported?: number;
  updated?: number;
  failedCount?: number;
  failed?: Array<{
    rowNumber: number;
    error?: string;
    studentCode?: string;
    fullName?: string;
  }>;
}

export default function ImportCsvModal({ isOpen, onClose, onImported }: ImportCsvModalProps) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCsvText('');
    setFileName('');
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const readFile = (file: File) => {
    setError(null);
    setResult(null);
    const isCsv =
      file.name.toLowerCase().endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel';
    if (!isCsv) {
      setError('Please choose a .csv file (export your sheet as CSV first)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ''));
      setFileName(file.name);
    };
    reader.onerror = () => setError('Could not read the file');
    reader.readAsText(file);
  };

  const rowCount = csvText.trim()
    ? Math.max(0, csvText.trim().split(/\r?\n/).length - 1)
    : 0;

  const handleImport = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/students?mode=csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      });
      const data = (await res.json()) as ImportResult & { message?: string };
      if (!res.ok) {
        throw new Error(data.message || `Import failed (${res.status})`);
      }
      setResult(data);
      if ((data.imported ?? 0) + (data.updated ?? 0) > 0) {
        onImported();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Students from CSV" size="lg">
      <div className="space-y-5">
        {/* Step 1 — template */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">1. Use the standard format</p>
              <p className="mt-0.5 text-xs text-gray-600">
                Required columns: <code className="rounded bg-white px-1">studentCode</code>,{' '}
                <code className="rounded bg-white px-1">fullName</code>,{' '}
                <code className="rounded bg-white px-1">parentContact</code> (for absence WhatsApp
                alerts). All other columns are optional.
              </p>
            </div>
          </div>
          <a href="/api/students?template=1" download>
            <Button variant="secondary" className="shrink-0 whitespace-nowrap">
              <Download className="mr-1.5 h-4 w-4" />
              Template
            </Button>
          </a>
        </div>

        {/* Step 2 — choose file */}
        <div>
          <p className="text-sm font-semibold text-gray-900">2. Choose your CSV file</p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) readFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-2 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) readFile(file);
                e.target.value = '';
              }}
            />
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              Drop your CSV here, or <span className="text-emerald-600">browse</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Excel → Save As → CSV (UTF-8)</p>
          </div>

          {fileName && (
            <div className="mt-2 flex items-center justify-between rounded-xl bg-gray-100 px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="h-4 w-4 text-emerald-600" />
                {fileName} · {rowCount} row{rowCount === 1 ? '' : 's'} (excl. header)
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Import finished — {result.imported ?? 0} added, {result.updated ?? 0} updated
              {(result.failedCount ?? 0) > 0 && `, ${result.failedCount} failed`}
            </div>
            {(result.failedCount ?? 0) > 0 && (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {result.failed?.map((f) => (
                  <div
                    key={f.rowNumber}
                    className="flex items-start gap-2 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                      Row {f.rowNumber}
                      {f.fullName ? ` (${f.fullName})` : ''}: {f.error}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={handleImport}
            disabled={busy || rowCount === 0}
            className="font-bold"
          >
            {busy ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Upload className="mr-1.5 h-4 w-4" />
                Import {rowCount > 0 ? `${rowCount} student${rowCount === 1 ? '' : 's'}` : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

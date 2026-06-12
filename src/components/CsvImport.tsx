"use client";

import { useRef, useState } from "react";

interface CsvImportProps {
  onSuccess: () => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export function CsvImport({ onSuccess }: CsvImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setResult(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import/csv", { method: "POST", body: formData });
      const data = (await res.json()) as ImportResult & { error?: string };

      if (!res.ok) {
        setErrorMsg(data.error ?? `Error ${res.status}`);
        return;
      }

      setResult(data);
      if (data.imported > 0) onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const label =
    result && !errorMsg
      ? `${result.imported} imported${result.skipped > 0 ? `, ${result.skipped} skipped` : ""}${result.errors.length > 0 ? `, ${result.errors.length} errors` : ""}`
      : null;

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void handleFile(file);
            e.target.value = "";
          }
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Importing…" : "Import CSV"}
      </button>
      {label && <span className="text-xs text-emerald-400">{label}</span>}
      {errorMsg && <span className="text-xs text-red-400">{errorMsg}</span>}
    </div>
  );
}

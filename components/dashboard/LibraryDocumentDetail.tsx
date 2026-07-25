"use client";

import { useState } from "react";
import DocumentIcon from "@/components/dashboard/DocumentIcon";
import SampleTag from "@/components/dashboard/SampleTag";
import type { LibraryDocument } from "@/lib/dashboard-data";

const CATEGORY_STYLES: Record<string, string> = {
  Contracts: "bg-violet-50 text-violet-700",
  Invoices: "bg-emerald-50 text-emerald-700",
  "Service Records": "bg-blue-50 text-blue-700",
  "Customer Intake": "bg-amber-50 text-amber-700",
  Certificates: "bg-slate-100 text-slate-700",
};

function InfoRow({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (e.g. unsupported browser) — no-op for this demo.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="whitespace-nowrap rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
    </div>
  );
}

export default function LibraryDocumentDetail({ doc }: { doc: LibraryDocument }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Extracted info */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Extracted info</h2>
          <SampleTag />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Pulled automatically from the scan — nothing to type.
        </p>

        <div className="mt-3">
          <InfoRow label="Customer / Family" value={doc.extracted.name} />
          {doc.extracted.phone && <InfoRow label="Phone" value={doc.extracted.phone} copyable />}
          <InfoRow label="Date" value={doc.extracted.date} />
          {doc.extracted.amount && <InfoRow label="Amount" value={doc.extracted.amount} />}
          <InfoRow label="Category" value={doc.category} />
        </div>
      </section>

      {/* Preview placeholder */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Original scan</h2>
          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_STYLES[doc.category]}`}>
            {doc.category}
          </span>
        </div>

        <div className="mt-4 flex justify-center">
          {doc.fileType === "image" ? (
            <div className="flex aspect-[4/3] w-full max-w-xs flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
              <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
                <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-xs text-slate-400">Sample photo preview</p>
            </div>
          ) : (
            <div className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <DocumentIcon type="pdf" />
                <p className="text-xs font-semibold text-slate-400">Sample PDF preview</p>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-3/4 rounded bg-slate-200" />
                <div className="h-2.5 w-full rounded bg-slate-200" />
                <div className="h-2.5 w-5/6 rounded bg-slate-200" />
                <div className="mt-4 h-2.5 w-2/3 rounded bg-slate-200" />
                <div className="h-2.5 w-full rounded bg-slate-200" />
                <div className="h-2.5 w-4/6 rounded bg-slate-200" />
                <div className="mt-4 h-2.5 w-1/2 rounded bg-slate-200" />
                <div className="h-2.5 w-full rounded bg-slate-200" />
                <div className="h-2.5 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">{doc.fileName}</p>
      </section>
    </div>
  );
}

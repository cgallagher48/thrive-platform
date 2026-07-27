"use client";

import { useState } from "react";
import DocumentIcon from "@/components/dashboard/DocumentIcon";
import type { LibraryDocument, DocumentType } from "@/lib/portal/funeral/types";

const CATEGORY_STYLES: Record<DocumentType, string> = {
  "Death Certificate": "bg-slate-100 text-slate-700",
  "Service Contract": "bg-violet-50 text-violet-700",
  "Intake Form": "bg-amber-50 text-amber-700",
  Invoice: "bg-emerald-50 text-emerald-700",
  Permit: "bg-blue-50 text-blue-700",
  Other: "bg-slate-100 text-slate-600",
};

const STATUS_LABEL: Record<LibraryDocument["extractionStatus"], string> = {
  pending: "Extraction pending",
  complete: "Extracted automatically",
  failed: "Extraction failed — needs manual review",
  skipped_no_api_key: "Not yet extracted — document extraction isn't connected",
};

function InfoRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable — no-op.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{value}</p>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="flex-shrink-0 whitespace-nowrap rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
    </div>
  );
}

export default function DocumentDetail({
  doc,
  previewUrl,
}: {
  doc: LibraryDocument;
  previewUrl: string | null;
}) {
  const { extracted } = doc;
  const categoryStyle = extracted.document_type ? CATEGORY_STYLES[extracted.document_type] : "bg-slate-100 text-slate-500";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Extracted info</h2>
        <p className="mt-1 text-xs text-slate-500">{STATUS_LABEL[doc.extractionStatus]}</p>

        <div className="mt-3">
          <InfoRow label="Deceased" value={extracted.deceased_name ?? "Not found"} />
          <InfoRow label="Family / Next of Kin" value={extracted.family_name ?? "Not found"} />
          {extracted.phone_numbers && extracted.phone_numbers.length > 0 ? (
            extracted.phone_numbers.map((phone, i) => (
              <InfoRow key={i} label={i === 0 ? "Phone" : `Phone ${i + 1}`} value={phone} copyable />
            ))
          ) : (
            <InfoRow label="Phone" value="Not found" />
          )}
          <InfoRow label="Service Date" value={extracted.service_date ?? "Not found"} />
          <InfoRow label="Document Type" value={extracted.document_type ?? "Unclassified"} />
          <InfoRow label="Address" value={extracted.address ?? "Not found"} />
          <InfoRow label="Notes" value={extracted.notes ?? "—"} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Original scan</h2>
          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${categoryStyle}`}>
            {extracted.document_type ?? "Unsorted"}
          </span>
        </div>

        <div className="mt-4 flex justify-center">
          {previewUrl ? (
            doc.fileType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={doc.fileName}
                className="max-h-96 w-full max-w-xs rounded-lg border border-slate-200 object-contain"
              />
            ) : (
              <iframe src={previewUrl} title={doc.fileName} className="h-96 w-full max-w-xs rounded-lg border border-slate-200" />
            )
          ) : (
            <div className="flex aspect-[4/3] w-full max-w-xs flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
              <DocumentIcon type={doc.fileType} />
              <p className="text-xs text-slate-400">Preview unavailable</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">{doc.fileName}</p>
      </section>
    </div>
  );
}

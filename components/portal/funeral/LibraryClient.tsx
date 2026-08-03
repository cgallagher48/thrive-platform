"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DocumentIcon from "@/components/dashboard/DocumentIcon";
import { DOCUMENT_TYPES, type DocumentType, type LibraryDocument } from "@/lib/portal/funeral/types";
import { compressImageForUpload } from "@/lib/portal/documents/client-compress";

const CATEGORY_STYLES: Record<DocumentType, string> = {
  "Death Certificate": "bg-slate-100 text-slate-700",
  "Service Contract": "bg-violet-50 text-violet-700",
  "Intake Form": "bg-amber-50 text-amber-700",
  Invoice: "bg-emerald-50 text-emerald-700",
  Permit: "bg-blue-50 text-blue-700",
  Other: "bg-slate-100 text-slate-600",
};

const FILLER_WORDS = /\b(show|me|the|find|search|for|please|files?|documents?|docs?|from|about)\b/g;

function normalizeQuery(query: string) {
  return query.toLowerCase().replace(FILLER_WORDS, "").replace(/\s+/g, " ").trim();
}

export default function LibraryClient({ documents }: { documents: LibraryDocument[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | DocumentType>("All");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalized = normalizeQuery(query);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (category !== "All" && doc.extracted.document_type !== category) return false;
      if (!normalized) return true;
      const haystack = [
        doc.fileName,
        doc.extracted.deceased_name,
        doc.extracted.next_of_kin_name,
        doc.extracted.document_type,
        doc.extracted.home_address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [documents, category, normalized]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of documents) {
      if (doc.extracted.document_type) counts[doc.extracted.document_type] = (counts[doc.extracted.document_type] ?? 0) + 1;
    }
    return counts;
  }, [documents]);

  async function handleFileSelected(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const uploadFile = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch("/api/portal/documents/extract", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Upload failed.");
      }
      const { document } = await res.json();
      router.push(`/dashboard/library/${document.id}`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Something went wrong.");
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Files</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Every scanned or uploaded document, sorted for you automatically.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a.75.75 0 11-1.06 1.06l-3.08-3.08A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "show me the Anderson files" or "overdue invoice"'
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
        {/* Camera capture — accept + capture only makes sense for image
            input, kept separate from the general file picker below. */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelected(file);
            e.target.value = "";
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelected(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="whitespace-nowrap rounded-md border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60"
        >
          {uploading ? "Working…" : "📷 Take Photo"}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="whitespace-nowrap rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600 disabled:opacity-60"
        >
          {uploading ? "Uploading & extracting…" : "Upload File"}
        </button>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("All")}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            category === "All" ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All ({documents.length})
        </button>
        {DOCUMENT_TYPES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              category === cat ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat} ({countsByCategory[cat] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
          No documents match that search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/library/${doc.id}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
                    <DocumentIcon type={doc.fileType} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{doc.fileName}</p>
                    <span
                      className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        doc.extracted.document_type ? CATEGORY_STYLES[doc.extracted.document_type] : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {doc.extracted.document_type ?? "Unsorted"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-0.5 text-sm text-slate-600">
                <p className="truncate font-medium text-slate-800">
                  {doc.extracted.deceased_name ?? doc.extracted.next_of_kin_name ?? "Unmatched"}
                </p>
                {(doc.extracted.next_of_kin_phone || doc.extracted.next_of_kin_cell) && (
                  <p>{doc.extracted.next_of_kin_phone ?? doc.extracted.next_of_kin_cell}</p>
                )}
                {doc.extracted.service_date && <p>{doc.extracted.service_date}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

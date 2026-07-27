"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DocumentIcon from "@/components/dashboard/DocumentIcon";
import SampleTag from "@/components/dashboard/SampleTag";
import { LIBRARY_CATEGORIES, LIBRARY_DOCUMENTS, LibraryCategory } from "@/lib/dashboard-data";

const CATEGORY_STYLES: Record<LibraryCategory, string> = {
  Contracts: "bg-violet-50 text-violet-700",
  Invoices: "bg-emerald-50 text-emerald-700",
  "Service Records": "bg-blue-50 text-blue-700",
  "Customer Intake": "bg-amber-50 text-amber-700",
  Certificates: "bg-slate-100 text-slate-700",
};

const FILLER_WORDS = /\b(show|me|the|find|search|for|please|files?|documents?|docs?|from|about)\b/g;

function normalizeQuery(query: string) {
  return query.toLowerCase().replace(FILLER_WORDS, "").replace(/\s+/g, " ").trim();
}

export default function DashboardLibraryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | LibraryCategory>("All");
  const [showUploadDemo, setShowUploadDemo] = useState(false);

  const normalized = normalizeQuery(query);

  const filtered = useMemo(() => {
    return LIBRARY_DOCUMENTS.filter((doc) => {
      if (category !== "All" && doc.category !== category) return false;
      if (!normalized) return true;
      const haystack = `${doc.customerName} ${doc.fileName} ${doc.category}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [category, normalized]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of LIBRARY_DOCUMENTS) counts[doc.category] = (counts[doc.category] ?? 0) + 1;
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Company Files
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Every scanned or uploaded document, sorted for you automatically.
          </p>
        </div>
        <SampleTag />
      </div>

      {/* Search + upload */}
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
            placeholder='Try "show me the Rivera files" or "overdue invoice"'
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <button
          onClick={() => setShowUploadDemo(true)}
          className="whitespace-nowrap rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600"
        >
          + Upload
        </button>
      </div>

      {showUploadDemo && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
          <p>
            <span className="font-semibold">Demo only —</span> in your live
            portal, snapping a photo or uploading a PDF here scans it, pulls
            out the key info, and automatically files it into the right
            category below.
          </p>
          <button
            onClick={() => setShowUploadDemo(false)}
            className="flex-shrink-0 text-violet-600 hover:text-violet-800"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("All")}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            category === "All"
              ? "border-violet-600 bg-violet-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All ({LIBRARY_DOCUMENTS.length})
        </button>
        {LIBRARY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat} ({countsByCategory[cat] ?? 0})
          </button>
        ))}
      </div>

      {/* Document grid */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
          No documents match that search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/demo/library/${doc.id}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
                    <DocumentIcon type={doc.fileType} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {doc.fileName}
                    </p>
                    <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_STYLES[doc.category]}`}>
                      {doc.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-0.5 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{doc.customerName}</p>
                {doc.extracted.phone && <p>{doc.extracted.phone}</p>}
                <p>{doc.extracted.date}</p>
                {doc.extracted.amount && <p className="font-semibold text-slate-900">{doc.extracted.amount}</p>}
              </div>

              <div className="mt-3">
                <SampleTag />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

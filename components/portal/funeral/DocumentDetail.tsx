"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DocumentIcon from "@/components/dashboard/DocumentIcon";
import { updateDocumentFields, type UpdateDocumentState } from "@/lib/portal/funeral/actions";
import { DOCUMENT_TYPES, type LibraryDocument, type DocumentType } from "@/lib/portal/funeral/types";

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

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
const labelClass = "block text-sm font-medium text-slate-700";

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

const initialState: UpdateDocumentState = { error: null, savedAt: null };

export default function DocumentDetail({
  doc,
  previewUrl,
}: {
  doc: LibraryDocument;
  previewUrl: string | null;
}) {
  const { extracted } = doc;
  const router = useRouter();
  const [category, setCategory] = useState<DocumentType | "">(extracted.document_type ?? "");
  const [state, formAction, pending] = useActionState(updateDocumentFields, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [replacing, setReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const retakeCameraInputRef = useRef<HTMLInputElement>(null);
  const retakeFileInputRef = useRef<HTMLInputElement>(null);

  const categoryStyle = category ? CATEGORY_STYLES[category] : "bg-slate-100 text-slate-500";

  function handleCategoryChange(next: string) {
    const nextCategory = next as DocumentType | "";
    setCategory(nextCategory);
    // Re-files the document immediately, independent of whatever's
    // mid-edit in the other fields — read those straight off the form's
    // live DOM values rather than waiting on React state to settle.
    const data = new FormData(formRef.current ?? undefined);
    data.set("document_type", nextCategory);
    startTransition(() => formAction(data));
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/portal/documents/${doc.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Delete failed.");
      }
      router.push("/dashboard/library");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  async function handleReplaceFile(file: File) {
    setReplacing(true);
    setReplaceError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/portal/documents/${doc.id}`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Replace failed.");
      }
      // The route already swapped the row over to the new file and
      // extraction — pull fresh doc + a fresh signed URL for it.
      router.refresh();
    } catch (err) {
      setReplaceError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setReplacing(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Extracted info</h2>
            <p className="mt-1 text-xs text-slate-500">{STATUS_LABEL[doc.extractionStatus]}</p>
          </div>
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`flex-shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ${categoryStyle}`}
          >
            <option value="">Unsorted</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <form ref={formRef} action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={doc.id} />
          <input type="hidden" name="document_type" value={category} />

          <div>
            <label className={labelClass} htmlFor="deceased_name">
              Deceased
            </label>
            <input
              id="deceased_name"
              name="deceased_name"
              defaultValue={extracted.deceased_name ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="family_name">
              Family / Next of Kin
            </label>
            <input
              id="family_name"
              name="family_name"
              defaultValue={extracted.family_name ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="phone_numbers">
              Phone number(s)
            </label>
            <input
              id="phone_numbers"
              name="phone_numbers"
              defaultValue={(extracted.phone_numbers ?? []).join(", ")}
              placeholder="Separate multiple numbers with commas"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="service_date">
              Service Date
            </label>
            <input
              id="service_date"
              name="service_date"
              type="date"
              defaultValue={extracted.service_date ?? ""}
              className={inputClass}
            />
          </div>

          <InfoRow label="Address" value={extracted.address ?? "Not found"} />
          <InfoRow label="Notes" value={extracted.notes ?? "—"} />

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save corrections"}
            </button>
            {state.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
            {!state.error && !pending && state.savedAt && (
              <p className="text-sm font-medium text-emerald-600">Saved</p>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Original scan</h2>
          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${categoryStyle}`}>
            {category || "Unsorted"}
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

        <input
          ref={retakeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReplaceFile(file);
            e.target.value = "";
          }}
        />
        <input
          ref={retakeFileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReplaceFile(file);
            e.target.value = "";
          }}
        />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={() => retakeCameraInputRef.current?.click()}
            disabled={replacing || deleting}
            className="whitespace-nowrap rounded-md border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60"
          >
            {replacing ? "Replacing…" : "📷 Retake"}
          </button>
          <button
            onClick={() => retakeFileInputRef.current?.click()}
            disabled={replacing || deleting}
            className="whitespace-nowrap rounded-md border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60"
          >
            {replacing ? "Replacing…" : "Replace File"}
          </button>

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              disabled={replacing || deleting}
              className="whitespace-nowrap rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Delete document
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-red-700">Delete this document permanently?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="whitespace-nowrap rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="whitespace-nowrap rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {replaceError && <p className="mt-2 text-center text-xs font-medium text-red-600">{replaceError}</p>}
        {deleteError && <p className="mt-2 text-center text-xs font-medium text-red-600">{deleteError}</p>}
      </section>
    </div>
  );
}

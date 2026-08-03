"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DocumentIcon from "@/components/dashboard/DocumentIcon";
import { updateDocumentFields, saveGlanceFieldOrder, type UpdateDocumentState } from "@/lib/portal/funeral/actions";
import { DOCUMENT_TYPES, type LibraryDocument, type DocumentType, type ExtractedFields } from "@/lib/portal/funeral/types";
import { FIELD_BY_KEY, type FieldDef, resolveFieldSections } from "@/lib/portal/funeral/field-schema";
import { compressImageForUpload } from "@/lib/portal/documents/client-compress";

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

function FieldInput({ def, extracted }: { def: FieldDef; extracted: ExtractedFields }) {
  const value = extracted[def.key];

  if (def.input === "textarea") {
    return (
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={def.key}>
          {def.label}
        </label>
        <textarea id={def.key} name={def.key} defaultValue={(value as string) ?? ""} rows={3} className={inputClass} />
      </div>
    );
  }

  if (def.input === "boolean") {
    const v = value as boolean | null;
    return (
      <div>
        <label className={labelClass} htmlFor={def.key}>
          {def.label}
        </label>
        <select id={def.key} name={def.key} defaultValue={v === true ? "yes" : v === false ? "no" : ""} className={inputClass}>
          <option value="">Unknown</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    );
  }

  if (def.input === "disposition") {
    return (
      <div>
        <label className={labelClass} htmlFor={def.key}>
          {def.label}
        </label>
        <select id={def.key} name={def.key} defaultValue={(value as string) ?? ""} className={inputClass}>
          <option value="">Unspecified</option>
          <option value="Burial">Burial</option>
          <option value="Cremation">Cremation</option>
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className={labelClass} htmlFor={def.key}>
        {def.label}
      </label>
      <input
        id={def.key}
        name={def.key}
        type={def.input === "date" ? "date" : def.input === "number" ? "number" : "text"}
        defaultValue={(value as string | number | null) ?? ""}
        className={inputClass}
      />
    </div>
  );
}

const initialState: UpdateDocumentState = { error: null, savedAt: null };

export default function DocumentDetail({
  doc,
  previewUrl,
  fieldPrefs,
}: {
  doc: LibraryDocument;
  previewUrl: string | null;
  fieldPrefs: string[] | null;
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

  // "At a Glance" field order — glanceOrder is the saved/applied order;
  // draftOrder is only touched while the customize panel is open, so
  // in-progress reordering never affects the main correction form until
  // it's explicitly saved.
  const [glanceOrder, setGlanceOrder] = useState<string[]>(fieldPrefs ?? []);
  const [editingLayout, setEditingLayout] = useState(false);
  const [draftOrder, setDraftOrder] = useState<string[]>(glanceOrder);
  const [layoutSaving, setLayoutSaving] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const categoryStyle = category ? CATEGORY_STYLES[category] : "bg-slate-100 text-slate-500";
  const sections = resolveFieldSections(glanceOrder);
  const draftSections = resolveFieldSections(draftOrder);

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

  function openLayoutEditor() {
    setDraftOrder(glanceOrder.length > 0 ? glanceOrder : sections.glance);
    setLayoutError(null);
    setEditingLayout(true);
  }

  function moveDraftField(index: number, direction: -1 | 1) {
    setDraftOrder((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeDraftField(key: string) {
    setDraftOrder((prev) => prev.filter((k) => k !== key));
  }

  function addDraftField(key: string) {
    setDraftOrder((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  async function handleSaveLayout() {
    setLayoutSaving(true);
    setLayoutError(null);
    try {
      const { error } = await saveGlanceFieldOrder(draftOrder);
      if (error) throw new Error(error);
      setGlanceOrder(draftOrder);
      setEditingLayout(false);
    } catch (err) {
      setLayoutError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLayoutSaving(false);
    }
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
      const uploadFile = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append("file", uploadFile);
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

        <form ref={formRef} action={formAction} className="mt-4 space-y-6">
          <input type="hidden" name="id" value={doc.id} />
          <input type="hidden" name="document_type" value={category} />

          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-violet-700">At a Glance</h3>
              <button
                type="button"
                onClick={() => (editingLayout ? setEditingLayout(false) : openLayoutEditor())}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800"
              >
                {editingLayout ? "Close" : "Customize"}
              </button>
            </div>

            {editingLayout && (
              <div className="mt-3 rounded-lg border border-violet-200 bg-white p-3">
                <p className="text-xs font-semibold text-slate-600">Pinned to At a Glance</p>
                <ul className="mt-2 space-y-1">
                  {draftOrder.length === 0 && (
                    <li className="text-xs text-slate-400">Nothing pinned — add a field below.</li>
                  )}
                  {draftOrder.map((key, i) => (
                    <li
                      key={key}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-100 px-2 py-1.5 text-sm"
                    >
                      <span className="text-slate-800">{FIELD_BY_KEY[key]?.label ?? key}</span>
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveDraftField(i, -1)}
                          disabled={i === 0}
                          className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDraftField(i, 1)}
                          disabled={i === draftOrder.length - 1}
                          className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDraftField(key)}
                          className="rounded border border-red-200 px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>

                <label className="mt-3 block text-xs font-semibold text-slate-600" htmlFor="add-glance-field">
                  Add a field
                </label>
                <select
                  id="add-glance-field"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addDraftField(e.target.value);
                  }}
                  className={inputClass}
                >
                  <option value="">Choose a field…</option>
                  {draftSections.case.length > 0 && (
                    <optgroup label="Case Details">
                      {draftSections.case.map((key) => (
                        <option key={key} value={key}>
                          {FIELD_BY_KEY[key]?.label ?? key}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {draftSections.full.length > 0 && (
                    <optgroup label="Full Record">
                      {draftSections.full.map((key) => (
                        <option key={key} value={key}>
                          {FIELD_BY_KEY[key]?.label ?? key}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveLayout}
                    disabled={layoutSaving}
                    className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                  >
                    {layoutSaving ? "Saving…" : "Save layout"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLayout(false)}
                    disabled={layoutSaving}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  {layoutError && <span className="text-xs font-medium text-red-600">{layoutError}</span>}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Applies for everyone at your company, on every document.
                </p>
              </div>
            )}

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {sections.glance.map((key) => (
                <FieldInput key={key} def={FIELD_BY_KEY[key]} extracted={extracted} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Case Details</h3>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {sections.case.map((key) => (
                <FieldInput key={key} def={FIELD_BY_KEY[key]} extracted={extracted} />
              ))}
            </div>
          </div>

          <details className="rounded-lg border border-slate-100 p-3">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">
              Full Record — show more
            </summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {sections.full.map((key) => (
                <FieldInput key={key} def={FIELD_BY_KEY[key]} extracted={extracted} />
              ))}
            </div>
          </details>

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

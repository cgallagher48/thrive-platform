import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentDetail from "@/components/portal/funeral/DocumentDetail";
import { requireSection } from "@/lib/portal/guard";
import { getDocument, getDocumentSignedUrl, getFieldPrefs } from "@/lib/portal/funeral/data";

export default async function LibraryDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("library");
  const { id } = await params;

  const doc = await getDocument(id);
  if (!doc) notFound();

  const [previewUrl, fieldPrefs] = await Promise.all([
    doc.storagePath ? getDocumentSignedUrl(doc.storagePath) : Promise.resolve(null),
    getFieldPrefs(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/library" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          ← Company Files
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{doc.fileName}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {doc.extracted.deceased_name ?? doc.extracted.next_of_kin_name ?? "Unmatched document"}
        </p>
      </div>

      {/* Keyed on storagePath so a retake/replace (which always lands on a
          fresh storage path) forces a clean remount — local state like the
          category selector and the correction form's default values would
          otherwise keep showing the replaced document's old content. */}
      <DocumentDetail key={doc.storagePath ?? doc.id} doc={doc} previewUrl={previewUrl} fieldPrefs={fieldPrefs} />
    </div>
  );
}

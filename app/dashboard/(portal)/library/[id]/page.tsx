import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentDetail from "@/components/portal/funeral/DocumentDetail";
import { requireSection } from "@/lib/portal/guard";
import { getDocument, getDocumentSignedUrl } from "@/lib/portal/funeral/data";

export default async function LibraryDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("library");
  const { id } = await params;

  const doc = await getDocument(id);
  if (!doc) notFound();

  const previewUrl = doc.storagePath ? await getDocumentSignedUrl(doc.storagePath) : null;

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
          {doc.extracted.deceased_name ?? doc.extracted.family_name ?? "Unmatched document"}
        </p>
      </div>

      <DocumentDetail doc={doc} previewUrl={previewUrl} />
    </div>
  );
}

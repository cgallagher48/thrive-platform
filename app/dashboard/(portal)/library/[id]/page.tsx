import Link from "next/link";
import { notFound } from "next/navigation";
import LibraryDocumentDetail from "@/components/dashboard/LibraryDocumentDetail";
import SampleTag from "@/components/dashboard/SampleTag";
import { LIBRARY_DOCUMENTS } from "@/lib/dashboard-data";

export default async function LibraryDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = LIBRARY_DOCUMENTS.find((d) => d.id === id);
  if (!doc) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/library"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Company Files
        </Link>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {doc.fileName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{doc.customerName}</p>
        </div>
        <SampleTag />
      </div>

      <LibraryDocumentDetail doc={doc} />
    </div>
  );
}

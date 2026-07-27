import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentIcon from "@/components/dashboard/DocumentIcon";
import { requireSection } from "@/lib/portal/guard";
import {
  getFamily,
  getServicesForFamily,
  getDocumentsForFamily,
  getMessagesForFamily,
  getInvoicesForFamily,
} from "@/lib/portal/funeral/data";
import { familyDisplayName, formatCurrency, type InvoiceStatus } from "@/lib/portal/funeral/types";

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  outstanding: "bg-amber-50 text-amber-700",
  overdue: "bg-red-50 text-red-700",
};

export default async function FamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("families");
  const { id } = await params;

  const family = await getFamily(id);
  if (!family) notFound();

  const [services, documents, messages, invoices] = await Promise.all([
    getServicesForFamily(id),
    getDocumentsForFamily(id),
    getMessagesForFamily(id),
    getInvoicesForFamily(id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/families" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          ← Families
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{familyDisplayName(family)}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Next of kin: {family.nextOfKinName} · {family.phone} · {family.email}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Services</h2>
          <div className="mt-4 space-y-3">
            {services.map((s) => (
              <div key={s.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-slate-900">
                  {s.serviceType} —{" "}
                  {new Date(s.serviceDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
                <p className="text-xs text-slate-500">{s.location}</p>
                {s.notes && <p className="mt-1 text-xs text-slate-500">{s.notes}</p>}
              </div>
            ))}
            {services.length === 0 && <p className="text-sm text-slate-400">No services on file.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Documents</h2>
          <div className="mt-4 space-y-3">
            {documents.map((d) => (
              <Link
                key={d.id}
                href={`/dashboard/library/${d.id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:border-violet-200"
              >
                <DocumentIcon type={d.fileType} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{d.fileName}</p>
                  <p className="text-xs text-slate-500">{d.extracted.document_type ?? "Unsorted"}</p>
                </div>
              </Link>
            ))}
            {documents.length === 0 && <p className="text-sm text-slate-400">No documents on file.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Communications</h2>
          <div className="mt-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {m.direction === "inbound" ? "From family" : "To family"} · {m.channel}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(m.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{m.preview}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-sm text-slate-400">No messages on file.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Invoices</h2>
          <div className="mt-4 space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{inv.description}</p>
                  <p className="text-xs text-slate-500">Due {inv.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(inv.amountCents)}</p>
                  <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${INVOICE_STATUS_STYLES[inv.status]}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-sm text-slate-400">No invoices on file.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

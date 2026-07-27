import Link from "next/link";
import { requireSection } from "@/lib/portal/guard";
import { getFamilies, getServices, getDocuments, getInvoices } from "@/lib/portal/funeral/data";
import { familyDisplayName, type FamilyStatus } from "@/lib/portal/funeral/types";

const STATUS_STYLES: Record<FamilyStatus, string> = {
  active: "bg-violet-50 text-violet-700",
  "pre-need": "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
};

export default async function FamiliesPage() {
  await requireSection("families");

  const [families, services, documents, invoices] = await Promise.all([
    getFamilies(),
    getServices(),
    getDocuments(),
    getInvoices(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Families</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Case and family records, with full history in one place.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Family</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Services</th>
              <th className="px-5 py-3">Documents</th>
              <th className="px-5 py-3">Invoices</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {families.map((f) => {
              const serviceCount = services.filter((s) => s.familyId === f.id).length;
              const docCount = documents.filter((d) => d.familyId === f.id).length;
              const invoiceCount = invoices.filter((i) => i.familyId === f.id).length;
              return (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/families/${f.id}`} className="font-medium text-slate-900 hover:text-violet-700">
                      {familyDisplayName(f)}
                    </Link>
                    <p className="text-xs text-slate-500">{f.nextOfKinName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[f.status]}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{serviceCount}</td>
                  <td className="px-5 py-4 text-slate-600">{docCount}</td>
                  <td className="px-5 py-4 text-slate-600">{invoiceCount}</td>
                </tr>
              );
            })}
            {families.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                  No families yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

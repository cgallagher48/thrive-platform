import { requireSection } from "@/lib/portal/guard";
import { getInvoices, getFamilies } from "@/lib/portal/funeral/data";
import { familyDisplayName, formatCurrency, type InvoiceStatus } from "@/lib/portal/funeral/types";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  outstanding: "bg-amber-50 text-amber-700",
  overdue: "bg-red-50 text-red-700",
};

export default async function MoneyPage() {
  await requireSection("money");

  const [invoices, families] = await Promise.all([getInvoices(), getFamilies()]);

  const totals = {
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountCents, 0),
    outstanding: invoices.filter((i) => i.status === "outstanding").reduce((s, i) => s + i.amountCents, 0),
    overdue: invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amountCents, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Money</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Invoices and outstanding balances.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Paid</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Outstanding</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{formatCurrency(totals.outstanding)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Overdue</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{formatCurrency(totals.overdue)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Invoice</th>
              <th className="px-5 py-3">Family</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const family = families.find((f) => f.id === inv.familyId);
              return (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{inv.description}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{family ? familyDisplayName(family) : "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{inv.dueDate}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{formatCurrency(inv.amountCents)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

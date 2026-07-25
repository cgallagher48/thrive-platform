import SampleTag from "@/components/dashboard/SampleTag";
import { MONEY_SUMMARY, SAMPLE_INVOICES } from "@/lib/dashboard-data";

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Outstanding: "bg-violet-50 text-violet-700",
  Overdue: "bg-red-50 text-red-700",
};

export default function DashboardMoneyPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Money
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Invoices sent, chased, and collected — at a glance. Figures below
            are illustrative sample numbers, not real results.
          </p>
        </div>
        <SampleTag />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Outstanding", value: MONEY_SUMMARY.outstanding, tone: "text-slate-900" },
          { label: "Overdue", value: MONEY_SUMMARY.overdue, tone: "text-red-600" },
          { label: "Collected this month", value: MONEY_SUMMARY.collectedThisMonth, tone: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
              <SampleTag />
            </div>
            <p className={`mt-2 text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Invoices</h2>
          <SampleTag />
        </div>
        <ul className="divide-y divide-slate-100">
          {SAMPLE_INVOICES.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-3 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Invoice {inv.id} · {inv.customer}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{inv.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">{inv.amount}</span>
                <span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status]}`}>
                  {inv.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

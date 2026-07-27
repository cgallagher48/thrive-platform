import Link from "next/link";
import { requireSection } from "@/lib/portal/guard";
import { getFamilies, getServices, getMessages, getInvoices } from "@/lib/portal/funeral/data";
import { familyDisplayName, formatCurrency } from "@/lib/portal/funeral/types";

export default async function OverviewPage() {
  await requireSection("overview");

  const [families, services, messages, invoices] = await Promise.all([
    getFamilies(),
    getServices(),
    getMessages(),
    getInvoices(),
  ]);

  const activeFamilies = families.filter((f) => f.status !== "completed");
  const upcomingServices = services
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));
  const unreadMessages = messages.filter((m) => m.unread);
  const outstandingInvoices = invoices.filter((i) => i.status !== "paid");
  const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + i.amountCents, 0);

  const stats = [
    { label: "Active families", value: activeFamilies.length, href: "/dashboard/families" },
    { label: "Upcoming services", value: upcomingServices.length, href: "/dashboard/calendar" },
    { label: "Unread messages", value: unreadMessages.length, href: "/dashboard/inbox" },
    { label: "Outstanding balance", value: formatCurrency(outstandingTotal), href: "/dashboard/money" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">A calm, at-a-glance look at the business.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-200 hover:shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Upcoming services</h2>
          <div className="mt-4 space-y-3">
            {upcomingServices.slice(0, 4).map((s) => {
              const family = families.find((f) => f.id === s.familyId);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {family ? familyDisplayName(family) : "Unknown family"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.serviceType} — {s.location}
                    </p>
                  </div>
                  <p className="flex-shrink-0 text-xs font-medium text-slate-500">
                    {new Date(s.serviceDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              );
            })}
            {upcomingServices.length === 0 && <p className="text-sm text-slate-400">Nothing scheduled.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Needs your attention</h2>
          <div className="mt-4 space-y-3">
            {unreadMessages.slice(0, 4).map((m) => {
              const family = families.find((f) => f.id === m.familyId);
              return (
                <div key={m.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {family ? familyDisplayName(family) : "Unknown family"}
                    </p>
                    <p className="truncate text-xs text-slate-500">{m.preview}</p>
                  </div>
                  <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" />
                </div>
              );
            })}
            {unreadMessages.length === 0 && <p className="text-sm text-slate-400">Inbox is caught up.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

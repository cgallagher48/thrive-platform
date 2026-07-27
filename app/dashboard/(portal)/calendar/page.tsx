import { requireSection } from "@/lib/portal/guard";
import { getServices, getFamilies } from "@/lib/portal/funeral/data";
import { familyDisplayName, type ServiceType } from "@/lib/portal/funeral/types";

const TYPE_STYLES: Record<ServiceType, string> = {
  Visitation: "bg-blue-50 text-blue-700",
  Funeral: "bg-violet-50 text-violet-700",
  Burial: "bg-slate-100 text-slate-700",
  Cremation: "bg-amber-50 text-amber-700",
  Memorial: "bg-emerald-50 text-emerald-700",
};

export default async function CalendarPage() {
  await requireSection("calendar");

  const [services, families] = await Promise.all([getServices(), getFamilies()]);
  const sorted = [...services].sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));

  const byDate = new Map<string, typeof sorted>();
  for (const s of sorted) {
    const dateKey = new Date(s.serviceDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    byDate.set(dateKey, [...(byDate.get(dateKey) ?? []), s]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendar</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Services and appointments schedule.</p>
      </div>

      <div className="space-y-6">
        {[...byDate.entries()].map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-2 text-sm font-semibold text-slate-500">{date}</h2>
            <div className="space-y-2">
              {items.map((s) => {
                const family = families.find((f) => f.id === s.familyId);
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border bg-white p-4 ${
                      s.status === "cancelled" ? "border-slate-200 opacity-60" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${TYPE_STYLES[s.serviceType]}`}>
                        {s.serviceType}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{family ? familyDisplayName(family) : "Unknown family"}</p>
                        <p className="text-xs text-slate-500">{s.location}</p>
                      </div>
                    </div>
                    <p className="flex-shrink-0 text-sm font-medium text-slate-600">
                      {new Date(s.serviceDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {sorted.length === 0 && <p className="text-sm text-slate-400">Nothing on the schedule.</p>}
      </div>
    </div>
  );
}

import { requireSection } from "@/lib/portal/guard";
import { getFamilies, getServices, getMessages, getReviews } from "@/lib/portal/funeral/data";
import { familyDisplayName } from "@/lib/portal/funeral/types";

export default async function TodayPage() {
  await requireSection("today");

  const [families, services, messages, reviews] = await Promise.all([
    getFamilies(),
    getServices(),
    getMessages(),
    getReviews(),
  ]);

  const followUps = messages.filter((m) => m.unread && m.direction === "inbound");
  const upcoming = services
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))
    .slice(0, 5);

  const reviewedFamilyIds = new Set(reviews.map((r) => r.familyId));
  const reviewRequestCandidates = families.filter((f) => f.status === "completed" && !reviewedFamilyIds.has(f.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Today</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Families to follow up with</h2>
        <p className="mt-1 text-xs text-slate-500">Unread messages waiting on a reply.</p>
        <div className="mt-4 space-y-3">
          {followUps.map((m) => {
            const family = families.find((f) => f.id === m.familyId);
            return (
              <div key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{family ? familyDisplayName(family) : "Unknown family"}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-600">{m.preview}</p>
                </div>
                <span className="flex-shrink-0 rounded bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                  {m.channel}
                </span>
              </div>
            );
          })}
          {followUps.length === 0 && <p className="text-sm text-slate-400">No open follow-ups. Nice.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Upcoming services</h2>
        <div className="mt-4 space-y-3">
          {upcoming.map((s) => {
            const family = families.find((f) => f.id === s.familyId);
            return (
              <div key={s.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {family ? familyDisplayName(family) : "Unknown family"} — {s.serviceType}
                  </p>
                  <p className="text-xs text-slate-500">{s.location}</p>
                </div>
                <p className="flex-shrink-0 text-xs font-medium text-slate-500">
                  {new Date(s.serviceDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Review requests to send</h2>
        <p className="mt-1 text-xs text-slate-500">Completed services with no review request sent yet.</p>
        <div className="mt-4 space-y-3">
          {reviewRequestCandidates.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-900">{familyDisplayName(f)}</p>
              <button
                disabled
                title="Not set up yet — see Settings to turn this on"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400"
              >
                Send request
              </button>
            </div>
          ))}
          {reviewRequestCandidates.length === 0 && (
            <p className="text-sm text-slate-400">All completed families have been asked for a review.</p>
          )}
        </div>
      </section>
    </div>
  );
}

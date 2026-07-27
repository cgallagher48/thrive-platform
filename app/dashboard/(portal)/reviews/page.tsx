import StarRating from "@/components/dashboard/StarRating";
import RatingChart from "@/components/portal/funeral/RatingChart";
import { requireSection } from "@/lib/portal/guard";
import { getReviews, getFamilies } from "@/lib/portal/funeral/data";
import { familyDisplayName } from "@/lib/portal/funeral/types";

function computeMonthlyRatingHistory(reviews: { rating: number; occurredAt: string }[]) {
  const byMonth = new Map<string, { total: number; count: number; sortKey: string }>();
  for (const r of reviews) {
    const date = new Date(r.occurredAt);
    const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const sortKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    const entry = byMonth.get(label) ?? { total: 0, count: 0, sortKey };
    entry.total += r.rating;
    entry.count += 1;
    byMonth.set(label, entry);
  }
  return [...byMonth.entries()]
    .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
    .map(([month, { total, count }]) => ({ month, avgRating: total / count, count }));
}

export default async function ReviewsPage() {
  await requireSection("reviews");

  const [reviews, families] = await Promise.all([getReviews(), getFamilies()]);
  const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  const needsReply = reviews.filter((r) => !r.responded);
  const history = computeMonthlyRatingHistory(reviews);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reviews</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Your reviews and rating trend, in one place.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Rating over time</h2>
            {avg !== null && <span className="text-sm font-semibold text-slate-700">{avg.toFixed(1)} avg</span>}
          </div>
          <div className="mt-6">
            {history.length > 0 ? (
              <RatingChart data={history} />
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                No reviews yet — once this is set up, reviews and their trend will appear here.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Send review requests</h2>
          <p className="mt-1 text-xs text-slate-500">Automatically ask families for a review once a service is complete.</p>
          <button
            disabled
            title="Not set up yet — see Settings to turn this on"
            className="mt-4 w-full rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white opacity-60"
          >
            Send to eligible families
          </button>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent reviews</h2>
          <span className="text-xs text-slate-500">{needsReply.length} awaiting a reply</span>
        </div>
        <div className="space-y-3">
          {reviews.map((r) => {
            const family = r.familyId ? families.find((f) => f.id === r.familyId) : null;
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <StarRating rating={r.rating} />
                    <p className="mt-1 text-xs text-slate-500">
                      {family ? familyDisplayName(family) : "Google reviewer"} ·{" "}
                      {new Date(r.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {!r.responded && (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Needs reply
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-700">{r.text}</p>
              </div>
            );
          })}
          {reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet.</p>}
        </div>
      </section>
    </div>
  );
}

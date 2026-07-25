import SampleTag from "@/components/dashboard/SampleTag";
import { RECENT_LEADS, TODAY_ACTIVITY, UPCOMING_BOOKINGS } from "@/lib/dashboard-data";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          The Dashboard
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          A calm, at-a-glance look at your business. Everything below is
          sample data so you can see how it would look once you&apos;re live.
        </p>
      </div>

      {/* Today's activity */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            Today&apos;s activity
          </h2>
          <SampleTag />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {TODAY_ACTIVITY.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {item.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent leads */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Recent leads</h2>
            <SampleTag />
          </div>
          <ul className="mt-5 space-y-3">
            {RECENT_LEADS.map((lead) => (
              <li
                key={lead.name}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {lead.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lead.source} · {lead.time}
                  </p>
                </div>
                <span className="whitespace-nowrap rounded bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                  {lead.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Upcoming bookings */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              Upcoming bookings
            </h2>
            <SampleTag />
          </div>
          <ul className="mt-5 space-y-3">
            {UPCOMING_BOOKINGS.map((booking) => (
              <li
                key={booking.customer}
                className="rounded-lg border border-slate-100 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {booking.customer}
                </p>
                <p className="text-xs text-slate-500">
                  {booking.service} · {booking.time}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

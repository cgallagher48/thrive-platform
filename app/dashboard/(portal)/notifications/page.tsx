import SampleTag from "@/components/dashboard/SampleTag";
import { NOTIFICATIONS } from "@/lib/dashboard-data";

const TYPE_STYLES: Record<string, string> = {
  "New Lead": "bg-violet-50 text-violet-700",
  "Invoice Overdue": "bg-red-50 text-red-700",
  "New Review": "bg-amber-50 text-amber-700",
  "Booking Confirmed": "bg-emerald-50 text-emerald-700",
  "Quote Follow-up": "bg-blue-50 text-blue-700",
};

export default function DashboardNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Everything the system flagged for you, newest first.
          </p>
        </div>
        <SampleTag />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {NOTIFICATIONS.map((note) => (
            <li key={note.id} className="flex items-center justify-between gap-3 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[note.type]}`}>
                  {note.type}
                </span>
                <p className="text-sm text-slate-700">{note.text}</p>
              </div>
              <span className="whitespace-nowrap text-xs text-slate-400">{note.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

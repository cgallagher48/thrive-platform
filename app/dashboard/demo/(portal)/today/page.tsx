import SampleTag from "@/components/dashboard/SampleTag";
import { TODAY_TASKS } from "@/lib/dashboard-data";

export default function DashboardTodayPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          What needs you today
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Everything automatic is already handled. This is the short list of
          things only you can do.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            {TODAY_TASKS.length} things need you
          </h2>
          <SampleTag />
        </div>

        <ul className="mt-5 space-y-3">
          {TODAY_TASKS.map((task) => (
            <li
              key={task.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="rounded bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                  {task.category}
                </span>
                <p className="mt-1.5 text-sm font-semibold text-slate-900">
                  {task.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">{task.detail}</p>
              </div>
              <button className="whitespace-nowrap rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600 sm:self-start">
                {task.actionLabel}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

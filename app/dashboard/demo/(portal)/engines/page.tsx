import SampleTag from "@/components/dashboard/SampleTag";
import { ENGINE_EXAMPLES } from "@/lib/dashboard-data";
import { ENGINES } from "@/lib/systems";

export default function DashboardEnginesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Engines
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Each engine automates one part of your operation. Here&apos;s what
          each one does, with a sample of it working.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {ENGINES.map((engine) => (
          <section
            key={engine.slug}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {engine.name}
              </h2>
              {engine.comingSoon && (
                <span className="whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Coming Soon
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-violet-600">
              {engine.tagline}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {engine.description}
            </p>

            {engine.comingSoon ? (
              <p className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                In development — not part of your portal yet.
              </p>
            ) : (
              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Example
                  </p>
                  <SampleTag />
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {ENGINE_EXAMPLES[engine.slug]}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

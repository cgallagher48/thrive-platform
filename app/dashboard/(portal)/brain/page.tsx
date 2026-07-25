import SampleTag from "@/components/dashboard/SampleTag";
import { BRAIN_DAILY_BRIEF, BRAIN_SAMPLE_CHAT } from "@/lib/dashboard-data";

export default function DashboardBrainPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          The Brain
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Your AI assistant — plain-language answers about your own business,
          plus a daily brief so you always know what needs your attention.
        </p>
      </div>

      {/* Daily brief */}
      <section className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            Today&apos;s brief
          </h2>
          <SampleTag />
        </div>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-700">
          {BRAIN_DAILY_BRIEF}
        </p>
      </section>

      {/* Assistant panel */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Ask the Brain</h2>
          <SampleTag />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Example of the kind of questions you&apos;ll be able to ask once
          you&apos;re live.
        </p>

        <div className="mt-5 space-y-3">
          {BRAIN_SAMPLE_CHAT.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex gap-2">
            <input
              type="text"
              disabled
              placeholder="Ask a question about your business..."
              className="w-full flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
            />
            <button
              disabled
              className="whitespace-nowrap rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
            >
              Ask
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Demo mode — this connects live to your data once your portal is
            set up.
          </p>
        </div>
      </section>
    </div>
  );
}

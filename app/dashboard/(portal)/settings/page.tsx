"use client";

import { useState } from "react";
import SampleTag from "@/components/dashboard/SampleTag";
import ToggleSwitch from "@/components/dashboard/ToggleSwitch";
import { ENGINES } from "@/lib/systems";

const CONTROLLABLE_ENGINES = ENGINES.filter((e) => !e.comingSoon);
const AI_RECEPTIONIST = ENGINES.find((e) => e.comingSoon);

export default function DashboardSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(CONTROLLABLE_ENGINES.map((e) => [e.slug, true]))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            You&apos;re in control of every engine. Turn any of them off any
            time — nothing runs without your say-so.
          </p>
        </div>
        <SampleTag />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {CONTROLLABLE_ENGINES.map((engine) => (
            <li key={engine.slug} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{engine.name}</p>
                <p className="mt-0.5 text-sm text-slate-600">{engine.tagline}</p>
              </div>
              <ToggleSwitch
                checked={enabled[engine.slug]}
                onChange={(next) =>
                  setEnabled((prev) => ({ ...prev, [engine.slug]: next }))
                }
                label={`Toggle ${engine.name}`}
              />
            </li>
          ))}

          {AI_RECEPTIONIST && (
            <li className="flex items-center justify-between gap-4 bg-slate-50 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{AI_RECEPTIONIST.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">{AI_RECEPTIONIST.tagline}</p>
              </div>
              <span className="whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Coming Soon
              </span>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import SampleTag from "@/components/dashboard/SampleTag";
import { SETUP_STEPS } from "@/lib/dashboard-data";

export default function DashboardSetupPage() {
  const [steps, setSteps] = useState(SETUP_STEPS);
  const doneCount = steps.filter((s) => s.done).length;

  function toggle(id: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Get set up
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            A few one-time steps to connect your business. Nothing complicated
            — most take a couple minutes.
          </p>
        </div>
        <SampleTag />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            {doneCount} of {steps.length} done
          </h2>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                onClick={() => toggle(step.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    step.done ? "border-violet-600 bg-violet-600" : "border-slate-300"
                  }`}
                >
                  {step.done && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-white" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <span className={`text-sm font-medium ${step.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                  {step.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

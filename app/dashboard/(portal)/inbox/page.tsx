"use client";

import { useState } from "react";
import SampleTag from "@/components/dashboard/SampleTag";
import { INBOX_THREADS } from "@/lib/dashboard-data";

export default function DashboardInboxPage() {
  const [selectedId, setSelectedId] = useState(INBOX_THREADS[0].id);
  const selected = INBOX_THREADS.find((t) => t.id === selectedId) ?? INBOX_THREADS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inbox
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Every web form, text, missed call, and email in one place, per
            customer.
          </p>
        </div>
        <SampleTag />
      </div>

      <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[280px_1fr]">
        {/* Thread list */}
        <div className="max-h-[520px] overflow-y-auto border-b border-slate-200 lg:max-h-none lg:border-b-0 lg:border-r">
          {INBOX_THREADS.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedId(thread.id)}
              className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 ${
                thread.id === selectedId ? "bg-violet-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {thread.customer}
                </p>
                {thread.unread && (
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-violet-600" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {thread.preview}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{thread.time}</p>
            </button>
          ))}
        </div>

        {/* Selected conversation */}
        <div className="flex flex-col p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900">
            {selected.customer}
          </h2>
          <div className="mt-4 space-y-3">
            {selected.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                    msg.direction === "out"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {msg.channel} · {msg.time}
                  </p>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

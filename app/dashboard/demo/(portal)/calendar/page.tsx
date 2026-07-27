"use client";

import { useMemo, useState } from "react";
import SampleTag from "@/components/dashboard/SampleTag";
import { CALENDAR_EVENTS, CALENDAR_MONTH, CALENDAR_TODAY } from "@/lib/dashboard-data";

const TYPE_STYLES: Record<string, string> = {
  Booking: "bg-violet-100 text-violet-700",
  Crew: "bg-blue-100 text-blue-700",
  "Follow-up": "bg-amber-100 text-amber-700",
};

function toKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateKey(d: Date) {
  return toKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export default function DashboardCalendarPage() {
  const [view, setView] = useState<"month" | "week">("month");
  const { year, month } = CALENDAR_MONTH;

  const monthCells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startWeekday = firstDay.getDay();
    const cells: (number | null)[] = Array.from({ length: startWeekday }, () => null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const weekDays = useMemo(() => {
    const [ty, tm, td] = CALENDAR_TODAY.split("-").map(Number);
    const today = new Date(ty, tm - 1, td);
    const start = new Date(ty, tm - 1, td - today.getDay());
    return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Calendar
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Bookings, crew assignments, and follow-up reminders in one
            schedule.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-200 bg-white p-0.5 text-sm font-medium">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1 capitalize ${
                  view === v ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <SampleTag />
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          {new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h2>

        {view === "month" ? (
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {d}
              </div>
            ))}
            {monthCells.map((day, i) => {
              if (!day) return <div key={i} />;
              const key = toKey(year, month, day);
              const events = CALENDAR_EVENTS.filter((e) => e.date === key);
              const isToday = key === CALENDAR_TODAY;
              return (
                <div
                  key={i}
                  className={`min-h-[86px] rounded-lg border p-1.5 text-left ${
                    isToday ? "border-violet-300 bg-violet-50" : "border-slate-100"
                  }`}
                >
                  <p className={`text-xs font-semibold ${isToday ? "text-violet-700" : "text-slate-500"}`}>
                    {day}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {events.slice(0, 2).map((e, idx) => (
                      <p
                        key={idx}
                        title={e.title}
                        className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${TYPE_STYLES[e.type]}`}
                      >
                        {e.title}
                      </p>
                    ))}
                    {events.length > 2 && (
                      <p className="text-[10px] text-slate-400">+{events.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {weekDays.map((d) => {
              const key = dateKey(d);
              const events = CALENDAR_EVENTS.filter((e) => e.date === key);
              const isToday = key === CALENDAR_TODAY;
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-3 ${isToday ? "border-violet-300 bg-violet-50" : "border-slate-100"}`}
                >
                  <p className={`text-sm font-semibold ${isToday ? "text-violet-700" : "text-slate-700"}`}>
                    {d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  {events.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-400">No events scheduled</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {events.map((e, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_STYLES[e.type]}`}>
                            {e.type}
                          </span>
                          <span className="text-slate-600">{e.time}</span>
                          <span className="text-slate-800">{e.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

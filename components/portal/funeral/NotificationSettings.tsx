"use client";

import { useState } from "react";
import ToggleSwitch from "@/components/dashboard/ToggleSwitch";

const DEFAULT_PREFS = {
  newMessages: true,
  upcomingServices: true,
  overdueInvoices: true,
  newReviews: false,
};

const LABELS: Record<keyof typeof DEFAULT_PREFS, string> = {
  newMessages: "New family messages",
  upcomingServices: "Upcoming service reminders",
  overdueInvoices: "Overdue invoice alerts",
  newReviews: "New Google reviews",
};

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  return (
    <div className="space-y-4">
      {(Object.keys(prefs) as (keyof typeof prefs)[]).map((key) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-700">{LABELS[key]}</span>
          <ToggleSwitch checked={prefs[key]} onChange={(next) => setPrefs((p) => ({ ...p, [key]: next }))} label={LABELS[key]} />
        </div>
      ))}
    </div>
  );
}

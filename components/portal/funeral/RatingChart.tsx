"use client";

import { useState } from "react";

export default function RatingChart({
  data,
}: {
  data: { month: string; avgRating: number; count: number }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = 5;

  return (
    <div>
      <div className="flex items-end gap-3" role="img" aria-label="Average rating by month, on a 5-star scale">
        {data.map((d, i) => {
          const heightPct = (d.avgRating / max) * 100;
          const isActive = hovered === i;
          return (
            <div
              key={d.month}
              className="group relative flex flex-1 flex-col items-center gap-2"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isActive && (
                <div className="absolute -top-9 z-10 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm">
                  {d.avgRating.toFixed(1)} avg · {d.count} reviews
                </div>
              )}
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className={`w-full max-w-8 rounded-t-md transition-colors ${isActive ? "bg-violet-700" : "bg-violet-500"}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500">{d.month.split(" ")[0]}</span>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>Average review rating by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Average rating</th>
            <th>Review count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <td>{d.month}</td>
              <td>{d.avgRating.toFixed(1)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

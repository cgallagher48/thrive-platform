"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SampleTag from "@/components/dashboard/SampleTag";
import StarRating from "@/components/dashboard/StarRating";
import { REVIEW_TREND, SAMPLE_REVIEWS } from "@/lib/dashboard-data";

export default function DashboardReviewsPage() {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sentIds, setSentIds] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reviews
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Every review in one place, with a draft reply ready when you want
            it.
          </p>
        </div>
        <SampleTag />
      </div>

      {/* Rating over time */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Rating over time</h2>
          <SampleTag />
        </div>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVIEW_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
              <Line type="monotone" dataKey="avgRating" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: "#7c3aed" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Reviews list */}
      <section className="space-y-4">
        {SAMPLE_REVIEWS.map((review) => (
          <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{review.customer}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-slate-500">{review.date}</span>
                </div>
              </div>
              {review.responded && (
                <span className="whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Responded
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {review.text}
            </p>

            {!review.responded && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                {sentIds[review.id] ? (
                  <p className="text-sm font-medium text-violet-600">
                    Reply saved (demo only — nothing was sent).
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={replyDrafts[review.id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                      }
                      placeholder="Write a reply..."
                      className="w-full flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                      onClick={() => setSentIds((prev) => ({ ...prev, [review.id]: true }))}
                      className="whitespace-nowrap rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600"
                    >
                      Send reply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

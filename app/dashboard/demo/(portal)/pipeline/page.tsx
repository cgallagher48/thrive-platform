"use client";

import { useState } from "react";
import SampleTag from "@/components/dashboard/SampleTag";
import { PIPELINE_JOBS, PIPELINE_STAGES, PipelineJob, PipelineStage } from "@/lib/dashboard-data";

export default function DashboardPipelinePage() {
  const [jobs, setJobs] = useState<PipelineJob[]>(PIPELINE_JOBS);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function moveJob(id: string, stage: PipelineStage) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, stage } : j)));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pipeline
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Every job, from first contact to paid. Drag a card to move it
            forward.
          </p>
        </div>
        <SampleTag />
      </div>

      <div className="grid gap-4 overflow-x-auto pb-2 sm:grid-cols-3 lg:grid-cols-5">
        {PIPELINE_STAGES.map((stage) => {
          const stageJobs = jobs.filter((j) => j.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingId) moveJob(draggingId, stage);
                setDraggingId(null);
              }}
              className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {stage}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {stageJobs.length}
                </span>
              </div>
              <div className="space-y-2">
                {stageJobs.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={() => setDraggingId(job.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing ${
                      draggingId === job.id ? "opacity-50" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {job.customer}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{job.service}</p>
                    <p className="mt-1.5 text-sm font-semibold text-violet-600">
                      {job.value}
                    </p>
                  </div>
                ))}
                {stageJobs.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
                    No jobs here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

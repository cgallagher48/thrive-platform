import Link from "next/link";
import { requireSection } from "@/lib/portal/guard";
import { getMessages, getFamilies } from "@/lib/portal/funeral/data";
import { familyDisplayName } from "@/lib/portal/funeral/types";

export default async function InboxPage() {
  await requireSection("inbox");

  const [messages, families] = await Promise.all([getMessages(), getFamilies()]);
  const sorted = [...messages].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inbox</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          All your family communications, in one place.
        </p>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {sorted.map((m) => {
          const family = families.find((f) => f.id === m.familyId);
          return (
            <Link
              key={m.id}
              href={family ? `/dashboard/families/${family.id}` : "#"}
              className={`flex items-start justify-between gap-3 px-5 py-4 hover:bg-slate-50 ${m.unread ? "bg-violet-50/40" : ""}`}
            >
              <div className="flex min-w-0 items-start gap-3">
                {m.unread && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" aria-hidden="true" />}
                <div className={`min-w-0 ${m.unread ? "" : "pl-5"}`}>
                  <p className="text-sm font-semibold text-slate-900">{family ? familyDisplayName(family) : "Unknown family"}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-600">{m.preview}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-1">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {m.channel}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(m.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </Link>
          );
        })}
        {sorted.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-400">No messages yet.</p>}
      </div>
    </div>
  );
}

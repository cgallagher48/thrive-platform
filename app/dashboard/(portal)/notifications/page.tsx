import { requireSection } from "@/lib/portal/guard";
import { getMessages, getInvoices, getDocuments, getFamilies } from "@/lib/portal/funeral/data";
import { familyDisplayName, formatCurrency } from "@/lib/portal/funeral/types";

// There's no separate notifications table yet — this feed is computed live
// from the same data every other section reads, rather than a stored,
// individually-dismissible notification log. That's a reasonable next
// addition once persistent read/unread state per notification is wanted.
export default async function NotificationsPage() {
  await requireSection("notifications");

  const [messages, invoices, documents, families] = await Promise.all([
    getMessages(),
    getInvoices(),
    getDocuments(),
    getFamilies(),
  ]);

  type Item = { id: string; title: string; detail: string; occurredAt: string };
  const items: Item[] = [];

  for (const m of messages.filter((m) => m.unread && m.direction === "inbound")) {
    const family = families.find((f) => f.id === m.familyId);
    items.push({
      id: `msg-${m.id}`,
      title: `New message from ${family ? familyDisplayName(family) : "a family"}`,
      detail: m.preview,
      occurredAt: m.occurredAt,
    });
  }

  for (const inv of invoices.filter((i) => i.status === "overdue")) {
    const family = families.find((f) => f.id === inv.familyId);
    items.push({
      id: `inv-${inv.id}`,
      title: "Invoice overdue",
      detail: `${family ? familyDisplayName(family) : "A family"}'s balance of ${formatCurrency(inv.amountCents)} is past due.`,
      occurredAt: inv.dueDate,
    });
  }

  for (const doc of documents.filter((d) => d.extractionStatus === "failed" || !d.familyId)) {
    items.push({
      id: `doc-${doc.id}`,
      title: "Document needs review",
      detail: `${doc.fileName} ${doc.familyId ? "needs extraction reviewed" : "couldn't be matched to a family automatically"}.`,
      occurredAt: doc.uploadedAt,
    });
  }

  items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Everything that needs your attention, in one feed.</p>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {items.map((n) => (
          <div key={n.id} className="flex items-start gap-3 bg-violet-50/40 px-5 py-4">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{n.detail}</p>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-400">Nothing needs your attention right now.</p>}
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import SampleTag from "@/components/dashboard/SampleTag";
import StarRating from "@/components/dashboard/StarRating";
import { SAMPLE_CUSTOMERS } from "@/lib/dashboard-data";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = SAMPLE_CUSTOMERS.find((c) => c.id === id);
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/demo/customers"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← All customers
        </Link>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {customer.name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {customer.phone} · {customer.email} · Customer since {customer.since}
          </p>
        </div>
        <SampleTag />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Jobs</h2>
          <ul className="mt-3 space-y-2">
            {customer.jobs.map((job, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{job.service}</p>
                  <p className="text-xs text-slate-500">{job.date}</p>
                </div>
                <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                  {job.status}
                </span>
              </li>
            ))}
            {customer.jobs.length === 0 && (
              <p className="text-sm text-slate-400">No jobs yet.</p>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Messages</h2>
          <ul className="mt-3 space-y-2">
            {customer.messages.map((msg, i) => (
              <li key={i} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {msg.channel} · {msg.date}
                </p>
                <p className="mt-0.5 text-slate-700">{msg.preview}</p>
              </li>
            ))}
            {customer.messages.length === 0 && (
              <p className="text-sm text-slate-400">No messages yet.</p>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Invoices</h2>
          <ul className="mt-3 space-y-2">
            {customer.invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900">Invoice {inv.id}</p>
                  <p className="text-xs text-slate-500">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{inv.amount}</p>
                  <p className="text-xs text-slate-500">{inv.status}</p>
                </div>
              </li>
            ))}
            {customer.invoices.length === 0 && (
              <p className="text-sm text-slate-400">No invoices yet.</p>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-bold text-slate-900">Reviews</h2>
          <ul className="mt-3 space-y-2">
            {customer.reviews.map((review, i) => (
              <li key={i} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-slate-500">{review.date}</span>
                </div>
                <p className="mt-1.5 text-slate-700">{review.text}</p>
              </li>
            ))}
            {customer.reviews.length === 0 && (
              <p className="text-sm text-slate-400">No reviews yet.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

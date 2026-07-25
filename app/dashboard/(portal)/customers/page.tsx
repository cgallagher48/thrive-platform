import Link from "next/link";
import SampleTag from "@/components/dashboard/SampleTag";
import { SAMPLE_CUSTOMERS } from "@/lib/dashboard-data";

export default function DashboardCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Every customer, with their full history in one profile.
          </p>
        </div>
        <SampleTag />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {SAMPLE_CUSTOMERS.map((customer) => (
            <li key={customer.id}>
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 sm:px-6"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {customer.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Customer since {customer.since} · {customer.jobs.length} job
                    {customer.jobs.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-violet-600">
                  View →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

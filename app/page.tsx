import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BASE, CALENDLY_URL, ENGINES } from "@/lib/systems";

const STEPS = [
  {
    title: "Book a call",
    body: "We walk through how your business runs today — where leads come from, how work gets scheduled, where things fall through the cracks.",
  },
  {
    title: "We build your system",
    body: "Every build starts with the Dashboard and the Brain. Then we configure the engines your business actually needs — nothing you don't.",
  },
  {
    title: "Your operations run themselves",
    body: "Leads get answered, quotes get followed up, invoices get chased — automatically. You watch it all from one dashboard.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Automation That Runs Your Business.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              We build intelligent operations systems — one dashboard, an AI
              brain, and automation engines configured to your business. Leads
              answered, quotes followed up, invoices collected, reviews
              requested. Automatically.
            </p>
            <div className="mt-8">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md bg-blue-800 px-7 py-3.5 text-base font-semibold text-white hover:bg-blue-900"
              >
                Book a Call
              </a>
            </div>
          </div>
        </section>

        {/* Always included */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              Included with every build
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every system starts with the same foundation.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {BASE.map((b) => (
                <div
                  key={b.slug}
                  className="rounded-xl border border-slate-200 bg-white p-8"
                >
                  <h3 className="text-xl font-bold text-slate-900">{b.name}</h3>
                  <p className="mt-1 text-sm font-medium text-blue-800">
                    {b.tagline}
                  </p>
                  <p className="mt-4 leading-relaxed text-slate-600">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One system, built around how you already work.
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-800 text-base font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Engines */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              Our Systems
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The engines. Pick what your business needs.
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ENGINES.map((e) => (
                <div
                  key={e.slug}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {e.name}
                    </h3>
                    {e.comingSoon && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {e.tagline}
                  </p>
                  <Link
                    href={`/systems#${e.slug}`}
                    className="mt-4 text-sm font-semibold text-blue-800 hover:text-blue-900"
                  >
                    Learn More →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who we serve */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              Who we serve
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Any business with leads, quotes, schedules, and customers.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Currently focused on service businesses — roofing, masonry, HVAC,
              contractors. The engines are industry-agnostic: we configure them
              to how your business actually works.
            </p>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-blue-900">
          <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See what this looks like for your business.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Book a call. We&apos;ll walk through your operation and show you
              exactly which engines fit.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-md bg-white px-7 py-3.5 text-base font-semibold text-blue-900 hover:bg-blue-50"
            >
              Book a Call
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

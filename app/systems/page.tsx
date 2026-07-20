import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BASE, CALENDLY_URL, ENGINES } from "@/lib/systems";

export const metadata: Metadata = {
  title: "Our Systems | Thrive Automation Agency",
  description:
    "The Dashboard and the Brain come with every build. Then pick the engines your business needs — from Speed-to-Lead to Trigger Campaigns.",
};

export default function SystemsPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Intro + base */}
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Our Systems
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              Every build starts with the same foundation — the Dashboard and
              the Brain. On top of that, you pick the engines your business
              needs. Each one runs a part of your operation automatically.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {BASE.map((b) => (
                <div
                  key={b.slug}
                  className="rounded-xl border-2 border-violet-600/20 bg-slate-50 p-8"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                    Always included
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {b.name}
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    {b.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    {b.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Engines */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            {ENGINES.map((e, i) => (
              <article
                key={e.slug}
                id={e.slug}
                className={`scroll-mt-20 py-14 sm:py-16 ${i > 0 ? "border-t border-slate-100" : ""}`}
              >
                <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        {e.name}
                      </h2>
                      {e.comingSoon && (
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-violet-600">
                      {e.tagline}
                    </p>
                  </div>
                  <div>
                    <p className="leading-relaxed text-slate-600">
                      {e.description}
                    </p>
                    <p className="mt-4 font-medium leading-relaxed text-slate-800">
                      {e.benefit}
                    </p>
                    {!e.comingSoon && (
                      <a
                        href={CALENDLY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700"
                      >
                        Talk to us about {e.name} →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-gradient-to-r from-violet-600 to-purple-500">
          <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Not sure which engines you need?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-violet-100">
              That&apos;s what the call is for. We&apos;ll look at how your
              business runs and recommend only what fits.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-md bg-white px-7 py-3.5 text-base font-semibold text-violet-700 hover:bg-violet-50"
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

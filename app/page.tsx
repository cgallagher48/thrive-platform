import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FramedPhoto from "@/components/FramedPhoto";
import { BASE, CALENDLY_URL, ENGINES } from "@/lib/systems";

const STEPS = [
  {
    title: "Book a call",
    body: "We walk through how your business runs today: where leads come from, how work gets scheduled, and where things are falling through the cracks.",
  },
  {
    title: "We build your system",
    body: "Every build starts with the Dashboard and the Brain. From there, we add only the engines your business actually needs.",
  },
  {
    title: "Your operations run themselves",
    body: "Leads get answered. Quotes get followed up. Invoices get chased down. You watch all of it from one dashboard.",
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
            <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
              <div>
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Automation That Runs Your Business.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                  One dashboard, one AI brain, and automation engines built
                  around your business. Leads get answered the moment they
                  come in. Quotes get followed up until they close. Invoices
                  go out on their own and get chased down until they&apos;re
                  paid.
                </p>
                <div className="mt-8">
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-7 py-3.5 text-base font-semibold text-white hover:from-violet-700 hover:to-purple-600"
                  >
                    Book a Call
                  </a>
                </div>
              </div>
              <FramedPhoto
                src="/images/hero-happy-owner.jpg"
                alt="A smiling shop owner standing confidently in his store"
                priority
              />
            </div>
          </div>
        </section>

        {/* Always included */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
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
                  <p className="mt-1 text-sm font-medium text-violet-600">
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
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One system, built around how you already work.
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-500 text-base font-bold text-white">
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
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
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
                    className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700"
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
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Who we serve
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Any business with leads, quotes, schedules, and customers.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              We work with local businesses of all kinds: roofing crews and
              HVAC companies, salons and barbershops, cafes and auto shops,
              anyone juggling leads, quotes, scheduling, and follow-up. The
              engines aren&apos;t industry-specific. We configure each one to
              match how your business actually runs.
            </p>
          </div>
        </section>

        {/* Community banner */}
        <section className="relative isolate">
          <div className="relative h-64 w-full overflow-hidden sm:h-80">
            <Image
              src="/images/community-team-celebrating.jpg"
              alt="A diverse business team celebrating together in an office"
              fill
              sizes="100vw"
              className="object-cover object-[50%_40%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <p className="mx-auto max-w-6xl px-5 pb-8 text-lg font-semibold text-white sm:px-8 sm:text-xl">
                Built for the businesses that keep your city running.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section id="our-story" className="scroll-mt-16 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              Our Story
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why I built Thrive.
            </h2>
            <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_3fr] lg:items-start">
              <FramedPhoto
                src="/images/story-power-washing.png"
                alt="A power washer cleaning a stone patio outside a home"
                aspect="4 / 5"
                objectPosition="70% 45%"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              <div className="space-y-5 text-lg leading-relaxed text-slate-600">
                <p>I built the first version of Thrive for myself.</p>
                <p>
                  I was running a power washing business, out on jobs most of
                  the day with my hands busy and my phone going off in my
                  pocket. Half the time I could not get to it, and a lead that
                  called while I was working had usually moved on by the time
                  I called back. At night I would sit down to catch up on the
                  follow ups, the scheduling, the invoices I still had not
                  sent. I have always loved building systems, so instead of
                  just grinding through it, I started building tools to
                  handle all of it for me.
                </p>
                <p>
                  Once it was running, it hit me. Every owner I knew was stuck
                  in the same loop I had just climbed out of, doing by hand
                  what software could already do on its own. That software
                  exists. The problem is it is built for big companies with
                  big budgets and an IT team to run it, not for the guy
                  washing houses or the shop down the street.
                </p>
                <p>
                  That never sat right with me. The small businesses in my own
                  neighborhood, the ones I actually know, were the ones
                  getting priced out of the tools that would help them most.
                </p>
                <p>
                  So that is what Thrive is. I take the kind of automation the
                  big companies pay a fortune for and build it for the
                  businesses that keep this city running, at a price that
                  makes sense for a real shop.
                </p>
                <p className="pt-2 font-semibold text-slate-900">
                  Casey Gallagher, Founder
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-gradient-to-r from-violet-600 to-purple-500">
          <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See what this looks like for your business.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-violet-100">
              Book a call. We&apos;ll walk through your operation and show you
              exactly which engines fit.
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

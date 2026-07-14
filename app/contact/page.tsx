import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CALENDLY_URL, CONTACT_EMAIL } from "@/lib/systems";

export const metadata: Metadata = {
  title: "Contact | Thrive Automation Agency",
  description:
    "Book a call to walk through your operation and see which systems fit your business.",
};

const CALL_POINTS = [
  "How your business runs today — leads, quotes, scheduling, invoicing",
  "Where things currently fall through the cracks",
  "Which engines fit, and what the system would look like for you",
  "Pricing — we go through it openly on the call",
];

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  Book a call.
                </h1>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
                  Every engagement starts with a conversation — no forms, no
                  sales sequence. Pick a time that works and we&apos;ll talk
                  through your operation.
                </p>
                <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-blue-800">
                  What we cover on the call
                </h2>
                <ul className="mt-4 space-y-3">
                  {CALL_POINTS.map((p) => (
                    <li key={p} className="flex gap-3 text-slate-700">
                      <svg
                        className="mt-1 h-4 w-4 flex-shrink-0 text-blue-800"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  Prefer email?{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="font-semibold text-blue-800 hover:text-blue-900"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <iframe
                    src={`${CALENDLY_URL}?hide_gdpr_banner=1`}
                    title="Book a call with Thrive Automation"
                    className="h-[680px] w-full"
                  />
                </div>
                <p className="mt-3 text-center text-sm text-slate-500">
                  Calendar not loading?{" "}
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-800 hover:text-blue-900"
                  >
                    Open Calendly directly →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

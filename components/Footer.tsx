import Link from "next/link";
import { CALENDLY_URL, CONTACT_EMAIL, ENGINES } from "@/lib/systems";

export default function Footer() {
  const half = Math.ceil(ENGINES.length / 2);
  const columns = [ENGINES.slice(0, half), ENGINES.slice(half)];

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-bold tracking-tight text-slate-900">
            Thrive<span className="text-blue-800"> Automation</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            We build intelligent operations systems — one dashboard, an AI brain,
            and automation engines configured to your business.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
          >
            Book a Call
          </a>
        </div>
        {columns.map((col, i) => (
          <div key={i}>
            {i === 0 && (
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Our Systems
              </h3>
            )}
            {i === 1 && <div className="mb-3 hidden text-xs md:block">&nbsp;</div>}
            <ul className="space-y-2">
              {col.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/systems#${e.slug}`}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {e.name}
                    {e.comingSoon && (
                      <span className="ml-2 text-[10px] font-semibold uppercase text-slate-400">
                        Coming Soon
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-slate-500 sm:px-8">
          <span>© {new Date().getFullYear()} Thrive Automation Agency</span>
          <div className="flex gap-5">
            <Link href="/contact" className="hover:text-slate-800">
              Contact
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-slate-800">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

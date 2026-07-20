"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CALENDLY_URL, ENGINES } from "@/lib/systems";

export default function Nav() {
  const [systemsOpen, setSystemsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSystemsOpen, setMobileSystemsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSystemsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function closeAll() {
    setSystemsOpen(false);
    setMobileOpen(false);
    setMobileSystemsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" onClick={closeAll} className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <Image src="/logo.png" alt="Thrive Automation logo" width={36} height={36} className="h-9 w-9" />
          Thrive<span className="text-violet-600"> Automation</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSystemsOpen((o) => !o)}
              aria-expanded={systemsOpen}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Our Systems
              <svg
                className={`h-4 w-4 transition-transform ${systemsOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {systemsOpen && (
              <div className="absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                <Link
                  href="/systems"
                  onClick={closeAll}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-violet-600 hover:bg-slate-50"
                >
                  All Systems →
                </Link>
                <div className="my-1 border-t border-slate-100" />
                {ENGINES.map((e) => (
                  <Link
                    key={e.slug}
                    href={`/systems#${e.slug}`}
                    onClick={closeAll}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {e.name}
                    {e.comingSoon && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Coming Soon
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/#how-it-works" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            How It Works
          </Link>
          <Link href="/contact" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Contact
          </Link>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600"
          >
            Book a Call
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="p-2 text-slate-700 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 pb-6 pt-2 md:hidden">
          <button
            onClick={() => setMobileSystemsOpen((o) => !o)}
            aria-expanded={mobileSystemsOpen}
            className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-slate-800"
          >
            Our Systems
            <svg
              className={`h-4 w-4 transition-transform ${mobileSystemsOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {mobileSystemsOpen && (
            <div className="mb-2 border-l border-slate-200 pl-4">
              <Link href="/systems" onClick={closeAll} className="block py-2 text-sm font-semibold text-violet-600">
                All Systems →
              </Link>
              {ENGINES.map((e) => (
                <Link
                  key={e.slug}
                  href={`/systems#${e.slug}`}
                  onClick={closeAll}
                  className="block py-2 text-sm text-slate-600"
                >
                  {e.name}
                  {e.comingSoon && <span className="ml-2 text-[10px] font-semibold uppercase text-slate-400">Coming Soon</span>}
                </Link>
              ))}
            </div>
          )}
          <Link href="/#how-it-works" onClick={closeAll} className="block py-3 text-sm font-medium text-slate-800">
            How It Works
          </Link>
          <Link href="/contact" onClick={closeAll} className="block py-3 text-sm font-medium text-slate-800">
            Contact
          </Link>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Book a Call
          </a>
        </div>
      )}
    </header>
  );
}

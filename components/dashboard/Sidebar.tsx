"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard/demo/today", label: "Today" },
  { href: "/dashboard/demo", label: "Overview" },
  { href: "/dashboard/demo/inbox", label: "Inbox" },
  { href: "/dashboard/demo/pipeline", label: "Pipeline" },
  { href: "/dashboard/demo/calendar", label: "Calendar" },
  { href: "/dashboard/demo/customers", label: "Customers" },
  { href: "/dashboard/demo/library", label: "Library" },
  { href: "/dashboard/demo/reviews", label: "Reviews" },
  { href: "/dashboard/demo/money", label: "Money" },
  { href: "/dashboard/demo/analytics", label: "Analytics" },
  { href: "/dashboard/demo/brain", label: "The Brain" },
  { href: "/dashboard/demo/engines", label: "Engines" },
  { href: "/dashboard/demo/notifications", label: "Notifications" },
];

const BOTTOM_NAV_LINKS = [
  { href: "/dashboard/demo/settings", label: "Settings" },
  { href: "/dashboard/demo/setup", label: "Setup" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white md:h-screen md:w-60 md:flex-shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-4 md:block md:border-b md:border-slate-100 md:px-6 md:py-6">
        <Link href="/dashboard/demo" className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          <Image src="/logo.png" alt="Thrive Automation logo" width={28} height={28} className="h-7 w-7" />
          Thrive
        </Link>
        <span className="rounded bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600 md:mt-3 md:inline-block">
          Product Demo — Sample Data
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:gap-1 md:overflow-y-auto md:px-3 md:py-4">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} pathname={pathname} />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-100 px-3 py-3 md:px-3 md:py-4">
        {BOTTOM_NAV_LINKS.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} pathname={pathname} />
        ))}
        <Link
          href="/dashboard/login"
          className="w-full rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-3 py-2 text-center text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600"
        >
          Client Login
        </Link>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = href === "/dashboard/demo" ? pathname === "/dashboard/demo" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

// Per-client config layer. `companies.config` (jsonb) holds a CompanyConfig;
// this registry maps every possible portal section to its nav entry. A
// company's Sidebar — and the route guard in each page — is driven entirely
// by `enabled_sections`, so adding a client to a new vertical or picking a
// different subset of sections never requires a code change here, only a
// row update.
//
// Only the funeral_home vertical has real, working pages today (South
// Chicago Chapel is the first real client). The roofing vertical exists in
// the type so the shape doesn't need to change when a real roofing client
// signs on, but its sections aren't wired to real pages yet — see
// app/dashboard/(portal) for what's actually implemented.

export type Vertical = "funeral_home" | "roofing";

export type SectionKey =
  | "today"
  | "overview"
  | "library"
  | "families"
  | "calendar"
  | "inbox"
  | "reviews"
  | "money"
  | "notifications"
  | "settings";

export type NavSection = {
  key: SectionKey;
  label: string;
  href: string;
};

const SECTION_REGISTRY: Record<SectionKey, Omit<NavSection, "key">> = {
  today: { label: "Today", href: "/dashboard/today" },
  overview: { label: "Overview", href: "/dashboard" },
  library: { label: "Company Files", href: "/dashboard/library" },
  families: { label: "Families", href: "/dashboard/families" },
  calendar: { label: "Calendar", href: "/dashboard/calendar" },
  inbox: { label: "Inbox", href: "/dashboard/inbox" },
  reviews: { label: "Reviews", href: "/dashboard/reviews" },
  money: { label: "Money", href: "/dashboard/money" },
  notifications: { label: "Notifications", href: "/dashboard/notifications" },
  settings: { label: "Settings", href: "/dashboard/settings" },
};

const BOTTOM_SECTIONS: SectionKey[] = ["settings"];

export type CompanyConfig = {
  vertical: Vertical;
  enabled_sections: SectionKey[];
  labels?: Partial<Record<string, string>>;
};

export const FUNERAL_HOME_DEFAULT_CONFIG: CompanyConfig = {
  vertical: "funeral_home",
  enabled_sections: [
    "today",
    "overview",
    "library",
    "families",
    "calendar",
    "inbox",
    "reviews",
    "money",
    "notifications",
    "settings",
  ],
};

export function isSectionEnabled(config: CompanyConfig, key: SectionKey): boolean {
  return config.enabled_sections.includes(key);
}

export function getNavSections(config: CompanyConfig): { top: NavSection[]; bottom: NavSection[] } {
  const enabled = config.enabled_sections
    .filter((key) => key in SECTION_REGISTRY)
    .map((key) => ({ key, ...SECTION_REGISTRY[key] }));

  return {
    top: enabled.filter((s) => !BOTTOM_SECTIONS.includes(s.key)),
    bottom: enabled.filter((s) => BOTTOM_SECTIONS.includes(s.key)),
  };
}

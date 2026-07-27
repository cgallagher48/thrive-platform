import Link from "next/link";
import NotificationSettings from "@/components/portal/funeral/NotificationSettings";
import { requireSection } from "@/lib/portal/guard";

// Client-facing labels only — no vendor names, no env var names anywhere in
// what renders. The underlying env-var checks are unchanged; only the label
// shown to the client differs from the internal service each one wires to:
//   Document Scanning   -> Anthropic (document extraction)
//   Email & Calendar     -> Google Workspace (Gmail inbox, Calendar)
//   Reviews               -> Google Business Profile (Reviews sync)
//   Text Messaging        -> Twilio (SMS in Inbox)
const CONNECTIONS = [
  {
    label: "Document Scanning",
    connected: Boolean(process.env.ANTHROPIC_API_KEY),
  },
  {
    label: "Email & Calendar",
    connected: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI),
  },
  {
    label: "Reviews",
    connected: Boolean(process.env.GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID),
  },
  {
    label: "Text Messaging",
    connected: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
  },
];

export default async function SettingsPage() {
  await requireSection("settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Portal preferences, account, and connection status.</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Account</h2>
            <p className="mt-1 text-xs text-slate-500">Change your password or sign-in details.</p>
          </div>
          <Link
            href="/dashboard/settings/account"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Manage account →
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Connections</h2>
        <p className="mt-1 text-xs text-slate-500">Services powering your portal.</p>
        <div className="mt-4 space-y-3">
          {CONNECTIONS.map((c) => (
            <div key={c.label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
              <p className="text-sm font-medium text-slate-900">{c.label}</p>
              <span
                className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  c.connected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {c.connected ? "Active" : "Not set up yet"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Notifications</h2>
        <p className="mt-1 text-xs text-slate-500">Choose what shows up in your Notifications feed.</p>
        <div className="mt-4">
          <NotificationSettings />
        </div>
      </section>
    </div>
  );
}

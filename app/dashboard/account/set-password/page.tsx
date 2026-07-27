import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import SetPasswordForm from "@/components/portal/SetPasswordForm";

// Reached when profiles.must_change_password is true (see the (portal)
// layout). proxy.ts already guarantees a valid session before this page is
// reachable — it's not in PUBLIC_PREFIXES.
export default function SetPasswordFirstLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
            <LogoMark size={36} />
            Thrive<span className="text-violet-600"> Automation</span>
          </Link>
        </div>

        <SetPasswordForm
          heading="Set your password"
          description="Choose a new password to finish setting up your account. You'll use this to sign in from now on."
          submitLabel="Continue"
        />
      </div>
    </main>
  );
}

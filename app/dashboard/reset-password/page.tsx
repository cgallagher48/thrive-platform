import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import SetPasswordForm from "@/components/portal/SetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
            <LogoMark size={36} />
            Thrive<span className="text-violet-600"> Automation</span>
          </Link>
        </div>

        {claims ? (
          <SetPasswordForm
            heading="Set a new password"
            description="Choose a new password for your account."
            submitLabel="Update password"
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Link expired</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This password reset link is no longer valid. Request a new one to continue.
            </p>
            <Link
              href="/dashboard/forgot-password"
              className="mt-5 inline-block rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

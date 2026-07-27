import Link from "next/link";
import { redirect } from "next/navigation";
import SetPasswordForm from "@/components/portal/SetPasswordForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/dashboard/login");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          ← Settings
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">Signed in as {user.email}.</p>
      </div>

      <div className="max-w-sm">
        <SetPasswordForm
          heading="Change password"
          description="Choose a new password. You'll stay signed in after this."
          submitLabel="Update password"
        />
      </div>
    </div>
  );
}

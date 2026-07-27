"use server";

import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = { sent: boolean; error: string | null };

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { sent: false, error: "Enter your email address." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // This becomes {{ .RedirectTo }} in the Supabase "Reset Password" email
  // template, which must be set to:
  //   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}
  // (a one-time dashboard edit — see the deployment checklist).
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/dashboard/reset-password`,
  });

  // Always report success, whether or not the email has an account —
  // otherwise this endpoint becomes a way to enumerate client emails.
  return { sent: true, error: null };
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SetPasswordState = { error: string | null };

// Shared by both entry points that end in "the user sets a password while
// already holding a valid session": /dashboard/reset-password (reached via
// the emailed recovery link, through /auth/confirm) and
// /dashboard/account/set-password (the forced first-login change). Same
// operation either way — set the password, clear must_change_password,
// send them into the real portal.
export async function setNewPassword(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) {
    return { error: "Your session has expired. Request a new reset link and try again." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("profiles").update({ must_change_password: false }).eq("id", userId);

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}

import { notFound, redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import { isSectionEnabled, type SectionKey } from "@/lib/portal/config";

// Every real-portal page calls this with its own section key. Hiding a nav
// link is not access control — this is: a company without "library" enabled
// gets a 404 on /dashboard/library even if they type the URL directly.
export async function requireSection(key: SectionKey): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/dashboard/login");
  if (!isSectionEnabled(user.company.config, key)) notFound();
  return user;
}

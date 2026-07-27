import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CompanyConfig } from "@/lib/portal/config";

export type CurrentUser = {
  userId: string;
  email: string;
  fullName: string | null;
  role: "owner" | "staff";
  mustChangePassword: boolean;
  company: {
    id: string;
    name: string;
    slug: string;
    vertical: CompanyConfig["vertical"];
    config: CompanyConfig;
  };
};

type ProfileRow = {
  company_id: string;
  role: "owner" | "staff";
  must_change_password: boolean;
  full_name: string | null;
  companies: {
    id: string;
    name: string;
    slug: string;
    vertical: CompanyConfig["vertical"];
    config: CompanyConfig;
  } | null;
};

// One DB round trip per request, shared by the (portal) layout and every
// page under it via React's request-scoped cache() — not a global cache, so
// there's no risk of one request seeing another user's cached profile.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (claimsError || !userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("company_id, role, must_change_password, full_name, companies(id, name, slug, vertical, config)")
    .eq("id", userId)
    .single<ProfileRow>();

  if (error || !data || !data.companies) return null;

  return {
    userId,
    email: (claimsData!.claims.email as string | undefined) ?? "",
    fullName: data.full_name,
    role: data.role,
    mustChangePassword: data.must_change_password,
    company: {
      id: data.companies.id,
      name: data.companies.name,
      slug: data.companies.slug,
      vertical: data.companies.vertical,
      config: data.companies.config,
    },
  };
});

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Session-bound client for Server Components, Server Actions, and Route
// Handlers. Reads/writes the user's own auth cookies, so every query made
// through this client is subject to Postgres RLS as *that* user — this is
// what makes RLS the real tenant boundary instead of application code.
//
// Never use the service-role key here. That client (lib/supabase/admin.ts)
// bypasses RLS entirely and must only ever run in the account-provisioning
// script, never on a path that serves a signed-in user's request.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, which can't set cookies.
            // proxy.ts's session refresh covers this — see lib/supabase/proxy.ts.
          }
        },
      },
    }
  );
}

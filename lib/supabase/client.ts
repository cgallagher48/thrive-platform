import { createBrowserClient } from "@supabase/ssr";

// Browser client — only for client components that need live auth state
// (e.g. reacting to sign-out). Most auth mutations go through Server Actions
// using lib/supabase/server.ts instead.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

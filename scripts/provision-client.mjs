#!/usr/bin/env node
// Admin-only account provisioning. Uses the Supabase service-role key —
// this is the ONE place in the whole codebase that key is allowed to be
// used, and it must never run anywhere the browser or a request handler
// could reach it. Run by hand:
//
//   node --env-file=.env.local scripts/provision-client.mjs \
//     --company-name "South Chicago Chapel" \
//     --company-slug south-chicago-chapel \
//     --vertical funeral_home \
//     --email owner@example.com \
//     --full-name "Jane Owner"
//
// To add a second user to an existing company instead of creating a new
// one, pass --company-id <uuid> in place of --company-name/--slug/--vertical.
//
// Mirrors lib/portal/config.ts's FUNERAL_HOME_DEFAULT_CONFIG — this script
// runs outside the Next.js/TypeScript build, so the default is duplicated
// here rather than imported. Keep the two in sync if the section list changes.

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const FUNERAL_HOME_DEFAULT_CONFIG = {
  vertical: "funeral_home",
  enabled_sections: [
    "today",
    "overview",
    "library",
    "families",
    "calendar",
    "inbox",
    "reviews",
    "money",
    "notifications",
    "settings",
  ],
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = value;
    }
  }
  return args;
}

function generateTempPassword() {
  // 20 chars, URL-safe alphabet — strong enough for a one-time temp
  // password that's immediately replaced by the forced first-login flow.
  return randomBytes(15).toString("base64url");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    console.error("Run with: node --env-file=.env.local scripts/provision-client.mjs ...");
    process.exit(1);
  }
  if (!args.email) {
    console.error("Usage: --email is required. See the header of this file for the full example.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let companyId = args["company-id"];

  if (!companyId) {
    if (!args["company-name"] || !args["company-slug"] || !args.vertical) {
      console.error("Creating a new company requires --company-name, --company-slug, and --vertical.");
      process.exit(1);
    }
    if (args.vertical !== "funeral_home") {
      console.error(
        `Vertical "${args.vertical}" has no default config wired up yet — only funeral_home has real pages today. Add a config default before provisioning this vertical.`
      );
      process.exit(1);
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: args["company-name"],
        slug: args["company-slug"],
        vertical: args.vertical,
        config: FUNERAL_HOME_DEFAULT_CONFIG,
      })
      .select("id")
      .single();

    if (companyError) {
      console.error(`Failed to create company: ${companyError.message}`);
      process.exit(1);
    }
    companyId = company.id;
    console.log(`Created company "${args["company-name"]}" (${companyId})`);
  }

  const tempPassword = args.password ?? generateTempPassword();

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: args.email,
    password: tempPassword,
    email_confirm: true, // an admin is vouching for this account directly
    user_metadata: {
      company_id: companyId,
      full_name: args["full-name"] ?? null,
    },
  });

  if (userError) {
    console.error(`Failed to create user: ${userError.message}`);
    process.exit(1);
  }

  console.log("\nAccount created.");
  console.log(`  Email:      ${args.email}`);
  console.log(`  Company ID: ${companyId}`);
  console.log(`  User ID:    ${userData.user.id}`);
  console.log(`  Temp password: ${tempPassword}`);
  console.log(
    "\nRelay the temp password to the client over a secure channel (not this terminal's scrollback/history)."
  );
  console.log("They'll be required to set their own password on first sign-in.");
}

main();

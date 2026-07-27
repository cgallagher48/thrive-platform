"use client";

import { useActionState } from "react";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function DashboardLoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
            <LogoMark size={36} />
            Thrive<span className="text-violet-600"> Automation</span>
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Client Portal</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Sign in with the email and password we set up for you.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="you@yourbusiness.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link href="/dashboard/forgot-password" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="Enter password"
              />
            </div>

            {state.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600 disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Just curious what this looks like?{" "}
          <Link href="/dashboard/demo" className="font-semibold text-violet-600 hover:text-violet-700">
            Try the demo →
          </Link>
        </p>
      </div>
    </main>
  );
}

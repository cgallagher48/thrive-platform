"use client";

import { useActionState } from "react";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = { sent: false, error: null };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

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
          {state.sent ? (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Check your email</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                If an account exists for that email, we&apos;ve sent a link to reset your password. It expires soon,
                so use it before requesting another.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Reset your password</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Enter your email and we&apos;ll send you a link to set a new password.
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

                {state.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600 disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/dashboard/login" className="font-semibold text-violet-600 hover:text-violet-700">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { setNewPassword, type SetPasswordState } from "@/lib/auth/actions";

const initialState: SetPasswordState = { error: null };

export default function SetPasswordForm({
  heading,
  description,
  submitLabel = "Set password",
}: {
  heading: string;
  description: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(setNewPassword, initialState);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">{heading}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            autoFocus
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            placeholder="Re-enter your new password"
          />
        </div>

        {state.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-600 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </form>
    </div>
  );
}

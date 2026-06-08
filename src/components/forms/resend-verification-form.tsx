"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/validators";
import { resendVerificationEmailAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

export function ResendVerificationForm() {
  const [state, formAction, pending] = useActionState(
    resendVerificationEmailAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 grid gap-3">
      {state.message ? (
        <div
          className={
            state.success
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          }
        >
          {state.message}
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        Email cadastrado
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FieldError errors={state.errors?.email} />
      </label>
      <Button variant="outline" disabled={pending} type="submit">
        <Send className="size-4" />
        {pending ? "Reenviando..." : "Reenviar verificacao"}
      </Button>
    </form>
  );
}

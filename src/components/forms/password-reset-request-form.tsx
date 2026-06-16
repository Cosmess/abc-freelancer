"use client";

import { useActionState } from "react";
import { MailCheck, Send } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/validators";
import { requestPasswordResetAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

export function PasswordResetRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {state.message ? (
        <div
          className={[
            "rounded-lg border px-3 py-2.5 text-sm",
            state.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          ].join(" ")}
        >
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium">
        Email cadastrado
        <input
          className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FieldError errors={state.errors?.email} />
      </label>

      <Button className="h-11 w-full sm:h-10" disabled={pending || state.success} type="submit">
        {state.success ? (
          <>
            <MailCheck className="size-4" />
            Link enviado
          </>
        ) : (
          <>
            <Send className="size-4" />
            {pending ? "Enviando..." : "Enviar link de recuperacao"}
          </>
        )}
      </Button>
    </form>
  );
}

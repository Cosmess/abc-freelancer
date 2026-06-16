"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Check, KeyRound } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/validators";
import { updatePasswordAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

export function UpdatePasswordForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (!state.success) return;

    const timeoutId = window.setTimeout(() => {
      router.replace("/login");
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [router, state.success]);

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
        Nova senha
        <input
          className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError errors={state.errors?.password} />
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Confirmar nova senha
        <input
          className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError errors={state.errors?.confirmPassword} />
      </label>

      <Button className="h-11 w-full sm:h-10" disabled={pending || state.success} type="submit">
        {state.success ? (
          <>
            <Check className="size-4" />
            Senha atualizada
          </>
        ) : (
          <>
            <KeyRound className="size-4" />
            {pending ? "Salvando..." : "Salvar nova senha"}
          </>
        )}
      </Button>
    </form>
  );
}

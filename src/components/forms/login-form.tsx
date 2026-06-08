"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/validators";
import { loginAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {state.message ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FieldError errors={state.errors?.email} />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Senha
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <FieldError errors={state.errors?.password} />
      </label>

      <Button className="h-10" disabled={pending} type="submit">
        <LogIn className="size-4" />
        {pending ? "Entrando..." : "Entrar"}
      </Button>

      <div className="flex justify-between gap-3 text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/cadastro/freelancer">
          Sou freelancer
        </Link>
        <Link className="hover:text-foreground" href="/cadastro/estabelecimento">
          Tenho estabelecimento
        </Link>
      </div>
    </form>
  );
}

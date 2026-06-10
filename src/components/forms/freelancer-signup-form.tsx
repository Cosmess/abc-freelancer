"use client";

import Link from "next/link";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/validators";
import { signupFreelancerAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

export function FreelancerSignupForm() {
  const [state, formAction, pending] = useActionState(
    signupFreelancerAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:gap-5">
      {state.message ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive sm:px-4 sm:py-2.5 sm:text-sm">
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
        Nome completo
        <input
          className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
          name="fullName"
          autoComplete="name"
          required
        />
        <FieldError errors={state.errors?.fullName} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Email
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError errors={state.errors?.email} />
        </label>
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Senha
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError errors={state.errors?.password} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Telefone
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="phone"
            inputMode="tel"
          />
          <FieldError errors={state.errors?.phone} />
        </label>
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Cidade
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="city"
            required
          />
          <FieldError errors={state.errors?.city} />
        </label>
      </div>

      <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
        Bairro
        <input
          className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
          name="neighborhood"
        />
        <FieldError errors={state.errors?.neighborhood} />
      </label>

      <div className="grid gap-2">
        <label className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3 cursor-pointer sm:p-3.5">
          <input
            type="checkbox"
            name="termsAccepted"
            value="true"
            className="mt-0.5 size-4 shrink-0 accent-primary"
            required
          />
          <span className="text-sm leading-5 text-muted-foreground">
            Li e aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Termos de Uso e Politica de Privacidade
            </Link>
            , incluindo o tratamento dos meus dados conforme a LGPD.
          </span>
        </label>
        <FieldError errors={state.errors?.termsAccepted} />
      </div>

      <Button className="h-11 w-full sm:h-10" disabled={pending} type="submit">
        <UserPlus className="size-4" />
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}

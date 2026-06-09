"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Building2 } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/validators";
import { signupEstablishmentAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

export function EstablishmentSignupForm() {
  const [state, formAction, pending] = useActionState(
    signupEstablishmentAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {state.message ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium">
        Nome do responsavel
        <input
          className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
          name="responsibleName"
          autoComplete="name"
          required
        />
        <FieldError errors={state.errors?.responsibleName} />
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Nome do estabelecimento
        <input
          className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
          name="tradeName"
          required
        />
        <FieldError errors={state.errors?.tradeName} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Email
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError errors={state.errors?.email} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Senha
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError errors={state.errors?.password} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Telefone
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="phone"
            inputMode="tel"
          />
          <FieldError errors={state.errors?.phone} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          WhatsApp
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="whatsapp"
            inputMode="tel"
          />
          <FieldError errors={state.errors?.whatsapp} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Cidade
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="city"
            required
          />
          <FieldError errors={state.errors?.city} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Bairro
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="neighborhood"
          />
          <FieldError errors={state.errors?.neighborhood} />
        </label>
      </div>

      <div className="grid gap-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="termsAccepted"
            value="true"
            className="mt-0.5 size-4 shrink-0 accent-primary"
            required
          />
          <span className="text-sm text-muted-foreground leading-5">
            Li e aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Termos de Uso e Politica de Privacidade
            </Link>
            , incluindo o tratamento dos dados do estabelecimento conforme a LGPD.
          </span>
        </label>
        <FieldError errors={state.errors?.termsAccepted} />
      </div>

      <Button className="h-11 w-full sm:h-10" disabled={pending} type="submit">
        <Building2 className="size-4" />
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}

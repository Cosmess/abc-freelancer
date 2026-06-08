"use client";

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
    <form action={formAction} className="grid gap-4">
      {state.message ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-medium">
        Nome completo
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          name="fullName"
          autoComplete="name"
          required
        />
        <FieldError errors={state.errors?.fullName} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
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
            autoComplete="new-password"
            required
          />
          <FieldError errors={state.errors?.password} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Telefone
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            name="phone"
            inputMode="tel"
          />
          <FieldError errors={state.errors?.phone} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          WhatsApp
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            name="whatsapp"
            inputMode="tel"
          />
          <FieldError errors={state.errors?.whatsapp} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          CPF
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            name="cpf"
            inputMode="numeric"
          />
          <FieldError errors={state.errors?.cpf} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Cidade
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            name="city"
            required
          />
          <FieldError errors={state.errors?.city} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Bairro
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            name="neighborhood"
          />
          <FieldError errors={state.errors?.neighborhood} />
        </label>
      </div>

      <Button className="h-10" disabled={pending} type="submit">
        <UserPlus className="size-4" />
        {pending ? "Criando..." : "Criar conta"}
      </Button>
    </form>
  );
}

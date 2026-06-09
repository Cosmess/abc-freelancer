"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn, MailCheck, RefreshCw, Send } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/lib/auth/validators";
import { loginAction, resendVerificationEmailAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initialState);
  const [resendState, resendFormAction, resendPending] = useActionState(
    resendVerificationEmailAction,
    initialState,
  );

  return (
    <div className="grid gap-4">
      {/* ── Login form ── */}
      <form action={loginFormAction} className="grid gap-4">
        {loginState.message && !loginState.emailNotVerified ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {loginState.message}
          </div>
        ) : null}

        <label className="grid gap-1.5 text-sm font-medium">
          Email
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError errors={loginState.errors?.email} />
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Senha
          <input
            className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <FieldError errors={loginState.errors?.password} />
        </label>

        <Button className="h-11 w-full sm:h-10" disabled={loginPending} type="submit">
          <LogIn className="size-4" />
          {loginPending ? "Entrando..." : "Entrar"}
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

      {/* ── Email not verified — inline resend block ── */}
      {loginState.emailNotVerified ? (
        <div className="grid gap-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-primary">
                Email ainda nao verificado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {loginState.message}
              </p>
            </div>
          </div>

          {/* Resend sub-form (separate form — not nested) */}
          <form action={resendFormAction} className="grid gap-3">
            {resendState.message ? (
              <div
                className={[
                  "rounded-lg border px-3 py-2.5 text-sm",
                  resendState.success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-destructive/30 bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {resendState.message}
              </div>
            ) : null}

            <label className="grid gap-1.5 text-sm font-medium">
              Email cadastrado
              <input
                className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={loginState.email ?? ""}
                required
              />
              <FieldError errors={resendState.errors?.email} />
            </label>

            <Button
              variant="outline"
              disabled={resendPending || resendState.success}
              type="submit"
              className="w-full"
            >
              {resendPending ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Reenviando...
                </>
              ) : resendState.success ? (
                <>
                  <MailCheck className="size-4" />
                  Email reenviado com sucesso
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Reenviar link de verificacao
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Verifique tambem a pasta de spam. O link expira em 24 horas.
            </p>
          </form>
        </div>
      ) : null}
    </div>
  );
}

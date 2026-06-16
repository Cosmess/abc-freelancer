"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { Building2 } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import {
  validateSignupField,
  validateSignupValues,
  type SignupFieldErrors,
} from "@/components/forms/signup-form-validation";
import { Button } from "@/components/ui/button";
import {
  establishmentSignupSchema,
  type AuthActionState,
} from "@/lib/auth/validators";
import { signupEstablishmentAction } from "@/server/actions/auth";

const initialState: AuthActionState = {};

type EstablishmentSignupValues = {
  responsibleName: string;
  tradeName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  neighborhood: string;
  termsAccepted?: "true";
};

const initialValues: EstablishmentSignupValues = {
  responsibleName: "",
  tradeName: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  neighborhood: "",
  termsAccepted: undefined,
};

export function EstablishmentSignupForm() {
  const [state, formAction, pending] = useActionState(
    signupEstablishmentAction,
    initialState,
  );
  const [values, setValues] =
    useState<EstablishmentSignupValues>(initialValues);
  const [clientErrors, setClientErrors] =
    useState<SignupFieldErrors<EstablishmentSignupValues>>({});
  const [hiddenServerErrorFields, setHiddenServerErrorFields] =
    useState<Partial<Record<keyof EstablishmentSignupValues, true>>>({});

  function updateField<Field extends keyof EstablishmentSignupValues>(
    field: Field,
    value: EstablishmentSignupValues[Field],
  ) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setHiddenServerErrorFields((current) => ({ ...current, [field]: true }));

    if (clientErrors[field]?.length) {
      setClientErrors((current) => ({
        ...current,
        [field]: validateSignupField(
          establishmentSignupSchema,
          nextValues,
          field,
        ),
      }));
    }
  }

  function validateField(field: keyof EstablishmentSignupValues) {
    setClientErrors((current) => ({
      ...current,
      [field]: validateSignupField(establishmentSignupSchema, values, field),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const nextErrors = validateSignupValues(establishmentSignupSchema, values);
    setClientErrors(nextErrors);

    if (Object.values(nextErrors).some((errors) => errors?.length)) {
      event.preventDefault();
      return;
    }

    setHiddenServerErrorFields({});
  }

  function getFieldErrors(field: keyof EstablishmentSignupValues) {
    return (
      clientErrors[field] ??
      (hiddenServerErrorFields[field] ? undefined : state.errors?.[field])
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-4 sm:gap-5"
      noValidate
      onSubmit={handleSubmit}
    >
      {state.message ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-5 text-destructive sm:px-4 sm:py-2.5 sm:text-sm">
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
        Nome do responsavel
        <input
          className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
          name="responsibleName"
          autoComplete="name"
          value={values.responsibleName}
          onBlur={() => validateField("responsibleName")}
          onChange={(event) =>
            updateField("responsibleName", event.target.value)
          }
        />
        <FieldError errors={getFieldErrors("responsibleName")} />
      </label>

      <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
        Nome do estabelecimento
        <input
          className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
          name="tradeName"
          value={values.tradeName}
          onBlur={() => validateField("tradeName")}
          onChange={(event) => updateField("tradeName", event.target.value)}
        />
        <FieldError errors={getFieldErrors("tradeName")} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Email
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onBlur={() => validateField("email")}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <FieldError errors={getFieldErrors("email")} />
        </label>
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Senha
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onBlur={() => validateField("password")}
            onChange={(event) => updateField("password", event.target.value)}
          />
          <FieldError errors={getFieldErrors("password")} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Telefone
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="phone"
            inputMode="tel"
            value={values.phone}
            onBlur={() => validateField("phone")}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          <FieldError errors={getFieldErrors("phone")} />
        </label>
        <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          Cidade
          <input
            className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
            name="city"
            value={values.city}
            onBlur={() => validateField("city")}
            onChange={(event) => updateField("city", event.target.value)}
          />
          <FieldError errors={getFieldErrors("city")} />
        </label>
      </div>

      <label className="grid gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
        Bairro
        <input
          className="h-11 rounded-md border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10"
          name="neighborhood"
          value={values.neighborhood}
          onBlur={() => validateField("neighborhood")}
          onChange={(event) => updateField("neighborhood", event.target.value)}
        />
        <FieldError errors={getFieldErrors("neighborhood")} />
      </label>

      <div className="grid gap-2">
        <label className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3 cursor-pointer sm:p-3.5">
          <input
            type="checkbox"
            name="termsAccepted"
            value="true"
            className="mt-0.5 size-4 shrink-0 accent-primary"
            checked={values.termsAccepted === "true"}
            onBlur={() => validateField("termsAccepted")}
            onChange={(event) =>
              updateField(
                "termsAccepted",
                event.target.checked ? "true" : undefined,
              )
            }
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
            , incluindo o tratamento dos dados do estabelecimento conforme a LGPD.
          </span>
        </label>
        <FieldError errors={getFieldErrors("termsAccepted")} />
      </div>

      <Button className="h-11 w-full sm:h-10" disabled={pending} type="submit">
        <Building2 className="size-4" />
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}

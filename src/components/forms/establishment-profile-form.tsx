"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { fillAddressFromCep } from "@/lib/address/cep-lookup";
import type { InternalUser } from "@/lib/auth/internal-user-store";
import type { EstablishmentProfile } from "@/lib/profiles/profile-store";
import type { ProfileActionState } from "@/lib/profiles/validators";
import { updateEstablishmentProfileAction } from "@/server/actions/profile";

const initialState: ProfileActionState = {};

type Props = {
  user: InternalUser;
  profile: EstablishmentProfile | null;
};

export function EstablishmentProfileForm({ user, profile }: Props) {
  const [state, formAction, pending] = useActionState(
    updateEstablishmentProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-md border bg-background p-5 shadow-sm">
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

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField label="Responsavel" name="responsibleName" value={user.name} required error={state.errors?.responsibleName} />
        <ProfileField label="Telefone" name="phone" value={user.phone ?? ""} error={state.errors?.phone} />
        <ProfileField label="Nome fantasia" name="tradeName" value={profile?.tradeName ?? ""} required error={state.errors?.tradeName} />
        <ProfileField label="Razao social" name="legalName" value={profile?.legalName ?? ""} error={state.errors?.legalName} />
        <ProfileField label="CNPJ" name="cnpj" value={profile?.cnpj ?? ""} required error={state.errors?.cnpj} />
        <ProfileField label="Tipo" name="type" value={profile?.type ?? ""} error={state.errors?.type} />
        <ProfileField label="Email de contato" name="email" type="email" value={profile?.email ?? user.email} error={state.errors?.email} />
        <ProfileField label="WhatsApp" name="whatsapp" value={profile?.whatsapp ?? ""} error={state.errors?.whatsapp} />
        <ProfileField label="CEP" name="cep" value={profile?.cep ?? ""} error={state.errors?.cep} lookupCep />
        <ProfileField label="UF" name="state" value={profile?.state ?? ""} error={state.errors?.state} />
        <ProfileField label="Cidade" name="city" value={profile?.city ?? ""} error={state.errors?.city} />
        <ProfileField label="Bairro" name="neighborhood" value={profile?.neighborhood ?? ""} error={state.errors?.neighborhood} />
        <ProfileField label="Rua" name="street" value={profile?.street ?? ""} error={state.errors?.street} />
        <ProfileField label="Numero" name="number" value={profile?.number ?? ""} error={state.errors?.number} />
        <ProfileField label="Complemento" name="complement" value={profile?.complement ?? ""} error={state.errors?.complement} />
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Descricao
        <textarea className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="description" defaultValue={profile?.description ?? ""} />
        <FieldError errors={state.errors?.description} />
      </label>

      <Button className="w-fit" disabled={pending} type="submit">
        <Save className="size-4" />
        {pending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}

function ProfileField({
  label,
  name,
  value,
  error,
  type = "text",
  required = false,
  lookupCep = false,
}: {
  label: string;
  name: string;
  value: string;
  error?: string[];
  type?: string;
  required?: boolean;
  lookupCep?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        onBlur={(event) => {
          if (lookupCep) {
            void fillAddressFromCep(event.currentTarget.form!, event.currentTarget.value);
          }
        }}
      />
      <FieldError errors={error} />
    </label>
  );
}

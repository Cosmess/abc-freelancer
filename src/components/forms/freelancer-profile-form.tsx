"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { InternalUser } from "@/lib/auth/internal-user-store";
import type { FreelancerProfile } from "@/lib/profiles/profile-store";
import type { ProfileActionState } from "@/lib/profiles/validators";
import { updateFreelancerProfileAction } from "@/server/actions/profile";

const initialState: ProfileActionState = {};

type Props = {
  user: InternalUser;
  profile: FreelancerProfile | null;
};

export function FreelancerProfileForm({ user, profile }: Props) {
  const [state, formAction, pending] = useActionState(
    updateFreelancerProfileAction,
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
        <ProfileField label="Nome completo" name="fullName" value={profile?.fullName ?? user.name} required error={state.errors?.fullName} />
        <ProfileField label="Telefone" name="phone" value={user.phone ?? ""} error={state.errors?.phone} />
        <ProfileField label="Email de contato" name="email" type="email" value={profile?.email ?? user.email} error={state.errors?.email} />
        <ProfileField label="WhatsApp" name="whatsapp" value={profile?.whatsapp ?? ""} error={state.errors?.whatsapp} />
        <ProfileField label="CPF" name="cpf" value={profile?.cpf ?? ""} error={state.errors?.cpf} />
        <ProfileField label="Cidade" name="city" value={profile?.city ?? ""} error={state.errors?.city} />
        <ProfileField label="Bairro" name="neighborhood" value={profile?.neighborhood ?? ""} error={state.errors?.neighborhood} />
        <ProfileField label="Rua" name="street" value={profile?.street ?? ""} error={state.errors?.street} />
        <ProfileField label="CEP" name="cep" value={profile?.cep ?? ""} error={state.errors?.cep} />
        <ProfileField label="URL da foto" name="profilePhotoUrl" value={profile?.profilePhotoUrl ?? ""} error={state.errors?.profilePhotoUrl} />
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Bio
        <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="bio" defaultValue={profile?.bio ?? ""} />
        <FieldError errors={state.errors?.bio} />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Experiencia
        <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="experience" defaultValue={profile?.experience ?? ""} />
        <FieldError errors={state.errors?.experience} />
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
}: {
  label: string;
  name: string;
  value: string;
  error?: string[];
  type?: string;
  required?: boolean;
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
      />
      <FieldError errors={error} />
    </label>
  );
}

"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { ProfilePhotoInput } from "@/components/forms/profile-photo-input";
import { Button } from "@/components/ui/button";
import { fillAddressFromCep } from "@/lib/address/cep-lookup";
import type { InternalUser } from "@/lib/auth/internal-user-store";
import type { Availability, FreelancerProfile, Specialty } from "@/lib/profiles/profile-store";
import type { ProfileActionState } from "@/lib/profiles/validators";
import { updateFreelancerProfileAction } from "@/server/actions/profile";

const initialState: ProfileActionState = {};

type Props = {
  user: InternalUser;
  profile: FreelancerProfile | null;
  specialties: Specialty[];
  selectedSpecialtyIds: Set<string>;
  availability: Availability[];
};

const days = [
  ["MONDAY", "Segunda"],
  ["TUESDAY", "Terca"],
  ["WEDNESDAY", "Quarta"],
  ["THURSDAY", "Quinta"],
  ["FRIDAY", "Sexta"],
  ["SATURDAY", "Sabado"],
  ["SUNDAY", "Domingo"],
] as const;

const shifts = [
  ["madrugada", "Madrugada", "00:00-06:00"],
  ["manha", "Manha", "06:00-12:00"],
  ["tarde", "Tarde", "12:00-18:00"],
  ["noite", "Noite", "18:00-23:59"],
] as const;

function getShiftFromTime(startTime: string) {
  if (startTime === "00:00") return "madrugada";
  if (startTime === "06:00") return "manha";
  if (startTime === "12:00") return "tarde";
  return "noite";
}

export function FreelancerProfileForm({
  user,
  profile,
  specialties,
  selectedSpecialtyIds,
  availability,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateFreelancerProfileAction,
    initialState,
  );
  const selectedAvailability = new Set(
    availability.map((item) => `${item.dayOfWeek}:${getShiftFromTime(item.startTime)}`),
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
        <ProfileField label="CEP" name="cep" value={profile?.cep ?? ""} error={state.errors?.cep} lookupCep />
      </div>

      <ProfilePhotoInput currentUrl={profile?.profilePhotoUrl} />

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

      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-medium">Especialidades</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Marque as funcoes que voce pode assumir.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((specialty) => (
            <label key={specialty.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="specialtyIds"
                value={specialty.id}
                defaultChecked={selectedSpecialtyIds.has(specialty.id)}
              />
              <span>{specialty.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-medium">Dias e horarios de preferencia</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Use madrugada, manha, tarde e noite para indicar disponibilidade recorrente.
          </p>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Dia</th>
                {shifts.map(([, label]) => (
                  <th key={label} className="px-3 py-2 font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(([dayValue, dayLabel]) => (
                <tr key={dayValue} className="border-t">
                  <td className="px-3 py-2 text-muted-foreground">{dayLabel}</td>
                  {shifts.map(([shiftValue, , range]) => (
                    <td key={shiftValue} className="px-3 py-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="availability"
                          value={`${dayValue}:${shiftValue}`}
                          defaultChecked={selectedAvailability.has(`${dayValue}:${shiftValue}`)}
                        />
                        <span className="text-xs">{range}</span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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

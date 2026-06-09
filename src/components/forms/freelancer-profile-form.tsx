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
  ["madrugada", "Madrugada", "00:00–06:00"],
  ["manha", "Manha", "06:00–12:00"],
  ["tarde", "Tarde", "12:00–18:00"],
  ["noite", "Noite", "18:00–23:59"],
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
    <form action={formAction} className="grid gap-5 rounded-lg border bg-card p-4 shadow-sm sm:p-5">
      {state.message ? (
        <div
          className={
            state.success
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400"
              : "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileField label="Nome completo" name="fullName" value={profile?.fullName ?? user.name} required error={state.errors?.fullName} />
        <ProfileField label="Telefone" name="phone" value={user.phone ?? ""} error={state.errors?.phone} />
        <ProfileField label="Email de contato" name="email" type="email" value={profile?.email ?? user.email} error={state.errors?.email} />
        <ProfileField label="WhatsApp" name="whatsapp" value={profile?.whatsapp ?? ""} error={state.errors?.whatsapp} />
        <ProfileField label="Instagram (arroba)" name="instagram" value={profile?.instagram ?? ""} placeholder="@seuarroba" error={state.errors?.instagram} />
        <ProfileField label="Cidade" name="city" value={profile?.city ?? ""} error={state.errors?.city} />
        <ProfileField label="Bairro" name="neighborhood" value={profile?.neighborhood ?? ""} error={state.errors?.neighborhood} />
        <ProfileField label="Rua" name="street" value={profile?.street ?? ""} error={state.errors?.street} />
        <ProfileField label="CEP" name="cep" value={profile?.cep ?? ""} error={state.errors?.cep} lookupCep />
      </div>

      <ProfilePhotoInput currentUrl={profile?.profilePhotoUrl} />

      <label className="grid gap-2 text-sm font-medium">
        Bio
        <textarea
          className="min-h-24 rounded-md border bg-input px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:text-sm"
          name="bio"
          defaultValue={profile?.bio ?? ""}
        />
        <FieldError errors={state.errors?.bio} />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Experiencia
        <textarea
          className="min-h-24 rounded-md border bg-input px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:text-sm"
          name="experience"
          defaultValue={profile?.experience ?? ""}
        />
        <FieldError errors={state.errors?.experience} />
      </label>

      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-semibold">Especialidades</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Marque as funcoes que voce pode assumir.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((specialty) => (
            <label
              key={specialty.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm hover:bg-muted/50"
            >
              <input
                type="checkbox"
                name="specialtyIds"
                value={specialty.id}
                defaultChecked={selectedSpecialtyIds.has(specialty.id)}
                className="size-4 shrink-0 accent-primary"
              />
              <span>{specialty.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-semibold">Disponibilidade</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Marque os dias e turnos que voce costuma estar disponivel.
          </p>
        </div>
        <div className="grid gap-2">
          {days.map(([dayValue, dayLabel]) => (
            <div key={dayValue} className="rounded-lg border bg-muted/20 p-3">
              <p className="mb-2 text-sm font-medium">{dayLabel}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {shifts.map(([shiftValue, shiftLabel, range]) => (
                  <label
                    key={shiftValue}
                    className="flex cursor-pointer items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-2 text-xs hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      name="availability"
                      value={`${dayValue}:${shiftValue}`}
                      defaultChecked={selectedAvailability.has(`${dayValue}:${shiftValue}`)}
                      className="size-3.5 shrink-0 accent-primary"
                    />
                    <span className="flex flex-col leading-none">
                      <span className="font-medium">{shiftLabel}</span>
                      <span className="text-muted-foreground">{range}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Button className="w-full sm:w-fit" disabled={pending} type="submit">
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
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  error?: string[];
  type?: string;
  required?: boolean;
  lookupCep?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        className="h-11 rounded-md border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-10 sm:text-sm"
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        placeholder={placeholder}
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

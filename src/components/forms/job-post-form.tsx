"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import type { Specialty } from "@/lib/profiles/profile-store";
import type { ProfileActionState } from "@/lib/profiles/validators";
import { createJobPostAction } from "@/server/actions/jobs";

const initialState: ProfileActionState = {};

export function JobPostForm({ specialties }: { specialties: Specialty[] }) {
  const [state, formAction, pending] = useActionState(
    createJobPostAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-md border bg-background p-5 shadow-sm">
      {state.message ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <ProfileField label="Titulo" name="title" required error={state.errors?.title} />
      <label className="grid gap-2 text-sm font-medium">
        Especialidade
        <select className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="specialtyId" required>
          <option value="">Selecione</option>
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
        <FieldError errors={state.errors?.specialtyId} />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Descricao
        <textarea className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="description" />
        <FieldError errors={state.errors?.description} />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <ProfileField label="Cidade" name="city" required error={state.errors?.city} />
        <ProfileField label="Bairro" name="neighborhood" error={state.errors?.neighborhood} />
        <ProfileField label="CEP" name="cep" error={state.errors?.cep} />
        <ProfileField label="Rua" name="street" error={state.errors?.street} />
        <ProfileField label="Numero" name="number" error={state.errors?.number} />
        <ProfileField label="Data" name="workDate" type="date" required error={state.errors?.workDate} />
        <ProfileField label="Inicio" name="startTime" type="time" required error={state.errors?.startTime} />
        <ProfileField label="Fim" name="endTime" type="time" required error={state.errors?.endTime} />
        <ProfileField label="Quantidade" name="quantity" type="number" defaultValue="1" required error={state.errors?.quantity} />
        <ProfileField label="Valor em R$" name="paymentValue" type="number" step="0.01" required error={state.errors?.paymentValue} />
        <label className="grid gap-2 text-sm font-medium">
          Tipo de pagamento
          <select className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="paymentType" defaultValue="DAILY">
            <option value="DAILY">Diaria</option>
            <option value="HOURLY">Por hora</option>
            <option value="FIXED">Valor fechado</option>
          </select>
          <FieldError errors={state.errors?.paymentType} />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Requisitos
        <textarea className="min-h-20 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="requirements" />
        <FieldError errors={state.errors?.requirements} />
      </label>

      <Button className="w-fit" disabled={pending} type="submit">
        <Plus className="size-4" />
        {pending ? "Criando..." : "Criar vaga"}
      </Button>
    </form>
  );
}

function ProfileField({
  label,
  name,
  error,
  type = "text",
  required = false,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  error?: string[];
  type?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        step={step}
      />
      <FieldError errors={error} />
    </label>
  );
}

import Link from "next/link";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { EstablishmentSignupForm } from "@/components/forms/establishment-signup-form";

export default function EstablishmentSignupPage() {
  return (
    <AuthFormShell
      title="Cadastro de estabelecimento"
      description="Crie sua conta, confirme o email e comece a publicar vagas."
      footer={
        <>
          Ja tem conta?{" "}
          <Link className="font-medium text-foreground" href="/login">
            Entrar
          </Link>
        </>
      }
    >
      <EstablishmentSignupForm />
    </AuthFormShell>
  );
}

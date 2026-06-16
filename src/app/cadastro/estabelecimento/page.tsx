import Link from "next/link";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { EstablishmentSignupForm } from "@/components/forms/establishment-signup-form";
import { GoogleAuthButton } from "@/components/forms/google-auth-button";

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
      <GoogleAuthButton
        label="Cadastrar com Google como estabelecimento"
        next="/app/estabelecimento/perfil"
        role="ESTABLISHMENT"
      />
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou cadastre com email
        <span className="h-px flex-1 bg-border" />
      </div>
      <EstablishmentSignupForm />
    </AuthFormShell>
  );
}

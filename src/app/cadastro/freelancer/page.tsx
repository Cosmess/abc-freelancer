import Link from "next/link";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { FreelancerSignupForm } from "@/components/forms/freelancer-signup-form";
import { GoogleAuthButton } from "@/components/forms/google-auth-button";

export default function FreelancerSignupPage() {
  return (
    <AuthFormShell
      title="Cadastro de freelancer"
      description="Crie sua conta e confirme o email para acessar vagas do ABCD Paulista."
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
        label="Cadastrar com Google como freelancer"
        next="/app/freelancer/perfil"
        role="FREELANCER"
      />
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou cadastre com email
        <span className="h-px flex-1 bg-border" />
      </div>
      <FreelancerSignupForm />
    </AuthFormShell>
  );
}

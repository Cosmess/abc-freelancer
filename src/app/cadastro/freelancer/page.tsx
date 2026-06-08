import Link from "next/link";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { FreelancerSignupForm } from "@/components/forms/freelancer-signup-form";

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
      <FreelancerSignupForm />
    </AuthFormShell>
  );
}

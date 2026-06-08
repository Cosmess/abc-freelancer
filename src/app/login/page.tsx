import Link from "next/link";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <AuthFormShell
      title="Entrar"
      description="Acesse sua conta para gerenciar vagas, candidaturas e perfil."
      footer={
        <>
          Ainda nao tem conta?{" "}
          <Link className="font-medium text-foreground" href="/cadastro">
            Criar cadastro
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthFormShell>
  );
}

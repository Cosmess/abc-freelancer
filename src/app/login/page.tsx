import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { LoginForm } from "@/components/forms/login-form";
import { UserRole } from "@/generated/prisma/client";
import { getCurrentUser } from "@/server/guards/auth";

function getProfilePath(role: UserRole) {
  if (role === UserRole.ESTABLISHMENT) return "/app/estabelecimento/perfil";
  if (role === UserRole.ADMIN) return "/admin";

  return "/app/freelancer/perfil";
}

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user?.emailVerifiedAt) {
    redirect(getProfilePath(user.role));
  }

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

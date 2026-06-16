import Link from "next/link";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { PasswordResetRequestForm } from "@/components/forms/password-reset-request-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      title="Recuperar senha"
      description="Informe o email da sua conta para receber um link seguro de redefinicao de senha."
      footer={
        <>
          Lembrou a senha?{" "}
          <Link className="font-medium text-foreground" href="/login">
            Voltar para login
          </Link>
        </>
      }
    >
      <PasswordResetRequestForm />
    </AuthFormShell>
  );
}

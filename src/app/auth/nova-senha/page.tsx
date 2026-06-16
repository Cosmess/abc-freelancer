import Link from "next/link";

import { AuthFormShell } from "@/components/forms/auth-form-shell";
import { UpdatePasswordForm } from "@/components/forms/update-password-form";

export default function NewPasswordPage() {
  return (
    <AuthFormShell
      title="Nova senha"
      description="Crie uma nova senha para sua conta. Use pelo menos 10 caracteres, com letras e numeros."
      footer={
        <>
          Link expirado?{" "}
          <Link className="font-medium text-foreground" href="/auth/esqueci-senha">
            Enviar outro link
          </Link>
        </>
      }
    >
      <UpdatePasswordForm />
    </AuthFormShell>
  );
}

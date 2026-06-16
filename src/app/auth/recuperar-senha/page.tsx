import { AuthCallbackClient } from "@/components/auth/auth-callback-client";

export default function PasswordRecoveryCallbackPage() {
  return (
    <AuthCallbackClient
      defaultTarget="/auth/nova-senha"
      forceDefaultTarget
      title="Recuperando senha"
      message="Abrindo a tela para criar sua nova senha..."
    />
  );
}

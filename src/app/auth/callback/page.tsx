import { AuthCallbackClient } from "@/components/auth/auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <AuthCallbackClient
      defaultTarget="/app"
      message="Concluindo a confirmacao do email..."
    />
  );
}

import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ConfirmEmailPage() {
  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <section className="rounded-md border bg-background p-5 shadow-sm">
          <div className="mb-5 flex size-10 items-center justify-center rounded-md bg-muted">
            <MailCheck className="size-5" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-normal">
              Confirme seu email
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Enviamos um link de verificacao pelo Supabase. Abra o email,
              confirme sua conta e depois entre novamente.
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/login">Ir para login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Voltar ao inicio</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

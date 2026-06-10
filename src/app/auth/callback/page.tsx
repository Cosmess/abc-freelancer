"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function sanitizeNext(next: string | null): string {
  if (!next) return "";
  if (!next.startsWith("/") || next.startsWith("//")) return "";
  return next;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Validando seu acesso...");

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function finalize() {
      try {
        const url = new URL(window.location.href);
        const next = sanitizeNext(url.searchParams.get("next"));
        const code = url.searchParams.get("code");
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        setMessage("Concluindo a confirmacao do email...");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          url.searchParams.delete("code");
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          url.hash = "";
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          throw new Error("Sessao nao encontrada apos a confirmacao.");
        }

        if (cancelled) return;

        const target = next || "/app";
        window.history.replaceState(window.history.state, "", target);
        router.replace(target);
      } catch (error) {
        console.error("[auth/callback] Failed to finalize auth session:", error);
        if (!cancelled) {
          router.replace("/login?erro=confirmacao");
        }
      }
    }

    void finalize();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <section className="rounded-md border bg-background p-5 shadow-sm">
          <div className="mb-5 flex size-10 items-center justify-center rounded-md bg-muted">
            <MailCheck className="size-5" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-normal">Confirmando acesso</h1>
            <p className="text-sm leading-6 text-muted-foreground">{message}</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Aguarde...
          </div>
        </section>
      </div>
    </main>
  );
}

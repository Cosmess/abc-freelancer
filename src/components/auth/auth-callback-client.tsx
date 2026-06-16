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

function getTarget(
  url: URL,
  hashParams: URLSearchParams,
  defaultTarget: string,
): string {
  const next = sanitizeNext(url.searchParams.get("next"));
  const type = url.searchParams.get("type") ?? hashParams.get("type");

  if (next) return next;
  if (type === "recovery") return "/auth/nova-senha";

  return defaultTarget;
}

function getSignupRole(url: URL): "FREELANCER" | "ESTABLISHMENT" | null {
  const role = url.searchParams.get("role");

  if (role === "FREELANCER" || role === "ESTABLISHMENT") {
    return role;
  }

  return null;
}

type AuthCallbackClientProps = {
  defaultTarget: string;
  message: string;
  title?: string;
  forceDefaultTarget?: boolean;
};

export function AuthCallbackClient({
  defaultTarget,
  forceDefaultTarget = false,
  message,
  title = "Confirmando acesso",
}: AuthCallbackClientProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState(message);

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
        const code = url.searchParams.get("code");
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const target = forceDefaultTarget
          ? defaultTarget
          : getTarget(url, hashParams, defaultTarget);
        const signupRole = getSignupRole(url);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        setStatusMessage(message);

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

        if (signupRole) {
          const { error } = await supabase.auth.updateUser({
            data: { role: signupRole },
          });

          if (error) throw error;
        }

        if (cancelled) return;

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
  }, [defaultTarget, forceDefaultTarget, message, router, supabase]);

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <section className="rounded-md border bg-background p-5 shadow-sm">
          <div className="mb-5 flex size-10 items-center justify-center rounded-md bg-muted">
            <MailCheck className="size-5" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{statusMessage}</p>
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

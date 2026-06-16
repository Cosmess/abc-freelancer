"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import { Button } from "@/components/ui/button";

type GoogleAuthRole = "FREELANCER" | "ESTABLISHMENT";

type GoogleAuthButtonProps = {
  label: string;
  role?: GoogleAuthRole;
  next?: string;
};

function getSafeNext(next?: string): string {
  if (!next) return "/app";
  if (!next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}

function getRedirectTo(role: GoogleAuthRole | undefined, next: string): string {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", next);

  if (role) {
    url.searchParams.set("role", role);
  }

  return url.toString();
}

export function GoogleAuthButton({ label, role, next }: GoogleAuthButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    );

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectTo(role, getSafeNext(next)),
      },
    });

    if (error) {
      setPending(false);
    }
  }

  return (
    <Button
      className="h-11 w-full sm:h-10"
      disabled={pending}
      onClick={handleClick}
      type="button"
      variant="outline"
    >
      <span className="flex size-5 items-center justify-center rounded-full border bg-background text-xs font-bold">
        G
      </span>
      {pending ? "Abrindo Google..." : label}
    </Button>
  );
}

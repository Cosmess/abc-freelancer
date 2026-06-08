import Link from "next/link";
import type { ReactNode } from "react";

type AuthFormShellProps = {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthFormShell({
  title,
  description,
  footer,
  children,
}: AuthFormShellProps) {
  return (
    <main className="min-h-screen bg-muted/30 px-5 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center gap-6">
        <Link href="/" className="text-sm font-medium text-muted-foreground">
          ABC Freelancer
        </Link>
        <section className="rounded-md border bg-background p-5 shadow-sm">
          <div className="mb-5 space-y-2">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </section>
        <div className="text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </main>
  );
}

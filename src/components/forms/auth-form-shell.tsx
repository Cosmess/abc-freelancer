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
    <main className="min-h-screen bg-muted/30 px-3 py-4 text-foreground sm:px-5 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-md flex-col justify-center gap-4 sm:gap-6">
        <Link href="/" className="text-sm font-medium text-muted-foreground">
          ABC Freelancer
        </Link>
        <section className="rounded-lg border bg-background p-4 shadow-sm sm:p-5">
          <div className="mb-4 space-y-1.5 sm:mb-5 sm:space-y-2">
            <h1 className="text-xl font-semibold tracking-normal sm:text-2xl">{title}</h1>
            <p className="text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
              {description}
            </p>
          </div>
          {children}
        </section>
        <div className="text-center text-xs text-muted-foreground sm:text-sm">{footer}</div>
      </div>
    </main>
  );
}

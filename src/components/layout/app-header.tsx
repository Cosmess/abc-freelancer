import Link from "next/link";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth";

type AppHeaderProps = {
  title: string;
  userName: string;
};

export function AppHeader({ title, userName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-5">
        <Link href="/" className="flex items-center gap-1.5 font-bold tracking-tight">
          <span className="text-primary">ABC</span>
          <span className="text-foreground">Freelancer</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{userName}</p>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

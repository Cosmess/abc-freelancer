import Link from "next/link";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth";

type AppHeaderProps = {
  title: string;
  userName: string;
};

export function AppHeader({ title, userName }: AppHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="font-semibold">
          ABC Freelancer
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{userName}</p>
          </div>
          <form action={logoutAction}>
            <Button variant="outline" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

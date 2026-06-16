import Link from "next/link";
import { CreditCard, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

type AccessRequiredCardProps = {
  planPath: string;
  returnPath: string;
  title?: string;
  description?: string;
};

export function AccessRequiredCard({
  planPath,
  returnPath,
  title = "Plano necessario para continuar",
  description = "Seu periodo de teste terminou. Ative um plano para liberar novamente esta area e continuar usando os recursos do ABC Freelancer.",
}: AccessRequiredCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div className="flex size-11 items-center justify-center rounded-lg bg-primary/15">
        <LockKeyhole className="size-5 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link href={planPath}>
            <CreditCard className="size-4" />
            Ver planos
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={returnPath}>Voltar ao painel</Link>
        </Button>
      </div>
    </div>
  );
}

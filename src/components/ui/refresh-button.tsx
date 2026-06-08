"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rotated, setRotated] = useState(false);

  function handleRefresh() {
    setRotated(true);
    startTransition(() => {
      router.refresh();
    });
    setTimeout(() => setRotated(false), 700);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>
      <RefreshCw
        className={`size-4 transition-transform duration-500 ${rotated ? "rotate-180" : ""}`}
      />
      {isPending ? "Atualizando..." : "Atualizar"}
    </Button>
  );
}

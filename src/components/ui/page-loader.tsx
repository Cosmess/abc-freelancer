"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 0);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 200);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        {/* Animated spinner */}
        <div className="relative size-12">
          <div className="absolute inset-0 rounded-full border-4 border-border/40" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary" />
        </div>

        {/* Loading text */}
        <p className="text-sm font-medium text-muted-foreground">
          Carregando<span className="animate-pulse">...</span>
        </p>
      </div>
    </div>
  );
}

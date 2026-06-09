"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Detect navigation immediately by listening to router events
  useEffect(() => {
    const handleRouteChange = () => {
      setIsVisible(true);
    };

    // Listen to pathname changes (route has already changed)
    const currentPath = pathname;

    return () => {
      // Cleanup if needed
    };
  }, [pathname]);

  useEffect(() => {
    // Show loader immediately when pathname changes
    setIsVisible(true);

    // Hide loader quickly (200ms for snappy feel)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 200);

    return () => clearTimeout(timer);
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

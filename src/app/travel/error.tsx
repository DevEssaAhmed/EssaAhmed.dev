"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TravelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[travel] Travel page failed to render", error);
  }, [error]);

  return (
    <main
      role="alert"
      className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-16 text-on-surface"
    >
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Travel highlights are temporarily unavailable</h1>
          <p className="text-on-surface-variant">
            We couldn&apos;t load the travel data. Please try again shortly.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="overflow-auto rounded-xl bg-surface-container-low p-4 text-left text-xs text-on-surface-variant">
            {error.message}
          </pre>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="rounded-xl">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

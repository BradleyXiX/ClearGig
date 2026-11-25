import React from "react";
import { Button } from "@/components/ui/Button";

export interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <div
      role="alert"
      className="border border-rule rounded-panel bg-paper p-6 sm:p-8 max-w-xl shadow-xs"
    >
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block shrink-0" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-ink font-sans">Could not load estimates</h2>
      </div>
      <p className="mt-3 text-sm text-ink-muted leading-relaxed font-sans">{error}</p>
      <p className="mt-2 text-sm text-ink-muted leading-relaxed font-sans">
        Nothing is lost. The API reads from the database, so it cannot list
        anything while the database is unreachable.
      </p>
      <div className="mt-6">
        <Button
          variant="secondary"
          onClick={onRetry}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}

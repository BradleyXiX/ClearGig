import React from "react";
import type { Project } from "../../services/api.ts";

export type StampProps = {
  status: Project["status"];
  className?: string;
};

export function Stamp({ status, className = "" }: StampProps) {
  let colorClass = "text-ink-muted border-rule";
  switch (status) {
    case "ACCEPTED":
      colorClass = "text-forest border-forest/40 bg-accent-wash/30";
      break;
    case "DRAFT":
      colorClass = "text-ink-muted border-rule-strong bg-transparent";
      break;
    case "SENT":
      colorClass = "text-ink border-ink/40 bg-paper-sunken/50";
      break;
    case "REJECTED":
      colorClass = "text-danger border-danger/40 bg-danger/5";
      break;
  }

  return (
    <span
      className={`inline-flex items-center justify-center border rounded-control px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider ${colorClass} ${className}`.trim()}
    >
      {status}
    </span>
  );
}

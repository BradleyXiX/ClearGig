import React from "react";
import type { Project } from "../../services/api.ts";

export type StampProps = {
  status: Project["status"];
  className?: string;
};

export function Stamp({ status, className = "" }: StampProps) {
  let colorClass = "text-ink-muted";
  switch (status) {
    case "ACCEPTED":
      colorClass = "text-accent";
      break;
    case "DRAFT":
      colorClass = "text-ink-muted";
      break;
    case "SENT":
      colorClass = "text-ink";
      break;
    case "REJECTED":
      colorClass = "text-danger";
      break;
  }

  return (
    <span
      className={`inline-flex items-center justify-center border border-rule-strong rounded-control bg-transparent px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${colorClass} ${className}`.trim()}
    >
      {status}
    </span>
  );
}


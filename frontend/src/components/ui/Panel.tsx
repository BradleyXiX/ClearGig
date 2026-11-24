import React from "react";

export type PanelProps = {
  variant?: "raised" | "sunken" | "muted";
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Panel({
  variant = "raised",
  children,
  className = "",
  ...props
}: PanelProps) {
  let bg = "bg-paper";
  if (variant === "sunken") {
    bg = "bg-paper-sunken";
  } else if (variant === "muted") {
    bg = "bg-paper-muted";
  } else if (variant === "raised") {
    bg = "bg-paper-raised";
  }

  return (
    <div
      className={`${bg} border border-rule rounded-card transition-colors duration-150 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

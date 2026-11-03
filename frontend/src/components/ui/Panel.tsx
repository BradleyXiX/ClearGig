import React from "react";

export type PanelProps = {
  variant?: "raised" | "sunken";
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Panel({
  variant = "raised",
  children,
  className = "",
  ...props
}: PanelProps) {
  const bg = variant === "sunken" ? "bg-paper-sunken" : "bg-paper-raised";
  return (
    <div
      className={`${bg} border border-rule rounded-card ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}


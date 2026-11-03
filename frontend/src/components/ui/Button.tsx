import React from "react";

export type ButtonProps = {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "md" | "sm";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-control transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses =
    size === "sm"
      ? "px-2 py-1 text-sm font-medium"
      : "px-3 py-2 text-sm font-semibold";

  let variantClasses = "";
  switch (variant) {
    case "primary":
      variantClasses =
        "bg-accent text-paper-raised enabled:hover:bg-ink";
      break;
    case "secondary":
      variantClasses =
        "bg-transparent text-ink border border-rule-strong enabled:hover:bg-paper-sunken enabled:hover:border-ink";
      break;
    case "quiet":
      variantClasses =
        "bg-transparent text-ink-muted enabled:hover:text-ink enabled:hover:bg-paper-sunken";
      break;
    case "danger":
      variantClasses =
        "bg-transparent text-danger border border-danger enabled:hover:bg-danger enabled:hover:text-paper-raised";
      break;
  }

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`.trim();

  return (
    <button
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
}


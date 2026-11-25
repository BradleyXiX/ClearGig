import React from "react";

export type ButtonProps = {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "md" | "sm";
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    className = "",
    disabled,
    children,
    type = "button",
    ...props
  },
  ref
) {
  // Base classes: visible unobscured focus outline, min touch target, transitions
  const baseClasses =
    "inline-flex items-center justify-center font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest disabled:opacity-50 disabled:cursor-not-allowed";

  // Size classes: sm (h-9 / 36px) and md (h-11 / 44px for comfortable touch targets)
  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs uppercase tracking-wider font-medium h-9"
      : "px-4 py-2 text-sm font-medium h-11";

  let variantClasses = "";
  switch (variant) {
    case "primary":
      // Warm dark ink fill, crisp light text; hover subtle shift
      variantClasses =
        "bg-ink text-paper enabled:hover:bg-forest enabled:active:bg-ink";
      break;
    case "secondary":
      // Transparent background with rule-strong / control-border
      variantClasses =
        "bg-transparent text-ink border border-control-border enabled:hover:bg-paper-sunken enabled:hover:border-ink enabled:active:bg-paper-muted";
      break;
    case "quiet":
      variantClasses =
        "bg-transparent text-ink-muted enabled:hover:text-ink enabled:hover:bg-paper-sunken enabled:active:bg-paper-muted";
      break;
    case "danger":
      variantClasses =
        "bg-transparent text-danger border border-danger enabled:hover:bg-danger enabled:hover:text-paper";
      break;
  }

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`.trim();

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
});

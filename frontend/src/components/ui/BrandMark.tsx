import React from "react";

export interface BrandMarkProps extends React.SVGProps<SVGSVGElement> {
  variant?: "dark" | "light" | "current";
  size?: number;
  title?: string;
}

export function BrandMark({
  variant = "current",
  size = 20,
  className = "",
  title,
  ...props
}: BrandMarkProps) {
  const strokeColor =
    variant === "dark"
      ? "var(--color-ink)"
      : variant === "light"
      ? "var(--color-on-dark)"
      : "currentColor";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      className={`shrink-0 ${className}`.trim()}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Folio corner mark: squared document bracket with folded upper-right corner */}
      <path d="M4 4h10l5 5v11H4V4z" />
      <path d="M14 4v5h5" />
      {/* Two ruled lines representing scope and document structure */}
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  );
}

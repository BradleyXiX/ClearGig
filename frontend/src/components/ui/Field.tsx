import React, { useId } from "react";

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  suffix?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({
  label,
  hint,
  error,
  suffix,
  id,
  className = "",
  disabled,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-xs font-medium uppercase tracking-wider text-ink-muted"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          disabled={disabled}
          className={`w-full bg-paper-raised text-ink border ${
            error ? "border-danger" : "border-rule"
          } rounded-control px-3 py-2 text-sm focus:outline-none focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
          {...props}
        />
        {suffix && (
          <span className="text-sm font-medium text-ink-muted select-none">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-muted">{hint}</span>
      ) : null}
    </div>
  );
}


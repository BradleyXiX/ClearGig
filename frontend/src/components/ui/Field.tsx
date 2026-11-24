import React, { useId } from "react";

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  {
    label,
    hint,
    error,
    prefix,
    suffix,
    id,
    className = "",
    disabled,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs font-medium uppercase tracking-wider text-ink-muted"
      >
        {label}
      </label>
      <div
        className={`flex items-center w-full bg-paper text-ink border ${
          error ? "border-danger" : "border-control-border"
        } rounded-control px-3 py-2 text-sm transition-colors duration-150 focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-forest ${
          disabled ? "opacity-50 cursor-not-allowed bg-paper-sunken" : ""
        }`}
      >
        {prefix && (
          <span className="text-sm font-medium text-ink-muted mr-1.5 select-none shrink-0" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full bg-transparent text-ink placeholder:text-ink-muted/50 focus:outline-none disabled:cursor-not-allowed ${className}`.trim()}
          {...props}
        />
        {suffix && (
          <span className="text-sm font-medium text-ink-muted ml-1.5 select-none shrink-0" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <span id={errorId} role="alert" className="text-xs text-danger font-medium">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-xs text-ink-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
});

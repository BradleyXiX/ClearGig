import React, { useId } from "react";

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  prefixUnit?: string;
  suffixUnit?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function getUnitAnnouncement(unit?: string, symbol?: string): string | undefined {
  if (unit) return unit;
  if (!symbol) return undefined;
  switch (symbol.trim()) {
    case "$":
      return "dollars";
    case "€":
      return "euros";
    case "£":
      return "pounds";
    case "%":
      return "percent";
    case "/hr":
    case "/h":
      return "per hour";
    case "/day":
      return "per day";
    default:
      return symbol.trim();
  }
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  {
    label,
    hint,
    error,
    prefix,
    suffix,
    prefixUnit,
    suffixUnit,
    id,
    className = "",
    disabled,
    "aria-describedby": callerDescribedBy,
    "aria-invalid": callerAriaInvalid,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const unitId = `${inputId}-unit`;

  const announcedPrefix = getUnitAnnouncement(prefixUnit, prefix);
  const announcedSuffix = getUnitAnnouncement(suffixUnit, suffix);
  const unitAnnouncement = [announcedPrefix, announcedSuffix].filter(Boolean).join(", ");

  // Collect active description IDs
  const descIds: string[] = [];
  if (callerDescribedBy) {
    descIds.push(...callerDescribedBy.split(/\s+/).filter(Boolean));
  }
  if (error) {
    descIds.push(errorId);
  }
  if (hint) {
    descIds.push(hintId);
  }
  if (unitAnnouncement) {
    descIds.push(unitId);
  }

  // Deduplicate and omit empty
  const finalDescribedBy = Array.from(new Set(descIds)).join(" ") || undefined;

  // Validation error forces aria-invalid=true even if caller requests false; preserve caller when no local error
  const finalAriaInvalid = error ? true : callerAriaInvalid !== undefined ? callerAriaInvalid : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-ink-muted"
      >
        {label}
      </label>
      <div
        className={`flex items-center w-full bg-paper text-ink border ${
          error ? "border-danger" : "border-control-border"
        } rounded-control px-3 py-2 text-base transition-colors duration-150 focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-forest ${
          disabled ? "opacity-50 cursor-not-allowed bg-paper-sunken" : ""
        }`}
      >
        {prefix && (
          <span className="text-base font-medium text-ink-muted mr-1.5 select-none shrink-0" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={finalAriaInvalid}
          aria-describedby={finalDescribedBy}
          className={`w-full bg-transparent text-base text-ink placeholder:text-ink-muted/50 focus:outline-none disabled:cursor-not-allowed ${className}`.trim()}
          {...props}
        />
        {suffix && (
          <span className="text-base font-medium text-ink-muted ml-1.5 select-none shrink-0" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {unitAnnouncement && (
        <span id={unitId} className="sr-only">
          Unit: {unitAnnouncement}
        </span>
      )}
      {error ? (
        <span id={errorId} role="alert" className="text-sm text-danger font-medium">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-sm text-ink-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
});

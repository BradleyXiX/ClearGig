import React from "react";

export type RuleProps = {
  strong?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLHRElement>;

export function Rule({ strong = false, className = "", ...props }: RuleProps) {
  const borderColor = strong ? "border-rule-strong" : "border-rule";
  return (
    <hr
      className={`border-t ${borderColor} w-full my-0 ${className}`.trim()}
      {...props}
    />
  );
}


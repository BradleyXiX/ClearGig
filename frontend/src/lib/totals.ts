import type { Project } from "../services/api.ts";

export interface Totals {
  base: number;
  contingency: number;
  margin: number;
  total: number;
  recurringMonthly: number;
}

export function computeTotals(
  project: Pick<Project, "lineItems" | "contingencyPercentage" | "profitMargin">
): Totals {
  const items = project.lineItems ?? [];
  let base = 0;
  let recurringMonthly = 0;

  for (const item of items) {
    const cost = item.estimatedHours * item.hourlyRate;
    if (item.isRecurring) {
      recurringMonthly += cost;
    } else {
      base += cost;
    }
  }

  const contingency = base * ((project.contingencyPercentage ?? 0) / 100);
  const margin = (base + contingency) * ((project.profitMargin ?? 0) / 100);
  const total = base + contingency + margin;

  return {
    base,
    contingency,
    margin,
    total,
    recurringMonthly,
  };
}


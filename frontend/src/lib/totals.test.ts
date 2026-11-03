// src/lib/totals.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { computeTotals } from "./totals.ts";
import type { LineItem } from "../services/api.ts";

const item = (over: Partial<LineItem>) => ({
  id: "x", projectId: "p", category: "FRONTEND" as const,
  description: "d", estimatedHours: 10, hourlyRate: 100, isRecurring: false, ...over,
});

test("base includes one-time items and excludes recurring", () => {
  const t = computeTotals({ contingencyPercentage: 10, profitMargin: 20,
    lineItems: [item({}), item({ isRecurring: true, estimatedHours: 5 })] });
  assert.equal(t.base, 1000);
  assert.equal(t.recurringMonthly, 500);
});

test("margin applies to base plus contingency, not to base alone", () => {
  const t = computeTotals({ contingencyPercentage: 10, profitMargin: 20, lineItems: [item({})] });
  assert.equal(t.contingency, 100);
  assert.equal(t.margin, 220);
  assert.equal(t.total, 1320);
});

test("half hours survive without rounding drift", () => {
  const t = computeTotals({ contingencyPercentage: 0, profitMargin: 0,
    lineItems: [item({ estimatedHours: 0.5, hourlyRate: 150 })] });
  assert.equal(t.total, 75);
});

test("empty project is all zeros", () => {
  const t = computeTotals({ contingencyPercentage: 15, profitMargin: 10, lineItems: [] });
  assert.deepEqual(t, { base: 0, contingency: 0, margin: 0, total: 0, recurringMonthly: 0 });
});


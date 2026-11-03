import test from "node:test";
import assert from "node:assert/strict";
import { computeAudit } from "./finops.ts";

test("reference case: 12500 at 30%", () => {
  assert.deepEqual(computeAudit({ monthlySpend: 12500, savingsRate: 30 }), {
    monthlySavings: 3750, optimizedSpend: 8750, annualizedSavings: 45000,
    contingencyFee: 5625, clientNetSavings: 39375,
  });
});

test("zero spend yields zeros, not NaN", () => {
  assert.deepEqual(computeAudit({ monthlySpend: 0, savingsRate: 30 }),
    { monthlySavings: 0, optimizedSpend: 0, annualizedSavings: 0, contingencyFee: 0, clientNetSavings: 0 });
});

test("zero rate yields zero savings and full spend retained", () => {
  const r = computeAudit({ monthlySpend: 1000, savingsRate: 0 });
  assert.equal(r.monthlySavings, 0);
  assert.equal(r.optimizedSpend, 1000);
});

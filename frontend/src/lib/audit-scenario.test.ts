import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseAuditScenario,
  buildAuditExportUrl,
  DEFAULT_MONTHLY_SPEND,
  DEFAULT_SAVINGS_RATE,
} from './audit-scenario.ts';
import { computeAudit } from './finops.ts';

test('parseAuditScenario: absent or empty parameters fall back to explicit defaults', () => {
  const result1 = parseAuditScenario(null);
  assert.equal(result1.monthlySpend, DEFAULT_MONTHLY_SPEND);
  assert.equal(result1.savingsRate, DEFAULT_SAVINGS_RATE);
  assert.equal(result1.isCustomSpend, false);
  assert.equal(result1.isCustomRate, false);

  const searchParams = new URLSearchParams('');
  const result2 = parseAuditScenario(searchParams);
  assert.equal(result2.monthlySpend, DEFAULT_MONTHLY_SPEND);
  assert.equal(result2.savingsRate, DEFAULT_SAVINGS_RATE);
  assert.equal(result2.isCustomSpend, false);
  assert.equal(result2.isCustomRate, false);

  // Fallback defaults passed via options
  const result3 = parseAuditScenario(null, { defaultMonthlySpend: 8000, defaultSavingsRate: 25 });
  assert.equal(result3.monthlySpend, 8000);
  assert.equal(result3.savingsRate, 25);
});

test('parseAuditScenario: rate range validation — tests rate 0, 1, 30, 100 with exact non-ambiguous semantics (rate 1 is 1%, not 100%)', () => {
  // Rate 0
  const res0 = parseAuditScenario(new URLSearchParams('rate=0&spend=10000'));
  assert.equal(res0.savingsRate, 0);
  assert.equal(res0.monthlySpend, 10000);
  assert.equal(res0.result.monthlySavings, 0);
  assert.equal(res0.result.optimizedSpend, 10000);
  assert.equal(res0.result.clientNetSavings, 0);

  // Rate 1 (Must strictly mean 1%, NOT 100%)
  const res1 = parseAuditScenario(new URLSearchParams('rate=1&spend=10000'));
  assert.equal(res1.savingsRate, 1);
  assert.equal(res1.result.monthlySavings, 100); // 10000 * 1% = 100
  assert.equal(res1.result.optimizedSpend, 9900);
  assert.equal(res1.result.annualizedSavings, 1200);
  assert.equal(res1.result.contingencyFee, 150); // 100 * 3 * 0.5 = 150
  assert.equal(res1.result.clientNetSavings, 1050);

  // Rate 30
  const res30 = parseAuditScenario(new URLSearchParams('rate=30&spend=12500'));
  assert.equal(res30.savingsRate, 30);
  assert.equal(res30.result.monthlySavings, 3750);
  assert.equal(res30.result.optimizedSpend, 8750);
  assert.equal(res30.result.annualizedSavings, 45000);
  assert.equal(res30.result.contingencyFee, 5625);
  assert.equal(res30.result.clientNetSavings, 39375);

  // Rate 100
  const res100 = parseAuditScenario(new URLSearchParams('rate=100&spend=5000'));
  assert.equal(res100.savingsRate, 100);
  assert.equal(res100.result.monthlySavings, 5000);
  assert.equal(res100.result.optimizedSpend, 0);
  assert.equal(res100.result.clientNetSavings, 52500);
});

test('parseAuditScenario: zero and large finite spend validation', () => {
  // Zero spend
  const resZero = parseAuditScenario(new URLSearchParams('spend=0&rate=20'));
  assert.equal(resZero.monthlySpend, 0);
  assert.equal(resZero.savingsRate, 20);
  assert.equal(resZero.result.monthlySavings, 0);
  assert.equal(resZero.result.clientNetSavings, 0);

  // Large finite spend
  const resLarge = parseAuditScenario(new URLSearchParams('spend=1000000&rate=15'));
  assert.equal(resLarge.monthlySpend, 1000000);
  assert.equal(resLarge.savingsRate, 15);
  assert.equal(resLarge.result.monthlySavings, 150000);
  assert.equal(resLarge.result.optimizedSpend, 850000);
  assert.equal(resLarge.result.clientNetSavings, 1575000);
});

test('parseAuditScenario: invalid, negative, non-finite, out-of-bounds parameters fall back safely to defaults', () => {
  // Negative spend and negative rate
  const resNeg = parseAuditScenario(new URLSearchParams('spend=-500&rate=-10'));
  assert.equal(resNeg.monthlySpend, DEFAULT_MONTHLY_SPEND);
  assert.equal(resNeg.savingsRate, DEFAULT_SAVINGS_RATE);
  assert.equal(resNeg.isCustomSpend, false);
  assert.equal(resNeg.isCustomRate, false);

  // Rate > 100
  const resOver = parseAuditScenario(new URLSearchParams('spend=5000&rate=150'));
  assert.equal(resOver.monthlySpend, 5000);
  assert.equal(resOver.savingsRate, DEFAULT_SAVINGS_RATE); // rejected and fell back
  assert.equal(resOver.isCustomRate, false);

  // Non-finite strings (NaN, Infinity, script injection attempts)
  const resNonFinite = parseAuditScenario(
    new URLSearchParams('spend=Infinity&rate=NaN')
  );
  assert.equal(resNonFinite.monthlySpend, DEFAULT_MONTHLY_SPEND);
  assert.equal(resNonFinite.savingsRate, DEFAULT_SAVINGS_RATE);

  const resString = parseAuditScenario(
    new URLSearchParams('spend=invalid_spend&rate=<script>alert(1)</script>')
  );
  assert.equal(resString.monthlySpend, DEFAULT_MONTHLY_SPEND);
  assert.equal(resString.savingsRate, DEFAULT_SAVINGS_RATE);
});

test('buildAuditExportUrl: constructs validated URL preserving active scenario', () => {
  const url1 = buildAuditExportUrl('proj-abc', { monthlySpend: 25000, savingsRate: 20 });
  assert.equal(url1, '/projects/proj-abc/document?variant=audit&spend=25000&rate=20');

  // Rate 0 and 1 are correctly preserved
  const url2 = buildAuditExportUrl('proj-xyz', { monthlySpend: 0, savingsRate: 0 });
  assert.equal(url2, '/projects/proj-xyz/document?variant=audit&spend=0&rate=0');

  const url3 = buildAuditExportUrl('proj-xyz', { monthlySpend: 5000, savingsRate: 1 });
  assert.equal(url3, '/projects/proj-xyz/document?variant=audit&spend=5000&rate=1');
});

test('screen and print parity: computeAudit formula matches across FinOpsAudit and DocumentAudit', () => {
  const testInputs = [
    { monthlySpend: 12500, savingsRate: 30 },
    { monthlySpend: 20000, savingsRate: 15 },
    { monthlySpend: 50000, savingsRate: 1 },
    { monthlySpend: 0, savingsRate: 50 },
    { monthlySpend: 10000, savingsRate: 100 },
  ];

  for (const input of testInputs) {
    const directResult = computeAudit(input);
    const scenario = parseAuditScenario(
      new URLSearchParams(`spend=${input.monthlySpend}&rate=${input.savingsRate}`)
    );

    assert.deepEqual(
      scenario.result,
      directResult,
      `Scenario result must match computeAudit directly for spend=${input.monthlySpend}, rate=${input.savingsRate}`
    );
  }
});

test('source audit: FinOps components explain projection assumptions without ROI or connected-cloud claims', () => {
  const finOpsAuditSrc = readFileSync(
    join(process.cwd(), 'src/components/FinOpsAudit.tsx'),
    'utf8'
  );
  const docAuditSrc = readFileSync(
    join(process.cwd(), 'src/components/DocumentAudit.tsx'),
    'utf8'
  );

  // Must not claim measured savings, live cloud connection or ROI
  assert.doesNotMatch(finOpsAuditSrc, /ROI/i);
  assert.doesNotMatch(finOpsAuditSrc, /connected\s*cloud/i);
  assert.doesNotMatch(finOpsAuditSrc, /measured\s*savings/i);

  assert.doesNotMatch(docAuditSrc, /connected\s*cloud/i);
  assert.doesNotMatch(docAuditSrc, /measured\s*savings/i);

  // Must state that values are scenario assumptions / projections
  assert.match(finOpsAuditSrc, /Scenario assumptions/i);
  assert.match(finOpsAuditSrc, /Projected/i);
  assert.match(docAuditSrc, /Projected/i);
  assert.match(docAuditSrc, /Assumptions/i);
});

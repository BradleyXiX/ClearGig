import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { computeTotals } from './totals.ts';
import { computeAudit } from './finops.ts';

test('print document markup: single main landmark and no nested main in DocumentShell', () => {
  const shellSrc = readFileSync(
    join(process.cwd(), 'src/components/DocumentShell.tsx'),
    'utf8'
  );
  const appShellSrc = readFileSync(
    join(process.cwd(), 'src/components/AppShell.tsx'),
    'utf8'
  );
  const docPageSrc = readFileSync(
    join(process.cwd(), 'src/app/projects/[id]/document/page.tsx'),
    'utf8'
  );

  // AppShell provides the single semantic <main> for standard app routes
  assert.match(appShellSrc, /<main>\{children\}<\/main>/);

  // DocumentShell uses <article> without introducing another nested <main> landmark tag
  assert.match(shellSrc, /<article/);
  assert.doesNotMatch(
    shellSrc,
    /<main[\s>]/i,
    'DocumentShell must not introduce a nested <main> landmark element'
  );

  // Document page has toolbar marked with .no-print
  assert.match(docPageSrc, /className="[^"]*no-print[^"]*"/);
});

test('print styles: globals.css contains print isolation, break-inside-avoid, and no-print rules', () => {
  const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

  assert.match(css, /@media print/);
  assert.match(css, /\.no-print\s*\{\s*display:\s*none\s*!important/);
  assert.match(css, /break-inside:\s*avoid/);
  assert.match(css, /display:\s*table-header-group/);
});

test('pagination and multi-page data integrity: large line-item datasets compute accurately without truncation', () => {
  // Generate a project with 40 line items (representing a multi-page printed document)
  const lineItems = Array.from({ length: 40 }, (_, i) => ({
    id: `item-${i + 1}`,
    projectId: 'multi-page-proj',
    category: (i % 2 === 0 ? 'BACKEND' : 'FRONTEND') as 'BACKEND' | 'FRONTEND',
    description: `Scope module ${i + 1}: detailed architectural deliverable specification with extensive notes`,
    estimatedHours: 10,
    hourlyRate: 150,
    isRecurring: i % 5 === 0,
  }));

  const oneTimeItems = lineItems.filter((i) => !i.isRecurring);
  const recurringItems = lineItems.filter((i) => i.isRecurring);

  const totals = computeTotals({
    lineItems,
    contingencyPercentage: 15,
    profitMargin: 20,
  });

  const expectedBase = oneTimeItems.reduce(
    (sum, item) => sum + item.estimatedHours * item.hourlyRate,
    0
  );
  const expectedRecurring = recurringItems.reduce(
    (sum, item) => sum + item.estimatedHours * item.hourlyRate,
    0
  );
  const expectedContingency = expectedBase * 0.15;
  const expectedMargin = (expectedBase + expectedContingency) * 0.2;
  const expectedTotal = expectedBase + expectedContingency + expectedMargin;

  assert.equal(totals.base, expectedBase);
  assert.equal(totals.recurringMonthly, expectedRecurring);
  assert.equal(totals.contingency, expectedContingency);
  assert.equal(totals.margin, expectedMargin);
  assert.equal(totals.total, expectedTotal);
  assert.ok(totals.total > 0);
  assert.equal(lineItems.length, 40);
});

test('word-wrapping and layout safety: long titles and client names preserve structure', () => {
  const shellSrc = readFileSync(
    join(process.cwd(), 'src/components/DocumentShell.tsx'),
    'utf8'
  );
  const estSrc = readFileSync(
    join(process.cwd(), 'src/components/DocumentEstimate.tsx'),
    'utf8'
  );

  // Assert break-words or overflow handling is present on title/client in DocumentShell
  assert.match(shellSrc, /break-words/);
  assert.match(estSrc, /break-words/);
});

test('both document variants (Estimate and Audit) maintain correct projections with extreme values', () => {
  // 1. Zero values
  const zeroAudit = computeAudit({ monthlySpend: 0, savingsRate: 0 });
  assert.equal(zeroAudit.monthlySavings, 0);
  assert.equal(zeroAudit.clientNetSavings, 0);

  // 2. Large spend with 100% savings rate
  const maxAudit = computeAudit({ monthlySpend: 250000, savingsRate: 100 });
  assert.equal(maxAudit.monthlySavings, 250000);
  assert.equal(maxAudit.optimizedSpend, 0);
  assert.equal(maxAudit.annualizedSavings, 3000000);
  assert.equal(maxAudit.contingencyFee, 375000);
  assert.equal(maxAudit.clientNetSavings, 2625000);
});

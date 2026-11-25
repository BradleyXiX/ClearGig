import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { computeTotals } from './totals.ts';
import { computeAudit } from './finops.ts';
import { parseAuditScenario } from './audit-scenario.ts';

test('integration verification: /showcase is strictly price-free across all components and files', () => {
  const showcaseDir = join(process.cwd(), 'src/components/showcase');
  const files = readdirSync(showcaseDir)
    .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
    .map((f) => join('src/components/showcase', f));
  files.push('src/app/showcase/page.tsx');

  for (const relPath of files) {
    const fullPath = join(process.cwd(), relPath);
    const content = readFileSync(fullPath, 'utf8');

    // Strip comments and multiline template string interpolations ${...}
    const stripped = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\$\{[\s\S]*?\}/g, '');

    // 1. Strictly assert zero currency symbols
    assert.doesNotMatch(
      stripped,
      /[$€£¥]\s*\d+|\b\d+\s*[$€£¥]/,
      `File ${relPath} must not contain monetary prices or currency symbols`
    );

    // 2. Strictly assert zero currency codes with numbers (e.g. 100 USD)
    assert.doesNotMatch(
      stripped,
      /\b\d+\s*(USD|EUR|GBP|JPY)\b/i,
      `File ${relPath} must not contain currency code values`
    );

    // 3. Strictly assert zero hourly rates (e.g. 150/hr, $150/hour)
    assert.doesNotMatch(
      stripped,
      /\b\d+\s*(\/|per)\s*(hr|hour)\b/i,
      `File ${relPath} must not contain hourly rate figures`
    );
  }

  // Verify EstimateArtwork explicitly affirms preview without pricing
  const artworkContent = readFileSync(join(process.cwd(), 'src/components/showcase/EstimateArtwork.tsx'), 'utf8');
  assert.match(artworkContent, /WORKFLOW PREVIEW\s*·\s*NO PRICING SHOWN/);
});

test('integration verification: FAQ copy is polished and uses native <details> disclosures without JS requirement', () => {
  const questionsPath = join(process.cwd(), 'src/components/showcase/Questions.tsx');
  const questionsContent = readFileSync(questionsPath, 'utf8');

  // Exact editorial FAQ copy requirement
  assert.match(
    questionsContent,
    /ClearGig does not provide legal contract drafting or electronic signatures\./,
    'FAQ must render the exact legal/contract polish statement'
  );
  assert.doesNotMatch(
    questionsContent,
    /No claim of generated legal contracts or e-signing\./,
    'Old phrasing must be replaced'
  );

  // Must use native semantic details/summary
  assert.match(questionsContent, /<details\b/);
  assert.match(questionsContent, /<summary\b/);
});

test('integration verification: document route differentiates 404 from network/5xx errors and keys by route ID', () => {
  const docPath = join(process.cwd(), 'src/app/projects/[id]/document/page.tsx');
  const docContent = readFileSync(docPath, 'utf8');

  // Key-based ID lifecycle: ensures navigating between project IDs resets state cleanly
  assert.match(
    docContent,
    /<DocumentContent key=\{id\} id=\{id\} \/>/,
    'DocumentPage must key DocumentContent by id to reset state on route ID changes'
  );

  // Truthful error classification
  assert.match(
    docContent,
    /err instanceof ApiError/,
    'Must inspect ApiError status to classify errors'
  );
  assert.match(
    docContent,
    /err\.status === 404/,
    'Must check for 404 status'
  );
  assert.match(
    docContent,
    /err instanceof TypeError/,
    'Must check for TypeError to identify network fetch rejections'
  );
  assert.match(
    docContent,
    /err\.status >= 500/,
    'Must classify 5xx responses as server error'
  );

  // Separate UI branches for not_found vs network/server error
  assert.match(
    docContent,
    /This estimate does not exist\./,
    'Must render honest missing message on 404'
  );
  assert.match(
    docContent,
    /Network connection failed/,
    'Must render network connection failure state'
  );
  assert.match(
    docContent,
    /Retry connection/,
    'Must offer truthful retry action on connection/server errors'
  );
});

test('integration verification: audit scenario parsing and FinOps projections across rate boundaries', () => {
  // Test 0%, 1%, 30%, 100% savings rate boundaries
  const rates = [0, 1, 30, 100];
  const spends = [0, 12500, 250000];

  for (const rate of rates) {
    for (const spend of spends) {
      const searchParams = new URLSearchParams({
        spend: String(spend),
        rate: String(rate),
      });

      const scenario = parseAuditScenario(searchParams, { defaultMonthlySpend: 12500 });
      assert.equal(scenario.savingsRate, rate);
      assert.equal(scenario.monthlySpend, spend);

      const audit = computeAudit({
        monthlySpend: scenario.monthlySpend,
        savingsRate: scenario.savingsRate,
      });

      // Assert mathematical invariants
      assert.ok(!Number.isNaN(audit.monthlySavings));
      assert.ok(!Number.isNaN(audit.optimizedSpend));
      assert.ok(!Number.isNaN(audit.annualizedSavings));
      assert.ok(!Number.isNaN(audit.contingencyFee));
      assert.ok(!Number.isNaN(audit.clientNetSavings));

      assert.ok(audit.monthlySavings >= 0);
      assert.ok(audit.optimizedSpend >= 0);
      assert.ok(audit.clientNetSavings >= 0);

      // Monthly savings must equal spend * (rate / 100)
      const expectedMonthlySavings = spend * (rate / 100);
      assert.equal(audit.monthlySavings, expectedMonthlySavings);

      // Optimized spend must equal spend - monthlySavings
      assert.equal(audit.optimizedSpend, spend - expectedMonthlySavings);
    }
  }
});

test('integration verification: multi-page line item datasets maintain ledger integrity and landmark cleanliness', () => {
  // 40 line items test (multi-page printable estimate)
  const items = Array.from({ length: 40 }, (_, idx) => ({
    id: `item-${idx}`,
    projectId: 'test-p',
    category: (idx % 2 === 0 ? 'FRONTEND' : 'BACKEND') as 'FRONTEND' | 'BACKEND',
    description: `Deliverable module ${idx + 1}: end-to-end integration test harness`,
    estimatedHours: 8,
    hourlyRate: 120,
    isRecurring: idx % 4 === 0,
  }));

  const totals = computeTotals({
    lineItems: items,
    contingencyPercentage: 10,
    profitMargin: 15,
  });

  const oneTime = items.filter((i) => !i.isRecurring);
  const recurring = items.filter((i) => i.isRecurring);

  const base = oneTime.reduce((acc, i) => acc + i.estimatedHours * i.hourlyRate, 0);
  const recurringMonthly = recurring.reduce((acc, i) => acc + i.estimatedHours * i.hourlyRate, 0);
  const contingency = base * 0.1;
  const margin = (base + contingency) * 0.15;
  const total = base + contingency + margin;

  assert.equal(totals.base, base);
  assert.equal(totals.recurringMonthly, recurringMonthly);
  assert.equal(totals.contingency, contingency);
  assert.equal(totals.margin, margin);
  assert.equal(totals.total, total);
  assert.equal(items.length, 40);

  // Single semantic main landmark verification
  const shellSrc = readFileSync(join(process.cwd(), 'src/components/DocumentShell.tsx'), 'utf8');
  assert.doesNotMatch(
    shellSrc,
    /<main[\s>]/i,
    'DocumentShell must not inject a nested <main> landmark'
  );
});

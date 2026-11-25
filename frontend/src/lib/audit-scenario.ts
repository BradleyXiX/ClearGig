import { computeAudit, type AuditResult } from './finops.ts';

export const DEFAULT_MONTHLY_SPEND = 12500;
export const DEFAULT_SAVINGS_RATE = 30;

export interface ValidatedAuditScenario {
  monthlySpend: number;
  savingsRate: number;
  isCustomSpend: boolean;
  isCustomRate: boolean;
  result: AuditResult;
}

export interface ParseAuditScenarioOptions {
  defaultMonthlySpend?: number;
  defaultSavingsRate?: number;
}

/**
 * Validates and parses raw query parameters into a safe, finite FinOps scenario.
 * - Missing parameters fall back to explicit defaults.
 * - Invalid, non-finite, negative, or out-of-bounds parameters fall back explicitly to defaults.
 * - Savings rate is strictly an integer or float between 0 and 100 percentage points.
 * - Rate 1 means 1%, NOT 100%. Rate 0 means 0%, rate 100 means 100%.
 * - Spend must be a finite non-negative number (>= 0).
 */
export function parseAuditScenario(
  searchParams: { get: (name: string) => string | null } | URLSearchParams | Record<string, string | string[] | undefined> | null | undefined,
  options?: ParseAuditScenarioOptions
): ValidatedAuditScenario {
  const fallbackSpend =
    typeof options?.defaultMonthlySpend === 'number' &&
    Number.isFinite(options?.defaultMonthlySpend) &&
    options.defaultMonthlySpend >= 0
      ? options.defaultMonthlySpend
      : DEFAULT_MONTHLY_SPEND;

  const fallbackRate =
    typeof options?.defaultSavingsRate === 'number' &&
    Number.isFinite(options?.defaultSavingsRate) &&
    options.defaultSavingsRate >= 0 &&
    options.defaultSavingsRate <= 100
      ? options.defaultSavingsRate
      : DEFAULT_SAVINGS_RATE;

  const getParam = (key: string): string | null => {
    if (!searchParams) return null;
    if (typeof (searchParams as { get?: unknown }).get === 'function') {
      return (searchParams as { get: (name: string) => string | null }).get(key);
    }
    const val = (searchParams as Record<string, string | string[] | undefined>)[key];
    if (Array.isArray(val)) return val[0] ?? null;
    return typeof val === 'string' ? val : null;
  };

  const rawSpend = getParam('spend');
  const rawRate = getParam('rate');

  let monthlySpend = fallbackSpend;
  let isCustomSpend = false;
  if (rawSpend !== null && rawSpend.trim() !== '') {
    const parsed = Number(rawSpend.trim());
    if (Number.isFinite(parsed) && parsed >= 0) {
      monthlySpend = parsed;
      isCustomSpend = true;
    }
  }

  let savingsRate = fallbackRate;
  let isCustomRate = false;
  if (rawRate !== null && rawRate.trim() !== '') {
    const parsed = Number(rawRate.trim());
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
      savingsRate = parsed;
      isCustomRate = true;
    }
  }

  const result = computeAudit({ monthlySpend, savingsRate });

  return {
    monthlySpend,
    savingsRate,
    isCustomSpend,
    isCustomRate,
    result,
  };
}

/**
 * Builds a validated query string / URL for audit document export.
 * Transports active transient scenario values (monthly spend, savings rate).
 */
export function buildAuditExportUrl(
  projectId: string,
  scenario: { monthlySpend: number; savingsRate: number }
): string {
  const params = new URLSearchParams();
  params.set('variant', 'audit');

  if (Number.isFinite(scenario.monthlySpend) && scenario.monthlySpend >= 0) {
    params.set('spend', String(scenario.monthlySpend));
  }

  if (
    Number.isFinite(scenario.savingsRate) &&
    scenario.savingsRate >= 0 &&
    scenario.savingsRate <= 100
  ) {
    params.set('rate', String(scenario.savingsRate));
  }

  return `/projects/${encodeURIComponent(projectId)}/document?${params.toString()}`;
}

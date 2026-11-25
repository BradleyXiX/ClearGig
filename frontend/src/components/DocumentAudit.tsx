import React from 'react';
import { computeAudit } from '@/lib/finops';
import { Rule } from './ui/Rule';

export interface DocumentAuditProps {
  defaultMonthlySpend?: number;
  savingsRate?: number;
}

export function DocumentAudit({
  defaultMonthlySpend = 12500,
  savingsRate = 30,
}: DocumentAuditProps) {
  // Ensure valid finite nonnegative numbers; rate 1 strictly means 1%, not 100%
  const validSpend =
    Number.isFinite(defaultMonthlySpend) && defaultMonthlySpend >= 0
      ? defaultMonthlySpend
      : 12500;
  const validRate =
    Number.isFinite(savingsRate) && savingsRate >= 0 && savingsRate <= 100
      ? savingsRate
      : 30;

  const audit = computeAudit({
    monthlySpend: validSpend,
    savingsRate: validRate,
  });

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Scope / Baseline details */}
      <div className="border border-rule rounded-card bg-paper-sunken p-4 flex flex-col sm:flex-row justify-between gap-4 font-mono text-xs uppercase tracking-wider text-ink-muted">
        <div>
          Baseline Monthly Spend:{' '}
          <span className="text-ink font-medium">
            ${validSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div>
          Target Savings Rate:{' '}
          <span className="text-ink font-medium">{validRate}%</span>
        </div>
      </div>

      {/* Five-row ruled results table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-rule-strong text-xs font-mono uppercase tracking-wider text-ink-muted">
              <th className="py-3 pr-4 font-medium">Metric</th>
              <th className="py-3 px-4 font-medium">Basis (Assumptions)</th>
              <th className="py-3 pl-4 font-medium text-right">Projected Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule font-mono text-sm">
            <tr className="h-12 text-ink">
              <td className="py-3 pr-4 font-sans font-medium">Monthly savings</td>
              <td className="py-3 px-4 text-xs text-ink-muted">
                Baseline spend × {validRate}%
              </td>
              <td className="py-3 pl-4 tabular-nums text-right font-medium">
                ${audit.monthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </td>
            </tr>

            <tr className="h-12 text-ink">
              <td className="py-3 pr-4 font-sans font-medium">Optimized spend</td>
              <td className="py-3 px-4 text-xs text-ink-muted">
                Baseline − monthly savings
              </td>
              <td className="py-3 pl-4 tabular-nums text-right font-medium">
                ${audit.optimizedSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </td>
            </tr>

            <tr className="h-12 text-ink">
              <td className="py-3 pr-4 font-sans font-medium">Annualized savings</td>
              <td className="py-3 px-4 text-xs text-ink-muted">
                Monthly savings × 12
              </td>
              <td className="py-3 pl-4 tabular-nums text-right font-medium">
                ${audit.annualizedSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </td>
            </tr>

            <tr className="h-12 text-ink">
              <td className="py-3 pr-4 font-sans font-medium">Contingency fee</td>
              <td className="py-3 px-4 text-xs text-ink-muted">
                50% of first 3 months savings
              </td>
              <td className="py-3 pl-4 tabular-nums text-right font-medium">
                ${audit.contingencyFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary section */}
      <div className="flex flex-col items-end pt-4">
        <div className="w-full sm:w-96 space-y-3 font-mono text-sm">
          <div className="pt-2">
            <Rule strong />
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">
              Client net first year
            </span>
            <span className="text-5xl font-mono font-semibold tabular-nums text-accent">
              ${audit.clientNetSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="pt-4 border-t border-rule text-right space-y-1">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
              Fee: 50% of the first three months of savings
            </p>
            <p className="text-xs text-ink-muted">
              Projected scenario assumptions; not an ROI guarantee or historical cloud billing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



'use client';

import React, { useState } from 'react';
import { computeAudit } from '@/lib/finops';
import { Field } from './ui/Field';
import { Rule } from './ui/Rule';

export interface FinOpsAuditProps {
  defaultMonthlySpend?: number;
  monthlySpend?: number;
  savingsRate?: number;
  onScenarioChange?: (scenario: { monthlySpend: number; savingsRate: number }) => void;
}

export function FinOpsAudit({
  defaultMonthlySpend = 12500,
  monthlySpend: controlledSpend,
  savingsRate: controlledRate,
  onScenarioChange,
}: FinOpsAuditProps) {
  const [internalSpend, setInternalSpend] = useState<number>(
    defaultMonthlySpend > 0 ? defaultMonthlySpend : 12500
  );
  const [internalRate, setInternalRate] = useState<number>(30);

  const monthlySpend = typeof controlledSpend === 'number' ? controlledSpend : internalSpend;
  const savingsRate = typeof controlledRate === 'number' ? controlledRate : internalRate;

  const handleSpendChange = (val: number) => {
    const safeVal = Number.isFinite(val) && val >= 0 ? val : 0;
    if (onScenarioChange) {
      onScenarioChange({ monthlySpend: safeVal, savingsRate });
    } else {
      setInternalSpend(safeVal);
    }
  };

  const handleRateChange = (val: number) => {
    const safeVal = Number.isFinite(val) ? Math.min(100, Math.max(0, val)) : 0;
    if (onScenarioChange) {
      onScenarioChange({ monthlySpend, savingsRate: safeVal });
    } else {
      setInternalRate(safeVal);
    }
  };

  const result = computeAudit({ monthlySpend, savingsRate });

  return (
    <div className="space-y-8">
      {/* Two Fields: monthly spend, target rate */}
      <div className="border border-rule rounded-card bg-paper-raised p-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            Scenario assumptions
          </h2>
          <span className="text-xs text-ink-muted">
            Unsaved transient scenario — not billing or historical cloud telemetries
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Monthly cloud spend"
            type="number"
            step="100"
            min="0"
            suffix="$/mo"
            value={monthlySpend}
            onChange={(e) => handleSpendChange(Number(e.target.value))}
          />
          <Field
            label="Target savings rate"
            type="number"
            step="1"
            min="0"
            max="100"
            suffix="%"
            value={savingsRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Five-row ruled results table */}
      <div className="border border-rule rounded-card bg-paper-raised p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            Projected audit results
          </h2>
          <span className="text-xs text-ink-muted">
            Modeled projection based on target rate
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <tbody className="divide-y divide-rule font-mono text-sm">
              <tr className="h-12">
                <td className="py-3 text-ink-muted font-sans text-xs uppercase tracking-wider">
                  Monthly savings
                </td>
                <td className="py-3 text-right tabular-nums text-ink">
                  ${result.monthlySavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="h-12">
                <td className="py-3 text-ink-muted font-sans text-xs uppercase tracking-wider">
                  Optimized monthly spend
                </td>
                <td className="py-3 text-right tabular-nums text-ink">
                  ${result.optimizedSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="h-12">
                <td className="py-3 text-ink-muted font-sans text-xs uppercase tracking-wider">
                  Annualized savings
                </td>
                <td className="py-3 text-right tabular-nums text-ink">
                  ${result.annualizedSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="h-12">
                <td className="py-3 text-ink-muted font-sans text-xs uppercase tracking-wider">
                  Contingency fee (50% × 3 mo)
                </td>
                <td className="py-3 text-right tabular-nums text-ink">
                  ${result.contingencyFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
              </tr>
              <tr className="h-14">
                <td className="py-3 text-ink-muted font-sans text-xs uppercase tracking-wider font-medium">
                  Client net first-year savings
                </td>
                <td className="py-3 text-right tabular-nums text-3xl font-semibold text-accent">
                  ${result.clientNetSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Rule />

        <div className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          Fee: 50% of the first three months of savings (Projected)
        </div>
      </div>
    </div>
  );
}



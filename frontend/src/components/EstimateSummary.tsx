import React from 'react';
import type { Totals } from '@/lib/totals';
import { Button } from './ui/Button';
import { Rule } from './ui/Rule';

export interface EstimateSummaryProps {
  totals: Totals;
  contingencyPercentage: number;
  profitMargin: number;
  onExport: () => void;
}

export function EstimateSummary({
  totals,
  contingencyPercentage,
  profitMargin,
  onExport,
}: EstimateSummaryProps) {
  return (
    <div className="border border-rule rounded-card bg-paper-raised p-6 space-y-6">
      <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        Summary
      </h2>

      <div className="space-y-3 font-mono text-sm">
        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">Base cost</span>
          <span className="tabular-nums">${totals.base.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>

        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
            Contingency ({contingencyPercentage}%)
          </span>
          <span className="tabular-nums">${totals.contingency.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>

        <div className="flex justify-between items-center text-ink">
          <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
            Profit margin ({profitMargin}%)
          </span>
          <span className="tabular-nums">${totals.margin.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>

        {totals.recurringMonthly > 0 && (
          <div className="flex justify-between items-center text-ink">
            <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
              Recurring / mo
            </span>
            <span className="tabular-nums">${totals.recurringMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        )}
      </div>

      <Rule strong />

      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">Total</span>
        <span className="text-5xl font-mono font-semibold tabular-nums text-accent">
          ${totals.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
      </div>

      <Button variant="primary" onClick={onExport} className="w-full">
        Export estimate
      </Button>
    </div>
  );
}


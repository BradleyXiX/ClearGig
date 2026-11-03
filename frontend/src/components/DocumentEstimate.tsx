import React from 'react';
import type { Project } from '@/services/api';
import type { Totals } from '@/lib/totals';
import { Rule } from './ui/Rule';

export interface DocumentEstimateProps {
  project: Project;
  totals: Totals;
}

export function DocumentEstimate({ project, totals }: DocumentEstimateProps) {
  const lineItems = project.lineItems || [];

  return (
    <div className="space-y-8">
      {/* Ruled Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-rule-strong text-xs font-mono uppercase tracking-wider text-ink-muted">
              <th className="py-3 pr-4 font-medium">Description</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium text-right">Hours</th>
              <th className="py-3 px-4 font-medium text-right">Rate</th>
              <th className="py-3 pl-4 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {lineItems.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-ink-muted font-mono text-xs uppercase tracking-wider"
                >
                  No line items in this estimate
                </td>
              </tr>
            ) : (
              lineItems.map((item) => {
                const amount = item.estimatedHours * item.hourlyRate;
                return (
                  <tr key={item.id} className="h-12 text-ink">
                    <td className="py-3 pr-4 font-medium">
                      {item.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-ink-muted uppercase">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right">
                      {item.estimatedHours}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-ink-muted">
                      ${item.hourlyRate}/hr
                    </td>
                    <td className="py-3 pl-4 font-mono tabular-nums text-right font-medium">
                      ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      {item.isRecurring && (
                        <span className="text-xs text-ink-muted ml-1">/mo</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary section */}
      <div className="flex justify-end pt-4">
        <div className="w-full sm:w-80 space-y-3 font-mono text-sm">
          <div className="flex justify-between items-center text-ink">
            <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">
              Base cost
            </span>
            <span className="tabular-nums">
              ${totals.base.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between items-center text-ink">
            <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">
              Contingency ({project.contingencyPercentage}%)
            </span>
            <span className="tabular-nums">
              ${totals.contingency.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex justify-between items-center text-ink">
            <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">
              Profit margin ({project.profitMargin}%)
            </span>
            <span className="tabular-nums">
              ${totals.margin.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {totals.recurringMonthly > 0 && (
            <div className="flex justify-between items-center text-ink">
              <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">
                Recurring / mo
              </span>
              <span className="tabular-nums">
                ${totals.recurringMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          )}

          <div className="pt-2">
            <Rule strong />
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">
              Total
            </span>
            <span className="text-5xl font-mono font-semibold tabular-nums text-accent">
              ${totals.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


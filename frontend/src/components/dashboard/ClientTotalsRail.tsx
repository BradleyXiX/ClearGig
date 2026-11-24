import React from "react";

export interface ClientTotalItem {
  id: string;
  name: string;
  total: number;
  recurringMonthly: number;
}

export interface ClientTotalsRailProps {
  clientTotals: ClientTotalItem[];
  loading: boolean;
}

export function ClientTotalsRail({ clientTotals, loading }: ClientTotalsRailProps) {
  return (
    <div className="w-full">
      <div className="border border-rule rounded-panel bg-paper p-5 sm:p-6 shadow-xs">
        <div className="border-b border-rule pb-3 mb-4">
          <h2 className="text-xs font-mono font-medium uppercase tracking-wider text-ink-muted">
            Client totals
          </h2>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Cumulative estimates across active accounts.
          </p>
        </div>

        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-rule text-xs font-mono font-medium uppercase tracking-wider text-ink-muted">
              <th scope="col" className="pb-2.5 pr-4">Client</th>
              <th scope="col" className="pb-2.5 pl-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule font-sans">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="h-12 bg-paper animate-pulse" aria-hidden="true">
                  <td className="py-3 pr-4">
                    <div className="h-4 bg-paper-sunken rounded-control w-28" />
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <div className="h-4 bg-paper-sunken rounded-control w-16 ml-auto" />
                  </td>
                </tr>
              ))
            ) : clientTotals.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-6 text-center text-sm text-ink-muted">
                  No client accounts recorded.
                </td>
              </tr>
            ) : (
              clientTotals.map((c) => (
                <tr key={c.id} className="h-12 hover:bg-paper-sunken/40 transition-colors duration-150">
                  <td className="py-3 pr-4 text-sm font-medium text-ink break-words max-w-40">
                    {c.name}
                  </td>
                  <td className="py-3 pl-4 text-right whitespace-nowrap">
                    <div className="font-mono text-sm font-semibold text-ink tabular-nums">
                      ${c.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                    {c.recurringMonthly > 0 && (
                      <div className="text-xs font-mono text-ink-muted tabular-nums">
                        +${c.recurringMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

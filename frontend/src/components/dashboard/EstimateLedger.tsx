import React from "react";
import Link from "next/link";
import type { Project } from "@/services/api";
import { computeTotals } from "@/lib/totals";
import { Stamp } from "@/components/ui/Stamp";

export interface EstimateLedgerProps {
  projects: Project[];
  clientMap: Map<string, string>;
  loading: boolean;
}

export function EstimateLedger({ projects, clientMap, loading }: EstimateLedgerProps) {
  return (
    <div className="w-full">
      <div className="border border-rule rounded-panel bg-paper overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-rule bg-paper-sunken/40 text-xs font-mono font-medium uppercase tracking-wider text-ink-muted">
                <th scope="col" className="py-3 px-4 sm:px-6">Description</th>
                <th scope="col" className="py-3 px-4">Client</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4 text-right">Totals</th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule font-sans">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="h-16 bg-paper animate-pulse" aria-hidden="true">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="h-4 bg-paper-sunken rounded-control w-3/4 mb-2" />
                      <div className="h-3 bg-paper-sunken rounded-control w-1/2" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-paper-sunken rounded-control w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-paper-sunken rounded-control w-16" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-4 bg-paper-sunken rounded-control w-20 ml-auto" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="h-3 bg-paper-sunken rounded-control w-14 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <p className="text-base font-medium text-ink">No estimates recorded</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Create your first estimate to account for scope, rates and deliverables.
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-control bg-ink text-on-dark font-medium text-sm hover:bg-ink-muted focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 transition-colors duration-150"
                      >
                        Create estimate
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const totals = computeTotals(p);
                  const clientName = p.client?.name ?? clientMap.get(p.clientId) ?? "—";
                  const updatedDate = new Date(p.updatedAt || p.createdAt);
                  const updatedFormatted = updatedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: updatedDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                  });

                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors duration-150 hover:bg-paper-sunken/50 focus-within:bg-paper-sunken/60"
                    >
                      {/* Description column with genuine accessible link */}
                      <td className="py-4 px-4 sm:px-6 max-w-xs sm:max-w-sm">
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-semibold text-sm text-ink group-hover:text-forest transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control block break-words"
                        >
                          {p.title}
                        </Link>
                        <div className="text-xs text-ink-muted font-mono mt-0.5 sm:hidden">
                          {clientName}
                        </div>
                      </td>

                      {/* Client column */}
                      <td className="py-4 px-4 text-sm text-ink-muted break-words max-w-36">
                        {clientName}
                      </td>

                      {/* Status stamp */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Stamp status={p.status} />
                      </td>

                      {/* Explicit one-time and recurring metrics */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="font-mono text-base font-semibold text-ink tabular-nums">
                          ${totals.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </div>
                        {totals.recurringMonthly > 0 ? (
                          <div className="text-xs font-mono text-ink-muted tabular-nums mt-0.5">
                            +${totals.recurringMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo recurring
                          </div>
                        ) : (
                          <div className="text-xs font-mono text-ink-muted mt-0.5">
                            one-time
                          </div>
                        )}
                      </td>

                      {/* Updated date */}
                      <td className="py-4 px-4 sm:px-6 text-right font-mono text-xs text-ink-muted whitespace-nowrap">
                        {updatedFormatted}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

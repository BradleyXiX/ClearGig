'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api, type Project, type Client } from '@/services/api';
import { computeTotals } from '@/lib/totals';
import { Stamp } from '@/components/ui/Stamp';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProjects(), api.getClients()]).then(([pData, cData]) => {
      setProjects(pData);
      setClients(cData);
      setLoading(false);
    });
  }, []);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.name);
    return map;
  }, [clients]);

  const clientTotals = useMemo(() => {
    const totalsByClient = new Map<string, number>();
    for (const p of projects) {
      const t = computeTotals(p);
      totalsByClient.set(p.clientId, (totalsByClient.get(p.clientId) ?? 0) + t.total);
    }
    return clients
      .map((c) => ({
        id: c.id,
        name: c.name,
        total: totalsByClient.get(c.id) ?? 0,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [clients, projects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Estimates
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Estimates Ledger */}
        <div className="lg:col-span-2">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-rule text-xs font-medium uppercase tracking-wider text-ink-muted">
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 px-4">Client</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4 text-right">Total</th>
                  <th className="py-2 pl-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="h-12 bg-paper-sunken animate-pulse">
                      <td colSpan={5} />
                    </tr>
                  ))
                ) : projects.length === 0 ? (
                  <tr className="h-12">
                    <td colSpan={5} className="py-4 text-center text-sm text-ink-muted">
                      No estimates recorded.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => {
                    const totals = computeTotals(p);
                    const clientName = p.client?.name ?? clientMap.get(p.clientId) ?? "—";
                    const updated = new Date(p.updatedAt || p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <tr
                        key={p.id}
                        onClick={() => router.push(`/projects/${p.id}`)}
                        className="h-12 cursor-pointer hover:bg-paper-sunken transition-colors duration-150"
                      >
                        <td className="py-3 pr-4 font-medium text-sm text-ink truncate max-w-xs">
                          {p.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-ink-muted">
                          {clientName}
                        </td>
                        <td className="py-3 px-4">
                          <Stamp status={p.status} />
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-sm font-medium text-ink">
                          ${totals.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 pl-4 text-right font-mono tabular-nums text-sm text-ink-muted">
                          {updated}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Totals Rail */}
        <div>
          <div className="border border-rule rounded-card bg-paper-raised p-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted mb-4">
              Client totals
            </h2>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-rule text-xs font-medium uppercase tracking-wider text-ink-muted">
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pl-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="h-12 bg-paper-sunken animate-pulse">
                      <td colSpan={2} />
                    </tr>
                  ))
                ) : clientTotals.length === 0 ? (
                  <tr className="h-12">
                    <td colSpan={2} className="py-4 text-center text-sm text-ink-muted">
                      No client totals.
                    </td>
                  </tr>
                ) : (
                  clientTotals.map((c) => (
                    <tr key={c.id} className="h-12">
                      <td className="py-3 pr-4 text-sm text-ink">{c.name}</td>
                      <td className="py-3 pl-4 text-right font-mono tabular-nums text-sm font-medium text-ink">
                        ${c.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

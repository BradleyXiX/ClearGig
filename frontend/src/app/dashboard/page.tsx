"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api, type Project, type Client } from "@/services/api";
import { computeTotals } from "@/lib/totals";
import { EstimateLedger } from "@/components/dashboard/EstimateLedger";
import { ClientTotalsRail, type ClientTotalItem } from "@/components/dashboard/ClientTotalsRail";
import { DashboardError } from "@/components/dashboard/DashboardError";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.getProjects(), api.getClients()])
      .then(([pData, cData]) => {
        if (cancelled) return;
        setProjects(pData);
        setClients(cData);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Without this the page sat on its skeleton forever: "database is
        // offline" and "no estimates yet" looked identical.
        setError(err instanceof Error ? err.message : "Could not load estimates.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.name);
    return map;
  }, [clients]);

  const clientTotals = useMemo<ClientTotalItem[]>(() => {
    const totalsByClient = new Map<string, { total: number; recurringMonthly: number }>();
    for (const p of projects) {
      const t = computeTotals(p);
      const existing = totalsByClient.get(p.clientId) ?? { total: 0, recurringMonthly: 0 };
      totalsByClient.set(p.clientId, {
        total: existing.total + t.total,
        recurringMonthly: existing.recurringMonthly + t.recurringMonthly,
      });
    }
    return clients
      .map((c) => {
        const item = totalsByClient.get(c.id) ?? { total: 0, recurringMonthly: 0 };
        return {
          id: c.id,
          name: c.name,
          total: item.total,
          recurringMonthly: item.recurringMonthly,
        };
      })
      .filter((c) => c.total > 0 || c.recurringMonthly > 0)
      .sort((a, b) => b.total - a.total);
  }, [clients, projects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Dashboard Header Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-rule">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink font-sans">
            Estimates
          </h1>
          <p className="mt-1 text-sm sm:text-base text-ink-muted font-sans">
            Your work, clearly accounted for.
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-control bg-ink text-on-dark font-medium text-sm hover:bg-ink-muted focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 transition-colors duration-150 shadow-xs"
          >
            New estimate
          </Link>
        </div>
      </div>

      {error ? (
        <DashboardError error={error} onRetry={handleRetry} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Estimates Ledger: 8/12 Columns */}
          <div className="lg:col-span-8">
            <EstimateLedger
              projects={projects}
              clientMap={clientMap}
              loading={loading}
            />
          </div>

          {/* Client Totals Rail: 4/12 Columns */}
          <div className="lg:col-span-4">
            <ClientTotalsRail
              clientTotals={clientTotals}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

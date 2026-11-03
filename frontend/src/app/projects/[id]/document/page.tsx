'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Project } from '@/services/api';
import { computeTotals } from '@/lib/totals';
import { folio } from '@/lib/folio';
import { DocumentShell } from '@/components/DocumentShell';
import { DocumentEstimate } from '@/components/DocumentEstimate';
import { DocumentAudit } from '@/components/DocumentAudit';
import { Button } from '@/components/ui/Button';

function DocumentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const variant = searchParams.get('variant');

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        const data = await api.getProjectById(id);
        if (!cancelled) {
          setProject(data);
        }
      } catch (err) {
        if (!cancelled) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <DocumentShell
        folioNumber="—"
        title="Loading estimate..."
        clientName="—"
      >
        <div className="space-y-4 py-4">
          <div className="h-10 bg-paper-sunken rounded-control animate-pulse" />
          <div className="h-10 bg-paper-sunken rounded-control animate-pulse" />
          <div className="h-10 bg-paper-sunken rounded-control animate-pulse" />
          <div className="h-10 bg-paper-sunken rounded-control animate-pulse" />
        </div>
      </DocumentShell>
    );
  }

  if (notFound || !project) {
    return (
      <div className="max-w-4xl mx-auto p-8 sm:p-12 text-center text-ink">
        <h1 className="text-2xl font-semibold mb-4">
          This estimate does not exist.
        </h1>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-accent hover:underline"
        >
          Return to dashboard
        </Link>
      </div>
    );
  }

  const totals = computeTotals(project);
  const folioNumber = folio(project);
  const clientName = project.client?.name || 'Untitled Client';
  const isAudit = variant === 'audit';

  return (
    <div>
      {/* Top print/navigation toolbar - hidden in print */}
      <div className="no-print max-w-4xl mx-auto px-8 sm:px-12 pt-6 flex items-center justify-between">
        <Link
          href={`/projects/${id}`}
          className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink transition-colors duration-150"
        >
          ← Back to estimate
        </Link>
        <Button variant="primary" size="sm" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <DocumentShell
        folioNumber={folioNumber}
        title={isAudit ? `${project.title} — FinOps Audit` : project.title}
        clientName={clientName}
      >
        {isAudit ? (
          <DocumentAudit
            defaultMonthlySpend={
              totals.recurringMonthly > 0 ? totals.recurringMonthly : 12500
            }
          />
        ) : (
          <DocumentEstimate project={project} totals={totals} />
        )}
      </DocumentShell>
    </div>
  );
}

export default function DocumentPage() {
  return (
    <Suspense
      fallback={
        <DocumentShell
          folioNumber="—"
          title="Loading..."
          clientName="—"
        >
          <div className="space-y-4 py-4">
            <div className="h-10 bg-paper-sunken rounded-control animate-pulse" />
            <div className="h-10 bg-paper-sunken rounded-control animate-pulse" />
          </div>
        </DocumentShell>
      }
    >
      <DocumentContent />
    </Suspense>
  );
}


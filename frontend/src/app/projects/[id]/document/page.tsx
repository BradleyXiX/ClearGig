'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError, type Project } from '@/services/api';
import { computeTotals } from '@/lib/totals';
import { folio } from '@/lib/folio';
import { DocumentShell } from '@/components/DocumentShell';
import { DocumentEstimate } from '@/components/DocumentEstimate';
import { DocumentAudit } from '@/components/DocumentAudit';
import { Button } from '@/components/ui/Button';
import { parseAuditScenario } from '@/lib/audit-scenario';

type LoadErrorType = 'not_found' | 'network' | 'server_error' | 'unavailable' | 'unknown' | null;

function DocumentContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const variant = searchParams.get('variant');

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<LoadErrorType>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      setIsLoading(true);
      setErrorType(null);
      setErrorMessage(null);
      try {
        const data = await api.getProjectById(id);
        if (!cancelled) {
          setProject(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            if (err.status === 404) {
              setErrorType('not_found');
              setErrorMessage(`Estimate "${id}" does not exist in the ledger.`);
            } else if (err.status === 503 || err.code === 'DB_UNAVAILABLE') {
              setErrorType('unavailable');
              setErrorMessage('Service temporarily unavailable. Unable to reach database.');
            } else if (err.status >= 500) {
              setErrorType('server_error');
              setErrorMessage(`Server error (${err.status}): ${err.message}`);
            } else {
              setErrorType('unknown');
              setErrorMessage(err.message);
            }
          } else if (err instanceof TypeError || (err instanceof Error && err.name === 'TypeError')) {
            setErrorType('network');
            setErrorMessage('Network connection failed. Check your internet connection or proxy.');
          } else if (err instanceof Error) {
            setErrorType('unknown');
            setErrorMessage(err.message);
          } else {
            setErrorType('unknown');
            setErrorMessage('Failed to load estimate.');
          }
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
  }, [id, loadAttempt]);

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

  // HTTP 404: Estimate explicitly not found
  if (errorType === 'not_found') {
    return (
      <div className="max-w-4xl mx-auto p-8 sm:p-12 text-center text-ink space-y-4">
        <h1 className="text-2xl font-semibold">
          This estimate does not exist.
        </h1>
        <p className="text-sm text-ink-muted">
          {errorMessage ?? `Estimate "${id}" does not exist in the ledger.`}
        </p>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center font-sans rounded-control font-medium h-9 px-4 py-2 text-xs uppercase tracking-wider bg-ink text-paper hover:bg-forest transition-colors duration-150"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Network / 5xx / Service Unavailable / Connection rejections: Truthful retryable error screen
  if (errorType) {
    return (
      <div className="max-w-4xl mx-auto p-8 sm:p-12 text-center text-ink space-y-4">
        <h1 className="text-2xl font-semibold">
          {errorType === 'network'
            ? 'Network connection failed'
            : errorType === 'server_error'
            ? 'Server error'
            : 'Service temporarily unavailable'}
        </h1>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          {errorMessage ?? 'Unable to connect to the ClearGig service.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="primary" onClick={() => setLoadAttempt((a) => a + 1)}>
            Retry connection
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center font-sans rounded-control font-medium h-11 px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-paper-sunken transition-colors duration-150"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-8 sm:p-12 text-center text-ink space-y-4">
        <h1 className="text-2xl font-semibold">
          This estimate does not exist.
        </h1>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center font-sans rounded-control font-medium h-9 px-4 py-2 text-xs uppercase tracking-wider bg-ink text-paper hover:bg-forest transition-colors duration-150"
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

  const defaultSpend = totals.recurringMonthly > 0 ? totals.recurringMonthly : 12500;
  const validatedScenario = parseAuditScenario(searchParams, {
    defaultMonthlySpend: defaultSpend,
  });

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
            defaultMonthlySpend={validatedScenario.monthlySpend}
            savingsRate={validatedScenario.savingsRate}
          />
        ) : (
          <DocumentEstimate project={project} totals={totals} />
        )}
      </DocumentShell>
    </div>
  );
}

export default function DocumentPage() {
  const params = useParams();
  const id = params?.id as string;

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
      <DocumentContent key={id} id={id} />
    </Suspense>
  );
}


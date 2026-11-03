import React from 'react';

export interface DocumentShellProps {
  folioNumber: string;
  title: string;
  clientName: string;
  date?: string;
  children: React.ReactNode;
}

export function DocumentShell({
  folioNumber,
  title,
  clientName,
  date,
  children,
}: DocumentShellProps) {
  const displayDate =
    date ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <article className="max-w-4xl mx-auto p-8 sm:p-12 text-ink bg-paper">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-8 border-b border-rule">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            Client: {clientName}
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mt-1">
            {title}
          </h1>
        </div>
        <div className="text-left sm:text-right font-mono text-xs uppercase tracking-wider text-ink-muted space-y-1">
          <div>
            Folio: <span className="text-ink font-medium">{folioNumber}</span>
          </div>
          <div>
            Date: <span className="text-ink font-medium">{displayDate}</span>
          </div>
        </div>
      </header>

      {/* Document Body */}
      <main className="py-8">{children}</main>

      {/* Bottom Signature Section */}
      <footer className="pt-12 mt-12 border-t border-rule">
        <div className="w-48 border-b border-rule pb-1" />
        <p className="text-xs uppercase tracking-wider text-ink-muted pt-2 font-mono">
          Authorized signature
        </p>
      </footer>
    </article>
  );
}


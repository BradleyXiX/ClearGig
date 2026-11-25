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
    <article className="document-sheet max-w-4xl mx-auto p-8 sm:p-12 print:p-0 print:max-w-none text-ink bg-paper print:bg-transparent">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 print:pb-4 border-b border-rule print:break-inside-avoid">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-muted block break-words">
            Client: {clientName}
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mt-1 break-words">
            {title}
          </h1>
        </div>
        <div className="text-left sm:text-right font-mono text-xs uppercase tracking-wider text-ink-muted space-y-1 shrink-0">
          <div>
            Folio: <span className="text-ink font-medium">{folioNumber}</span>
          </div>
          <div>
            Date: <span className="text-ink font-medium">{displayDate}</span>
          </div>
        </div>
      </header>

      {/* Document Body */}
      <div className="document-body py-6 print:py-4">{children}</div>

      {/* Bottom Signature Section */}
      <footer className="document-signature pt-8 mt-8 print:pt-6 print:mt-6 border-t border-rule print:break-inside-avoid">
        <div className="w-48 border-b border-rule pb-1" />
        <p className="text-xs uppercase tracking-wider text-ink-muted pt-2 font-mono">
          Authorized signature
        </p>
      </footer>
    </article>
  );
}


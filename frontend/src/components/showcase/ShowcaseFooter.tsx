import React from "react";
import Link from "next/link";
import { BrandMark } from "../ui/BrandMark";

export function ShowcaseFooter() {
  return (
    <footer className="w-full bg-dark-canvas text-on-dark border-t border-rule-strong no-print py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Light wordmark and core phrase */}
          <div className="space-y-2">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-on-dark hover:text-focus-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark focus-visible:ring-offset-2 rounded-control outline-none py-1"
              aria-label="ClearGig home"
            >
              <BrandMark size={20} className="text-on-dark" />
              <span>ClearGig</span>
            </Link>
            <p className="text-sm font-mono text-on-dark-muted">
              Clarity before commitment.
            </p>
          </div>

          {/* Genuine application and showcase links (no fake legal/terms destinations) */}
          <nav
            className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm font-medium text-on-dark-muted"
            aria-label="Showcase footer navigation"
          >
            <Link
              href="/"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              New estimate
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              Workspace
            </Link>
            <a
              href="#approach"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              The approach
            </a>
            <a
              href="#workspace"
              className="hover:text-on-dark transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus-dark rounded-control outline-none py-1"
            >
              Inside ClearGig
            </a>
          </nav>
        </div>

        {/* Bottom copyright and public preview disclosure */}
        <div className="border-t border-rule-strong/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-on-dark-muted">
          <div>© 2026 ClearGig. All rights reserved.</div>
          <div>Workflow preview · No pricing shown.</div>
        </div>
      </div>
    </footer>
  );
}

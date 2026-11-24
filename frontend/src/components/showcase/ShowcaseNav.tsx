import React from "react";
import Link from "next/link";
import { BrandMark } from "../ui/BrandMark";

export function ShowcaseNav() {
  return (
    <header className="no-print w-full border-b border-rule bg-canvas sticky top-0 z-40 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between min-h-14 py-2 sm:py-0 gap-y-2 gap-x-4">
        <div className="flex items-center gap-4 sm:gap-8 min-h-10">
          <Link
            href="/showcase"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink hover:text-forest transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none py-1 shrink-0"
            aria-label="ClearGig Showcase home"
          >
            <BrandMark size={20} className="text-ink" />
            <span>ClearGig</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6" aria-label="Showcase Sections">
            <a
              href="#overview"
              className="text-sm py-1.5 text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none"
            >
              Overview
            </a>
            <a
              href="#approach"
              className="text-sm py-1.5 text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none"
            >
              Approach
            </a>
            <a
              href="#workspace"
              className="text-sm py-1.5 text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none"
            >
              Workspace
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 min-h-10 shrink-0">
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-medium text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none px-2 py-1"
          >
            Workspace
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-3 py-1.5 text-xs uppercase tracking-wider font-medium h-9 bg-ink text-paper hover:bg-forest"
          >
            Build an estimate
          </Link>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { BrandMark } from "../ui/BrandMark";

export function ShowcaseNav() {
  return (
    <header className="no-print w-full border-b border-rule bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between min-h-16 sm:min-h-20 py-3 sm:py-0">
        <div className="flex items-center gap-6 sm:gap-10">
          <Link
            href="/showcase"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-ink hover:text-forest transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none py-1 shrink-0"
            aria-label="ClearGig Showcase home"
          >
            <BrandMark size={20} className="text-ink" />
            <span>ClearGig</span>
          </Link>

          {/* Desktop anchor navigation matching Section 5A; omitted on mobile to prevent crowding */}
          <nav className="hidden sm:flex items-center gap-8" aria-label="Showcase Sections">
            <a
              href="#approach"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none py-1"
            >
              The approach
            </a>
            <a
              href="#workspace"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none py-1"
            >
              Inside ClearGig
            </a>
          </nav>
        </div>

        {/* Quiet Open workspace action matching Section 5A (Build an estimate is owned by Hero) */}
        <div className="flex items-center shrink-0">
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-medium text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none px-3 py-1.5"
          >
            Open workspace
          </Link>
        </div>
      </div>
    </header>
  );
}

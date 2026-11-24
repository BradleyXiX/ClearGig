"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./ui/BrandMark";

export function BrandBar() {
  const pathname = usePathname();

  const isEstimatesActive =
    pathname === "/dashboard" || pathname.startsWith("/projects");
  const isNewActive = pathname === "/";
  const isShowcaseActive = pathname === "/showcase";

  return (
    <header className="no-print w-full border-b border-rule bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between min-h-14 py-2 sm:py-0 gap-y-2 gap-x-3">
        <div className="flex items-center gap-3 sm:gap-6 min-h-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink hover:text-forest transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none py-1 shrink-0"
          >
            <BrandMark size={20} className="text-ink" />
            <span>ClearGig</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6" aria-label="Main Navigation">
            <Link
              href="/dashboard"
              className={`text-sm py-1.5 border-b-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 outline-none ${
                isEstimatesActive
                  ? "border-forest text-ink font-medium"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Estimates
            </Link>
            <Link
              href="/showcase"
              className={`text-sm py-1.5 border-b-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 outline-none ${
                isShowcaseActive
                  ? "border-forest text-ink font-medium"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Showcase
            </Link>
          </nav>
        </div>
        <div className="flex items-center min-h-10 shrink-0">
          <Link
            href="/"
            className={`inline-flex items-center justify-center font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-3 py-1.5 text-xs uppercase tracking-wider font-medium h-9 ${
              isNewActive
                ? "bg-forest text-paper"
                : "bg-ink text-paper hover:bg-forest"
            }`}
          >
            New estimate
          </Link>
        </div>
      </div>
    </header>
  );
}

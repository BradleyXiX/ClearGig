"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/Button";

export function BrandBar() {
  const pathname = usePathname();

  const isEstimatesActive =
    pathname === "/dashboard" || pathname.startsWith("/projects");
  const isNewActive = pathname === "/";

  return (
    <header className="no-print w-full border-b border-rule bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-8 h-full">
          <Link
            href="/dashboard"
            className="text-base font-semibold tracking-tight text-ink"
          >
            ClearGig
          </Link>
          <nav className="flex items-center gap-6 h-full">
            <Link
              href="/dashboard"
              className={`text-sm h-full flex items-center border-b-2 transition-colors duration-150 ${
                isEstimatesActive
                  ? "border-accent text-ink font-medium"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Estimates
            </Link>
          </nav>
        </div>
        <div className="flex items-center h-full">
          <div
            className={`h-full flex items-center border-b-2 ${
              isNewActive ? "border-accent" : "border-transparent"
            }`}
          >
            <Link href="/">
              <Button variant="primary" size="sm">
                New estimate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}


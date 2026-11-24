import React from "react";
import type { Metadata } from "next";
import { ShowcaseNav } from "@/components/showcase/ShowcaseNav";
import { Hero } from "@/components/showcase/Hero";

export const metadata: Metadata = {
  title: "ClearGig — Project Estimates, Considered",
  description:
    "Bring your scope, rates and recurring costs into one considered estimate. Ready for the next client conversation.",
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-accent-wash selection:text-forest">
      {/* Keyboard skip link for accessibility */}
      <a
        href="#showcase-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-forest focus:text-paper focus:rounded-control focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* Showcase dedicated navigation */}
      <ShowcaseNav />

      {/* Main showcase container */}
      <main id="showcase-main" className="flex-1">
        <Hero />
      </main>

      {/* Minimal static showcase footer */}
      <footer className="w-full bg-dark-canvas text-on-dark-muted py-8 border-t border-rule-strong no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div>ClearGig · Clarity before commitment.</div>
          <div>Workflow preview · No pricing shown.</div>
        </div>
      </footer>
    </div>
  );
}

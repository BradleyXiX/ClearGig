import React from "react";
import Link from "next/link";

export function DocumentStory() {
  return (
    <div className="mt-16 sm:mt-24 pt-12 border-t border-rule">
      <div className="space-y-3 mb-8 sm:mb-10">
        <span className="text-xs font-mono font-medium uppercase tracking-wider text-forest block">
          DOCUMENT ANATOMY
        </span>
        <h3 className="text-2xl sm:text-3xl font-sans tracking-tight text-ink">
          From scope definition{" "}
          <span className="font-serif-display font-normal block sm:inline">
            to a finished deliverable.
          </span>
        </h3>
        <p className="text-sm sm:text-base text-ink-muted max-w-2xl leading-relaxed">
          Estimate and FinOps documents share a clean, high-contrast typography system designed for browser print and PDF export. Every category, deliverable and assumption is accounted for before commitment.
        </p>
      </div>

      {/* Warm muted surface containing two slightly offset sheets */}
      <div className="bg-canvas border border-rule rounded-panel p-4 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Sheet 1: Estimate Document */}
          <article
            className="bg-paper border border-rule rounded-card p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 sm:space-y-8 transform-gpu lg:-rotate-1 transition-transform duration-200 hover:rotate-0 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:transform-none"
            aria-label="Sample Estimate Document Anatomy"
          >
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b border-rule pb-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                  <span>FOLIO: CG-2026-E042</span>
                  <span className="px-2 py-0.5 rounded-control bg-paper-sunken border border-rule text-ink font-semibold">
                    ESTIMATE
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-sans font-semibold text-ink tracking-tight">
                  Website Refresh & Architecture
                </h4>
                <div className="text-xs font-mono text-ink-muted">
                  Client: Northline Studio · Status: Ready to review
                </div>
              </div>

              {/* Anatomy Sections */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-ink-muted block">
                    01 Workstreams & Deliverables
                  </span>
                  <div className="space-y-1.5 text-xs text-ink font-mono bg-paper-sunken p-3 rounded-control border border-rule">
                    <div className="flex justify-between items-center py-1 border-b border-rule/50">
                      <span className="font-medium">Frontend Interface & Systems</span>
                      <span className="text-forest font-semibold">Scope confirmed</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-medium">Backend API Integration</span>
                      <span className="text-forest font-semibold">Scope confirmed</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-ink-muted block">
                    02 Structure & Adjustments
                  </span>
                  <div className="space-y-1.5 text-xs text-ink font-mono bg-paper-sunken p-3 rounded-control border border-rule">
                    <div className="flex justify-between items-center py-1 border-b border-rule/50">
                      <span>Delivery Structure</span>
                      <span className="font-medium">One-time delivery + ongoing support</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>Risk Mitigation</span>
                      <span className="font-medium">Contingency considered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer Signoff Preview */}
            <div className="pt-4 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-ink-muted">
              <span>Browser print · Save to PDF ready</span>
              <span className="text-forest font-medium">Prepared for client review</span>
            </div>
          </article>

          {/* Sheet 2: FinOps Scenario Document */}
          <article
            className="bg-paper border border-rule rounded-card p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 sm:space-y-8 transform-gpu lg:rotate-1 transition-transform duration-200 hover:rotate-0 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:transform-none"
            aria-label="Sample FinOps Audit Scenario Document Anatomy"
          >
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b border-rule pb-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                  <span>FOLIO: CG-2026-A018</span>
                  <span className="px-2 py-0.5 rounded-control bg-brass/20 border border-brass/40 text-brass-ink font-semibold">
                    FINOPS SCENARIO
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-sans font-semibold text-ink tracking-tight">
                  Infrastructure Capacity & Audit
                </h4>
                <div className="text-xs font-mono text-ink-muted">
                  Client: Stratos Systems · Status: Scenario modelled
                </div>
              </div>

              {/* Anatomy Sections */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-ink-muted block">
                    01 Audit Focus Areas
                  </span>
                  <div className="space-y-1.5 text-xs text-ink font-mono bg-paper-sunken p-3 rounded-control border border-rule">
                    <div className="flex justify-between items-center py-1 border-b border-rule/50">
                      <span className="font-medium">Compute Resource Utilization</span>
                      <span className="text-brass-ink font-semibold">Assumptions mapped</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="font-medium">Storage Tiering & Data Transfer</span>
                      <span className="text-brass-ink font-semibold">Assumptions mapped</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-ink-muted block">
                    02 Scenario Parameters
                  </span>
                  <div className="space-y-1.5 text-xs text-ink font-mono bg-paper-sunken p-3 rounded-control border border-rule">
                    <div className="flex justify-between items-center py-1 border-b border-rule/50">
                      <span>Evaluation Baseline</span>
                      <span className="font-medium">Multi-region cloud profile</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>Projection Model</span>
                      <span className="font-medium">Illustrative optimization scenario</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer Signoff Preview */}
            <div className="pt-4 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-ink-muted">
              <span>Illustrative baseline · Not live cloud verification</span>
              <span className="text-brass-ink font-medium">Scenario projection</span>
            </div>
          </article>
        </div>

        {/* Section 5E Mandatory Caption and Modest Link */}
        <div className="mt-8 pt-6 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-ink-muted text-center sm:text-left">
          <p className="max-w-xl">
            Illustrative document structure. Financial values appear in your working estimate.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 font-sans font-medium text-ink hover:text-forest transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control outline-none px-3 py-1.5 border border-rule bg-paper hover:bg-paper-sunken"
          >
            <span>Open workspace</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

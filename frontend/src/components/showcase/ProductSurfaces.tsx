"use client";

import React, { useState } from "react";
import { DocumentStory } from "./DocumentStory";

type FeatureKey = "scope" | "recurring" | "adjustments" | "document" | null;

interface FixtureProject {
  id: string;
  name: string;
  client: string;
  type: "Estimate" | "FinOps Audit";
  scope: string;
  structure: string;
  adjustment: string;
  status: "Ready to review" | "In progress" | "Scenario modelled" | "Completed";
  statusTone: "forest" | "sunken" | "brass" | "muted";
}

const FIXTURE_PROJECTS: FixtureProject[] = [
  {
    id: "cg-01",
    name: "Website refresh",
    client: "Northline Studio",
    type: "Estimate",
    scope: "Frontend + backend architecture",
    structure: "One-time + recurring maintenance",
    adjustment: "Contingency considered",
    status: "Ready to review",
    statusTone: "forest",
  },
  {
    id: "cg-02",
    name: "Product build",
    client: "Acme Platform Co.",
    type: "Estimate",
    scope: "Interface + platform services",
    structure: "Milestone-based delivery",
    adjustment: "Standard allowance",
    status: "In progress",
    statusTone: "sunken",
  },
  {
    id: "cg-03",
    name: "Cloud infrastructure audit",
    client: "Stratos Systems",
    type: "FinOps Audit",
    scope: "Compute & storage efficiency",
    structure: "Scenario projection model",
    adjustment: "Risk allowance considered",
    status: "Scenario modelled",
    statusTone: "brass",
  },
  {
    id: "cg-04",
    name: "Brand & design system",
    client: "Kite & Anchor",
    type: "Estimate",
    scope: "Design tokens + UI components",
    structure: "Sprint-based delivery",
    adjustment: "Buffer considered",
    status: "Completed",
    statusTone: "muted",
  },
];

const FEATURES: Array<{
  key: FeatureKey;
  title: string;
  topic: string;
  description: string;
}> = [
  {
    key: "scope",
    title: "Keep scope visible",
    topic: "Line-item categories & workstreams",
    description:
      "Break projects into explicit, observable workstreams. Every deliverable and rate category is accounted for before work begins.",
  },
  {
    key: "recurring",
    title: "Separate recurring costs",
    topic: "Monthly vs one-time structure",
    description:
      "Isolate ongoing maintenance, cloud subscriptions and retained support from one-time milestone commitments.",
  },
  {
    key: "adjustments",
    title: "Review adjustments",
    topic: "Contingency & margin allowances",
    description:
      "Apply transparent risk allowances and contingency factors without disguising them inside labor line items.",
  },
  {
    key: "document",
    title: "Prepare a document",
    topic: "Print & PDF export workflow",
    description:
      "Export considered estimates and FinOps audit summaries directly via browser print or PDF for client review.",
  },
];

export function ProductSurfaces() {
  const [activeFeature, setActiveFeature] = useState<FeatureKey>(null);

  return (
    <section
      id="workspace"
      className="w-full bg-paper text-ink py-16 sm:py-24 border-t border-rule"
      aria-labelledby="workspace-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-forest block">
            BUILT AROUND THE WORK
          </span>
          <h2
            id="workspace-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-sans tracking-tight text-ink leading-tight"
          >
            The details,{" "}
            <span className="font-serif-display font-normal block sm:inline">
              in order.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
            A focused workspace for the estimate and the conversation that follows.
          </p>
        </div>

        {/* Asymmetric 8/12 and 4/12 Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-12 sm:mt-16 items-start">
          {/* 8/12 Columns: DOM Dashboard Preview */}
          <div
            className="lg:col-span-8 bg-paper-sunken border border-rule rounded-panel p-4 sm:p-6 shadow-sm space-y-4"
            aria-label="Sample workspace preview"
          >
            {/* Workspace Shell Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rule">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-control bg-paper border border-rule text-xs font-mono font-semibold text-ink uppercase tracking-wider">
                  Sample workspace
                </span>
                <span className="text-xs font-mono text-ink-muted hidden sm:inline">
                  Illustrative records · No live data
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
                <span className="px-2 py-0.5 rounded-control bg-paper border border-rule text-ink font-medium">
                  Estimates (3)
                </span>
                <span className="px-2 py-0.5 rounded-control bg-paper border border-rule text-ink font-medium">
                  FinOps (1)
                </span>
              </div>
            </div>

            {/* Project Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-rule text-ink-muted uppercase tracking-wider">
                    <th scope="col" className="py-2.5 pr-4 font-medium">
                      Project & Client
                    </th>
                    <th scope="col" className="py-2.5 px-3 font-medium">
                      Document Type
                    </th>
                    <th scope="col" className="py-2.5 px-3 font-medium">
                      Scope & Structure
                    </th>
                    <th scope="col" className="py-2.5 pl-3 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 text-ink">
                  {FIXTURE_PROJECTS.map((proj) => {
                    const isScopeHighlighted = activeFeature === "scope";
                    const isRecurringHighlighted = activeFeature === "recurring";
                    const isAdjustmentsHighlighted = activeFeature === "adjustments";
                    const isDocumentHighlighted = activeFeature === "document";

                    return (
                      <tr
                        key={proj.id}
                        className={`transition-colors duration-150 ${
                          isDocumentHighlighted && proj.type === "Estimate"
                            ? "bg-accent-wash/60"
                            : isScopeHighlighted
                            ? "bg-paper-raised"
                            : "hover:bg-paper-raised/80"
                        }`}
                      >
                        <td className="py-3.5 pr-4">
                          <div className="font-sans font-semibold text-sm text-ink tracking-tight">
                            {proj.name}
                          </div>
                          <div className="text-xs text-ink-muted font-mono">{proj.client}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-control font-medium border text-xs transition-colors duration-150 ${
                              proj.type === "Estimate"
                                ? "bg-paper border-rule text-ink"
                                : "bg-brass/10 border-brass/30 text-brass-ink"
                            } ${isDocumentHighlighted ? "ring-1 ring-forest font-semibold" : ""}`}
                          >
                            {proj.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 space-y-1">
                          <div
                            className={`font-mono text-xs transition-colors duration-150 ${
                              isScopeHighlighted ? "text-forest font-semibold" : "text-ink"
                            }`}
                          >
                            {proj.scope}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                            <span
                              className={`px-1.5 py-0.5 rounded-control transition-colors duration-150 ${
                                isRecurringHighlighted
                                  ? "bg-forest text-on-dark font-medium"
                                  : "bg-paper border border-rule/70"
                              }`}
                            >
                              {proj.structure}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-control transition-colors duration-150 ${
                                isAdjustmentsHighlighted
                                  ? "bg-brass-ink text-on-dark font-medium"
                                  : "bg-paper border border-rule/70"
                              }`}
                            >
                              {proj.adjustment}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 pl-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-control text-xs font-semibold uppercase tracking-wider ${
                              proj.statusTone === "forest"
                                ? "bg-forest text-on-dark"
                                : proj.statusTone === "brass"
                                ? "bg-brass/20 text-brass-ink border border-brass/40"
                                : "bg-paper border border-rule text-ink-muted"
                            }`}
                          >
                            {proj.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Preview Ledger Footnote */}
            <div className="pt-3 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-ink-muted">
              <span>Workflow preview · Financial totals omitted in public showcase</span>
              <span>All calculations preserved in application dashboard</span>
            </div>
          </div>

          {/* 4/12 Columns: Ruled Feature Rail */}
          <div
            className="lg:col-span-4 bg-paper border border-rule rounded-panel p-6 shadow-sm space-y-6"
            aria-label="ClearGig Workspace Features"
          >
            <div className="border-b border-rule pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-forest font-medium block">
                CORE CAPABILITIES
              </span>
              <h3 className="text-lg font-sans font-semibold text-ink tracking-tight mt-1">
                Considered Workspace Architecture
              </h3>
            </div>

            <div className="space-y-5" role="list" aria-label="Feature topics">
              {FEATURES.map((feat, index) => {
                const isActive = activeFeature === feat.key;

                return (
                  <div
                    key={feat.key}
                    role="listitem"
                    tabIndex={0}
                    onMouseEnter={() => setActiveFeature(feat.key)}
                    onMouseLeave={() => setActiveFeature(null)}
                    onFocus={() => setActiveFeature(feat.key)}
                    onBlur={() => setActiveFeature(null)}
                    className={`p-3.5 rounded-card border transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                      isActive
                        ? "bg-paper-raised border-forest shadow-sm"
                        : "bg-paper-sunken/40 border-rule hover:border-rule-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-ink-muted font-medium">0{index + 1}</span>
                      <span className="text-forest text-xs font-medium">{feat.topic}</span>
                    </div>
                    <div className="font-sans font-semibold text-sm text-ink tracking-tight">
                      {feat.title}
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed mt-1 font-sans">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-xs font-mono text-ink-muted/80">
              Hover or focus a capability to inspect its corresponding representation in the workspace ledger.
            </div>
          </div>
        </div>

        {/* Integrated Document Story Component */}
        <DocumentStory />
      </div>
    </section>
  );
}

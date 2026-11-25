import React from "react";

export type ScenarioId = "website" | "product";

export type ApproachStepId = "01" | "02" | "03";

export interface ScenarioData {
  id: ScenarioId;
  name: string;
  client: string;
  type: string;
  workstreams: string;
  deliverables: string;
  ongoingWork: string;
  status: string;
  scopeItems: Array<{
    category: string;
    description: string;
    scopeLevel: string;
  }>;
  structure: {
    baseAllocation: string;
    contingencyMargin: string;
    cadence: string;
  };
  documentDetails: {
    format: string;
    recipient: string;
    readiness: string;
  };
}

export const SCENARIOS: Record<ScenarioId, ScenarioData> = {
  website: {
    id: "website",
    name: "Website refresh",
    client: "Northline Studio",
    type: "Marketing & Portfolio Platform",
    workstreams: "Frontend + backend",
    deliverables: "Website + content structure",
    ongoingWork: "Maintenance planning",
    status: "Ready to review",
    scopeItems: [
      { category: "Frontend", description: "Responsive component system & layouts", scopeLevel: "Complete" },
      { category: "Backend", description: "Structured content API & preview endpoints", scopeLevel: "Complete" },
      { category: "Maintenance", description: "Ongoing security patching & platform updates", scopeLevel: "Planned" },
    ],
    structure: {
      baseAllocation: "Core implementation milestones",
      contingencyMargin: "Contingency considered",
      cadence: "One-time milestone + monthly support",
    },
    documentDetails: {
      format: "Print-ready summary & PDF folio",
      recipient: "Stakeholder approval",
      readiness: "Ready to review",
    },
  },
  product: {
    id: "product",
    name: "Product build",
    client: "Acme Platform Co.",
    type: "Web Application & API Services",
    workstreams: "Interface + platform",
    deliverables: "Product + supporting services",
    ongoingWork: "Infrastructure planning",
    status: "Ready to review",
    scopeItems: [
      { category: "Interface", description: "Interactive workspace, state & navigation", scopeLevel: "Complete" },
      { category: "Platform", description: "Data services, database schema & auth bridge", scopeLevel: "Complete" },
      { category: "Infrastructure", description: "Cloud provisioning, caching & logging", scopeLevel: "Planned" },
    ],
    structure: {
      baseAllocation: "Engineering sprints & architecture",
      contingencyMargin: "Risk allowance considered",
      cadence: "Sprint cycles + recurring infrastructure",
    },
    documentDetails: {
      format: "Complete estimate & FinOps scenario",
      recipient: "Client executive review",
      readiness: "Ready to review",
    },
  },
};

export interface EstimateExampleProps {
  scenario: ScenarioId;
  activeStep: ApproachStepId;
  className?: string;
}

export function EstimateExample({
  scenario,
  activeStep,
  className = "",
}: EstimateExampleProps) {
  const data = SCENARIOS[scenario];

  return (
    <div className={`w-full bg-paper text-ink rounded-panel border border-rule shadow-lg p-5 sm:p-6 ${className}`.trim()}>
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-rule gap-y-2">
        <div>
          <div className="text-xs font-mono font-medium uppercase tracking-wider text-ink-muted">
            Interactive example · no data is saved
          </div>
          <div className="text-lg font-semibold tracking-tight text-ink mt-0.5">
            {data.client}
          </div>
          <div className="text-xs text-ink-muted">
            {data.name} · {data.type}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-forest bg-accent-wash px-2 py-1 rounded-control">
            {data.status}
          </span>
        </div>
      </div>

      {/* Step 1: Scope & Workstreams */}
      <div
        className={`py-4 border-b border-rule transition-colors duration-150 ${
          activeStep === "01" ? "bg-paper-raised -mx-5 sm:-mx-6 px-5 sm:px-6 border-l-2 border-l-forest" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-ink">
            01 Scope & Workstreams
          </span>
          {activeStep === "01" && (
            <span className="text-xs font-mono text-forest font-medium">Focused view</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
          <div className="bg-paper-muted/50 p-2.5 rounded-control">
            <span className="text-xs font-mono uppercase text-ink-muted block mb-0.5">Workstreams</span>
            <span className="font-medium text-ink">{data.workstreams}</span>
          </div>
          <div className="bg-paper-muted/50 p-2.5 rounded-control">
            <span className="text-xs font-mono uppercase text-ink-muted block mb-0.5">Deliverables</span>
            <span className="font-medium text-ink">{data.deliverables}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {data.scopeItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-t border-rule/40 first:border-t-0">
              <span className="font-mono text-ink-muted w-24 shrink-0">{item.category}</span>
              <span className="text-ink truncate flex-1 px-2">{item.description}</span>
              <span className="text-xs font-mono text-forest shrink-0">{item.scopeLevel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Structure & Adjustments */}
      <div
        className={`py-4 border-b border-rule transition-colors duration-150 ${
          activeStep === "02" ? "bg-paper-raised -mx-5 sm:-mx-6 px-5 sm:px-6 border-l-2 border-l-forest" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-ink">
            02 Structure & Adjustments
          </span>
          {activeStep === "02" && (
            <span className="text-xs font-mono text-forest font-medium">Focused view</span>
          )}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-paper-muted/40 rounded-control">
            <dt className="text-xs font-mono uppercase text-ink-muted">Ongoing work</dt>
            <dd className="font-medium text-ink mt-0.5">{data.ongoingWork}</dd>
          </div>
          <div className="p-2.5 bg-paper-muted/40 rounded-control">
            <dt className="text-xs font-mono uppercase text-ink-muted">Adjustment</dt>
            <dd className="font-medium text-ink mt-0.5">{data.structure.contingencyMargin}</dd>
          </div>
          <div className="p-2.5 bg-paper-muted/40 rounded-control">
            <dt className="text-xs font-mono uppercase text-ink-muted">Schedule</dt>
            <dd className="font-medium text-ink mt-0.5">{data.structure.cadence}</dd>
          </div>
        </dl>
      </div>

      {/* Step 3: Document Readiness */}
      <div
        className={`pt-4 transition-colors duration-150 ${
          activeStep === "03" ? "bg-paper-raised -mx-5 sm:-mx-6 px-5 sm:px-6 border-l-2 border-l-forest pb-2" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-ink">
            03 Document Readiness
          </span>
          {activeStep === "03" && (
            <span className="text-xs font-mono text-forest font-medium">Focused view</span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 px-3 bg-paper-muted/40 rounded-control">
          <div>
            <span className="font-mono text-ink-muted block text-xs uppercase">Export format</span>
            <span className="font-medium text-ink">{data.documentDetails.format}</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-ink-muted block text-xs uppercase">Status</span>
            <span className="font-medium text-forest">{data.documentDetails.readiness}</span>
          </div>
        </div>
      </div>

      {/* Footer Notice enforcing Price-Free Policy */}
      <div className="mt-4 pt-3 border-t border-rule text-center">
        <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block">
          Workflow preview · No pricing shown
        </span>
      </div>
    </div>
  );
}

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import ReactDOMServer from "react-dom/server";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import type { Project } from "../services/api";

const nodeRequire = createRequire(import.meta.url);

function loadComponent<T = Record<string, React.ComponentType<Record<string, unknown>>>>(relPath: string): T {
  const fullPath = join(process.cwd(), relPath);
  const code = readFileSync(fullPath, "utf8");
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const m: { exports: Record<string, unknown> } = { exports: {} };
  const customRequire = (id: string) => {
    if (id === "next/link") {
      const MockLink = ({ children, href, className, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
        React.createElement("a", { href, className, ...rest }, children);
      MockLink.displayName = "MockLink";
      return MockLink;
    }
    if (id === "@/components/ui/Stamp" || id.includes("Stamp")) {
      return loadComponent("src/components/ui/Stamp.tsx");
    }
    if (id === "@/components/ui/Button" || id.includes("Button")) {
      return loadComponent("src/components/ui/Button.tsx");
    }
    if (id === "@/lib/totals" || id.includes("totals")) {
      return loadComponent("src/lib/totals.ts");
    }
    if (id === "@/components/dashboard/EstimateLedger") {
      return loadComponent("src/components/dashboard/EstimateLedger.tsx");
    }
    if (id === "@/components/dashboard/ClientTotalsRail") {
      return loadComponent("src/components/dashboard/ClientTotalsRail.tsx");
    }
    if (id === "@/components/dashboard/DashboardError") {
      return loadComponent("src/components/dashboard/DashboardError.tsx");
    }
    if (id === "react") return React;
    if (id === "react/jsx-runtime") return jsxRuntime;
    return nodeRequire(id);
  };
  const fn = new Function("require", "module", "exports", transpiled);
  fn(customRequire, m, m.exports);
  return m.exports as unknown as T;
}

const FIXTURE_PROJECTS: Project[] = [
  {
    id: "proj-1",
    clientId: "client-1",
    title: "Brand identity system & tokens",
    status: "ACCEPTED",
    contingencyPercentage: 10,
    profitMargin: 15,
    createdAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-11-20T12:00:00Z",
    lineItems: [
      {
        id: "item-1",
        projectId: "proj-1",
        category: "FRONTEND",
        description: "Design tokens",
        estimatedHours: 40,
        hourlyRate: 150,
        isRecurring: false,
      },
      {
        id: "item-2",
        projectId: "proj-1",
        category: "MAINTENANCE",
        description: "Token sync retainer",
        estimatedHours: 5,
        hourlyRate: 150,
        isRecurring: true,
      },
    ],
  },
  {
    id: "proj-2",
    clientId: "client-2",
    title: "Very Long Project Title That Must Wrap Gracefully Without Breaking Layout Or Causing Unintended Overflow In Tables",
    status: "DRAFT",
    contingencyPercentage: 0,
    profitMargin: 0,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
    lineItems: [
      {
        id: "item-3",
        projectId: "proj-2",
        category: "BACKEND",
        description: "Core API build",
        estimatedHours: 80,
        hourlyRate: 175,
        isRecurring: false,
      },
    ],
  },
];

const FIXTURE_CLIENT_MAP = new Map<string, string>([
  ["client-1", "Northline Studio"],
  ["client-2", "Very Long Corporate Client Name That Requires Legible Multi-line Representation Inc."],
]);

test("Dashboard EstimateLedger: renders genuine accessible links to projects with semantic markup", () => {
  const { EstimateLedger } = loadComponent<{
    EstimateLedger: typeof import("../components/dashboard/EstimateLedger").EstimateLedger;
  }>("src/components/dashboard/EstimateLedger.tsx");

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(EstimateLedger, {
      projects: FIXTURE_PROJECTS,
      clientMap: FIXTURE_CLIENT_MAP,
      loading: false,
    })
  );

  // Verifies genuine keyboard-accessible anchor tag linking to project details
  assert.match(html, /href="\/projects\/proj-1"/);
  assert.match(html, /href="\/projects\/proj-2"/);

  // Verifies long title and long client name are rendered
  assert.match(html, /Brand identity system &amp; tokens/);
  assert.match(html, /Very Long Project Title/);
  assert.match(html, /Northline Studio/);
  assert.match(html, /Very Long Corporate Client Name/);

  // Verifies status stamps
  assert.match(html, /ACCEPTED/);
  assert.match(html, /DRAFT/);

  // Verifies explicit one-time vs recurring separation
  assert.match(html, /\+\$750\/mo recurring/);
  assert.match(html, /one-time/);
});

test("Dashboard EstimateLedger: renders distinct loading skeleton and empty state", () => {
  const { EstimateLedger } = loadComponent<{
    EstimateLedger: typeof import("../components/dashboard/EstimateLedger").EstimateLedger;
  }>("src/components/dashboard/EstimateLedger.tsx");

  // Loading state
  const loadingHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(EstimateLedger, {
      projects: [],
      clientMap: new Map(),
      loading: true,
    })
  );
  assert.match(loadingHtml, /animate-pulse/);
  assert.doesNotMatch(loadingHtml, /No estimates recorded/);

  // Empty state
  const emptyHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(EstimateLedger, {
      projects: [],
      clientMap: new Map(),
      loading: false,
    })
  );
  assert.match(emptyHtml, /No estimates recorded/);
  assert.match(emptyHtml, /Create your first estimate/);
  assert.match(emptyHtml, /href="\/"/);
});

test("Dashboard ClientTotalsRail: renders client accounts with recurring breakdowns and empty fallback", () => {
  const { ClientTotalsRail } = loadComponent<{
    ClientTotalsRail: typeof import("../components/dashboard/ClientTotalsRail").ClientTotalsRail;
  }>("src/components/dashboard/ClientTotalsRail.tsx");

  const totalsHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ClientTotalsRail, {
      clientTotals: [
        { id: "c1", name: "Northline Studio", total: 7590, recurringMonthly: 750 },
        { id: "c2", name: "Acme Platform Co.", total: 14000, recurringMonthly: 0 },
      ],
      loading: false,
    })
  );

  assert.match(totalsHtml, /Client totals/);
  assert.match(totalsHtml, /Northline Studio/);
  assert.match(totalsHtml, /\$7,590/);
  assert.match(totalsHtml, /\+\$750\/mo/);
  assert.match(totalsHtml, /Acme Platform Co\./);
  assert.match(totalsHtml, /\$14,000/);

  // Empty state
  const emptyTotalsHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ClientTotalsRail, {
      clientTotals: [],
      loading: false,
    })
  );
  assert.match(emptyTotalsHtml, /No client accounts recorded/);
});

test("DashboardError: renders clear unreachable error with retry action", () => {
  const { DashboardError } = loadComponent<{
    DashboardError: typeof import("../components/dashboard/DashboardError").DashboardError;
  }>("src/components/dashboard/DashboardError.tsx");

  const errorHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(DashboardError, {
      error: "Connection to database failed at localhost:5432",
      onRetry: () => {},
    })
  );

  assert.match(errorHtml, /role="alert"/);
  assert.match(errorHtml, /Could not load estimates/);
  assert.match(errorHtml, /Connection to database failed at localhost:5432/);
  assert.match(errorHtml, /Try again/);
});

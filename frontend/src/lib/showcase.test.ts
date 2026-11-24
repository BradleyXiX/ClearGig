import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import ReactDOMServer from "react-dom/server";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";

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
    if (id === "@/components/showcase/ShowcaseNav" || id.includes("ShowcaseNav")) {
      return loadComponent("src/components/showcase/ShowcaseNav.tsx");
    }
    if (id === "@/components/showcase/Hero" || id.includes("Hero")) {
      return loadComponent("src/components/showcase/Hero.tsx");
    }
    if (id === "./EstimateArtwork" || id.includes("EstimateArtwork")) {
      return loadComponent("src/components/showcase/EstimateArtwork.tsx");
    }
    if (id.includes("BrandMark")) {
      const MockBrandMark = ({ size, className }: { size?: number; className?: string }) =>
        React.createElement("svg", { className, width: size, height: size });
      MockBrandMark.displayName = "MockBrandMark";
      return { BrandMark: MockBrandMark };
    }
    if (id === "react") return React;
    if (id === "react/jsx-runtime") return jsxRuntime;
    return nodeRequire(id);
  };
  const fn = new Function("require", "module", "exports", transpiled);
  fn(customRequire, m, m.exports);
  return m.exports as unknown as T;
}

test("Showcase Hero: renders required headlines, copy and CTAs without delay", () => {
  const { Hero } = loadComponent("src/components/showcase/Hero.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Hero));

  // Eyebrow and headlines
  assert.match(html, /PROJECT ESTIMATES, CONSIDERED\./);
  assert.match(html, /Good work\./);
  assert.match(html, /Clearly scoped\./);
  assert.match(html, /font-serif-display/);

  // Lead and supporting note
  assert.match(html, /Bring your scope, rates and recurring costs into one considered estimate\./);
  assert.match(html, /Built for independent developers and small studios\./);

  // CTAs preserve destinations
  assert.match(html, /href="\/"[^>]*>[\s\S]*?Build an estimate/);
  assert.match(html, /href="\/dashboard"[^>]*>[\s\S]*?Explore workspace/);

  // Framing strip
  assert.match(html, /One-time \+ recurring/);
  assert.match(html, /Clear cost adjustments/);
  assert.match(html, /Estimate \+ audit documents/);
});

test("Showcase Hero & Artwork: enforces price-free policy", () => {
  const { Hero } = loadComponent("src/components/showcase/Hero.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Hero));

  // No dollar, euro, pound currency symbols
  assert.doesNotMatch(html, /[$€£]/);
  // No per-hour or monetary pricing indicators
  assert.doesNotMatch(html, /\/hr/i);
  assert.doesNotMatch(html, /\/hour/i);
  assert.doesNotMatch(html, /\b\d+(\.\d{2})?\s*(USD|EUR|GBP)\b/i);

  // Shows structural terms instead of money
  assert.match(html, /ILLUSTRATIVE ESTIMATE/);
  assert.match(html, /WORKFLOW PREVIEW · NO PRICING SHOWN/);
  assert.match(html, /Defined/);
  assert.match(html, /Frontend \+ backend/);
  assert.match(html, /Ready to review/);
});

test("Showcase Nav: provides section links and keyboard accessibility", () => {
  const { ShowcaseNav } = loadComponent("src/components/showcase/ShowcaseNav.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ShowcaseNav));

  // Anchor links
  assert.match(html, /href="#overview"/);
  assert.match(html, /href="#approach"/);
  assert.match(html, /href="#workspace"/);

  // Actions
  assert.match(html, /href="\/dashboard"/);
  assert.match(html, /href="\/"/);
});

test("Showcase Page: static server render with skip link and main landmark", () => {
  const mod = loadComponent<{ default: React.ComponentType }>("src/app/showcase/page.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.default));

  // Skip link
  assert.match(html, /href="#main-content"[^>]*>Skip to main content<\/a>/);
  // Main landmark
  assert.match(html, /<main id="main-content"/);
  // Zero API calls or dynamic client-side loading spinners
  assert.doesNotMatch(html, /Loading\.\.\./i);
  assert.doesNotMatch(html, /fetch\(/);
});

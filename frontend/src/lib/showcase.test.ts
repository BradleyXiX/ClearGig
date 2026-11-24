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
    if (id === "@/components/showcase/Approach" || id.includes("Approach")) {
      return loadComponent("src/components/showcase/Approach.tsx");
    }
    if (id === "@/components/showcase/ProductSurfaces" || id.includes("ProductSurfaces")) {
      return loadComponent("src/components/showcase/ProductSurfaces.tsx");
    }
    if (id === "./DocumentStory" || id.includes("DocumentStory")) {
      return loadComponent("src/components/showcase/DocumentStory.tsx");
    }
    if (id === "@/components/showcase/Closing" || id.includes("Closing")) {
      return loadComponent("src/components/showcase/Closing.tsx");
    }
    if (id === "./Questions" || id.includes("Questions")) {
      return loadComponent("src/components/showcase/Questions.tsx");
    }
    if (id === "@/components/showcase/ShowcaseFooter" || id.includes("ShowcaseFooter")) {
      return loadComponent("src/components/showcase/ShowcaseFooter.tsx");
    }
    if (id === "./EstimateExample" || id.includes("EstimateExample")) {
      return loadComponent("src/components/showcase/EstimateExample.tsx");
    }
    if (id === "./EstimateArtwork" || id.includes("EstimateArtwork")) {
      return loadComponent("src/components/showcase/EstimateArtwork.tsx");
    }
    if (id === "./BrandBar" || id.includes("BrandBar")) {
      return loadComponent("src/components/BrandBar.tsx");
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

  // Anchor links matching Section 5A
  assert.match(html, /href="#approach"/);
  assert.match(html, /The approach/);
  assert.match(html, /href="#workspace"/);
  assert.match(html, /Inside ClearGig/);

  // Quiet Open workspace action without prominent duplicate estimate CTA
  assert.match(html, /href="\/dashboard"/);
  assert.match(html, /Open workspace/);
  assert.doesNotMatch(html, /Build an estimate/);
});

test("Showcase Page: static server render with skip link and main landmark", () => {
  const mod = loadComponent<{ default: React.ComponentType }>("src/app/showcase/page.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.default));

  // Skip link and main landmark with matching id #showcase-main
  assert.match(html, /href="#showcase-main"[^>]*>Skip to main content<\/a>/);
  assert.match(html, /<main id="showcase-main"/);
  // Zero API calls or dynamic client-side loading spinners
  assert.doesNotMatch(html, /Loading\.\.\./i);
  assert.doesNotMatch(html, /fetch\(/);
});

test("Route-aware Shell Integration: showcase and app routes render exactly one header and one main", () => {
  // Load layout / AppShell
  const { AppShell } = loadComponent("src/components/AppShell.tsx");
  const showcasePageMod = loadComponent<{ default: React.ComponentType }>("src/app/showcase/page.tsx");

  // In showcase mode
  const showcaseHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      AppShell,
      { pathname: "/showcase" },
      React.createElement(showcasePageMod.default)
    )
  );

  const showcaseHeaders = showcaseHtml.match(/<header\b[^>]*>/g) || [];
  const showcaseMains = showcaseHtml.match(/<main\b[^>]*>/g) || [];
  assert.equal(showcaseHeaders.length, 1, "Showcase must render exactly one header");
  assert.equal(showcaseMains.length, 1, "Showcase must render exactly one main");
  assert.match(showcaseHtml, /id="showcase-main"/);
  assert.match(showcaseHtml, /href="#showcase-main"/);

  // In app mode (e.g. /dashboard or /)
  const appHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      AppShell,
      { pathname: "/dashboard" },
      React.createElement("div", null, "Dashboard content")
    )
  );

  const appHeaders = appHtml.match(/<header\b[^>]*>/g) || [];
  const appMains = appHtml.match(/<main\b[^>]*>/g) || [];
  assert.equal(appHeaders.length, 1, "App must render exactly one header");
  assert.equal(appMains.length, 1, "App must render exactly one main");
  assert.match(appHtml, /Estimates/);
  assert.match(appHtml, /New estimate/);
});

test("Approach Section: renders Section 5D narrative, three step buttons, and live region", () => {
  const { Approach } = loadComponent("src/components/showcase/Approach.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Approach));

  // Section id for in-page anchor
  assert.match(html, /id="approach"/);
  assert.match(html, /THE APPROACH/);
  assert.match(html, /From scope/);
  assert.match(html, /to a clear next step\./);
  assert.match(html, /Define the work\. Understand the numbers\. Prepare the document\./);

  // Three readable step buttons
  assert.match(html, /01 Define the work/);
  assert.match(html, /02 Review the numbers/);
  assert.match(html, /03 Prepare the document/);

  // Live region for screen readers
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);

  // Default scenario: Website refresh
  assert.match(html, /Northline Studio/);
  assert.match(html, /Website \+ content structure/);
  assert.match(html, /Maintenance planning/);
});

test("EstimateExample & Scenarios: enforces price-free policy and accurate data switching across scenarios", () => {
  const { EstimateExample } = loadComponent("src/components/showcase/EstimateExample.tsx");

  const scenarios = ["website", "product"] as const;
  const steps = ["01", "02", "03"] as const;

  for (const scenario of scenarios) {
    for (const activeStep of steps) {
      const html = ReactDOMServer.renderToStaticMarkup(
        React.createElement(EstimateExample, { scenario, activeStep })
      );

      // Verify scenario identity
      if (scenario === "website") {
        assert.match(html, /Northline Studio/);
        assert.match(html, /Frontend \+ backend/);
        assert.match(html, /Website \+ content structure/);
        assert.match(html, /Maintenance planning/);
      } else {
        assert.match(html, /Acme Platform Co\./);
        assert.match(html, /Interface \+ platform/);
        assert.match(html, /Product \+ supporting services/);
        assert.match(html, /Infrastructure planning/);
      }
      assert.match(html, /Ready to review/);

      // Verify active step focused view is present in rendered output
      assert.match(html, /Focused view/);

      // Strictly assert no prices, currency symbols, hourly indicators, or financial percentages
      assert.doesNotMatch(html, /[$€£]/);
      assert.doesNotMatch(html, /\/hr/i);
      assert.doesNotMatch(html, /\/hour/i);
      assert.doesNotMatch(html, /\b\d+(\.\d{2})?\s*(USD|EUR|GBP)\b/i);
      // Ensure no financial adjustment percentages (e.g. 15% or any \d+%)
      assert.doesNotMatch(html, /\d+%/);
      assert.match(html, /Workflow preview · No pricing shown/);
    }
  }
});

test("ProductSurfaces: renders Section 5E heading, eyebrow, 8/12 preview, and feature rail", () => {
  const { ProductSurfaces } = loadComponent("src/components/showcase/ProductSurfaces.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ProductSurfaces));

  // Eyebrow and heading matching Section 5E
  assert.match(html, /BUILT AROUND THE WORK/);
  assert.match(html, /The details,/);
  assert.match(html, /in order\./);
  assert.match(html, /A focused workspace for the estimate and the conversation that follows\./);

  // Section id matches ShowcaseNav anchor
  assert.match(html, /id="workspace"/);

  // 8/12 Preview explicitly labelled Sample workspace
  assert.match(html, /Sample workspace/);
  assert.match(html, /Illustrative records · No live data/);

  // Four fixture projects
  assert.match(html, /Website refresh/);
  assert.match(html, /Northline Studio/);
  assert.match(html, /Product build/);
  assert.match(html, /Acme Platform Co\./);
  assert.match(html, /Cloud infrastructure audit/);
  assert.match(html, /Stratos Systems/);
  assert.match(html, /Brand &amp; design system|Brand & design system/);
  assert.match(html, /Kite &amp; Anchor|Kite & Anchor/);

  // Status words and document types
  assert.match(html, /Ready to review/);
  assert.match(html, /In progress/);
  assert.match(html, /Scenario modelled/);
  assert.match(html, /Completed/);
  assert.match(html, /Estimate/);
  assert.match(html, /FinOps Audit/);

  // Four ruled feature rail topics
  assert.match(html, /Keep scope visible/);
  assert.match(html, /Separate recurring costs/);
  assert.match(html, /Review adjustments/);
  assert.match(html, /Prepare a document/);
});

test("DocumentStory: renders offset estimate and FinOps document sheets with required caption", () => {
  const { DocumentStory } = loadComponent("src/components/showcase/DocumentStory.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(DocumentStory));

  // Section header
  assert.match(html, /DOCUMENT ANATOMY/);
  assert.match(html, /From scope definition/);
  assert.match(html, /to a finished deliverable\./);

  // Folios and document titles
  assert.match(html, /FOLIO: CG-2026-E042/);
  assert.match(html, /Website Refresh &amp; Architecture|Website Refresh & Architecture/);
  assert.match(html, /Northline Studio/);

  assert.match(html, /FOLIO: CG-2026-A018/);
  assert.match(html, /Infrastructure Capacity &amp; Audit|Infrastructure Capacity & Audit/);
  assert.match(html, /Stratos Systems/);

  // Section 5E Mandatory Caption
  assert.match(
    html,
    /Illustrative document structure\. Financial values appear in your working estimate\./
  );

  // Modest link to /dashboard
  assert.match(html, /href="\/dashboard"[^>]*>[\s\S]*?Open workspace/);
});

test("ProductSurfaces & DocumentStory: enforce strict price-free policy", () => {
  const { ProductSurfaces } = loadComponent("src/components/showcase/ProductSurfaces.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ProductSurfaces));

  // Strictly assert no currency symbols
  assert.doesNotMatch(html, /[$€£]/);

  // Strictly assert no hourly rates
  assert.doesNotMatch(html, /\/hr/i);
  assert.doesNotMatch(html, /\/hour/i);

  // Strictly assert no monetary values or currency codes
  assert.doesNotMatch(html, /\b\d+(\.\d{2})?\s*(USD|EUR|GBP)\b/i);

  // Strictly assert no standalone percentage rates (like 15% or 20%)
  assert.doesNotMatch(html, /\b\d+%/);
});

test("Closing: renders Section 5F two-column layout, headlines, copy, single primary CTA, and secondary workspace link", () => {
  const { Closing } = loadComponent("src/components/showcase/Closing.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Closing));

  // Section id
  assert.match(html, /id="closing"/);

  // Eyebrow and headlines
  assert.match(html, /GETTING STARTED/);
  assert.match(html, /Make the next proposal/);
  assert.match(html, /a considered one\./);
  assert.match(html, /font-serif-display/);

  // Copy
  assert.match(
    html,
    /Bring your scope, rates and recurring costs into one considered estimate\./
  );

  // Single primary CTA with arrow
  assert.match(html, /href="\/"[^>]*>[\s\S]*?Build an estimate/);
  assert.match(html, /→/);

  // Secondary workspace link
  assert.match(html, /href="\/dashboard"[^>]*>[\s\S]*?Open workspace/);

  // No backend contact form, email inputs, or pricing tiers
  assert.doesNotMatch(html, /<form/i);
  assert.doesNotMatch(html, /<input/i);
  assert.doesNotMatch(html, /pricing tier/i);
});

test("Questions: renders three native details disclosures with exact Section 5F questions and answers", () => {
  const { Questions } = loadComponent("src/components/showcase/Questions.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Questions));

  // Eyebrow and heading
  assert.match(html, /USEFUL QUESTIONS/);
  assert.match(html, /Questions before you begin\./);

  // Native HTML details and summary elements
  assert.match(html, /<details/);
  assert.match(html, /<summary/);

  // Question 1: What can I estimate?
  assert.match(html, /What can I estimate\?/);
  assert.match(
    html,
    /Software project work by category, hourly scope and rates, one-time costs and recurring monthly items\./
  );

  // Question 2: How do documents work?
  assert.match(html, /How do documents work\?/);
  assert.match(
    html,
    /Open the saved project&#x27;s estimate or audit document, then use browser print or save-to-PDF\. No claim of generated legal contracts or e-signing\.|Open the saved project's estimate or audit document, then use browser print or save-to-PDF\. No claim of generated legal contracts or e-signing\./
  );

  // Question 3: Are audit savings guaranteed?
  assert.match(html, /Are audit savings guaranteed\?/);
  assert.match(
    html,
    /No\. The FinOps view models a scenario from the supplied spend and savings-rate assumptions; it does not verify cloud-account savings\./
  );
});

test("ShowcaseFooter: renders dark ink field, light wordmark, phrase, authentic navigation, and copyright", () => {
  const { ShowcaseFooter } = loadComponent("src/components/showcase/ShowcaseFooter.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(ShowcaseFooter));

  // Dark canvas styling
  assert.match(html, /bg-dark-canvas/);
  assert.match(html, /text-on-dark/);

  // Light wordmark and core phrase
  assert.match(html, /ClearGig/);
  assert.match(html, /Clarity before commitment\./);

  // Authentic links
  assert.match(html, /href="\/"[^>]*>[\s\S]*?New estimate/);
  assert.match(html, /href="\/dashboard"[^>]*>[\s\S]*?Workspace/);
  assert.match(html, /href="#approach"[^>]*>[\s\S]*?The approach/);
  assert.match(html, /href="#workspace"[^>]*>[\s\S]*?Inside ClearGig/);

  // Copyright and disclosure (no fake legal links or licensing claims)
  assert.match(html, /© 2026 ClearGig\. All rights reserved\./);
  assert.match(html, /Workflow preview · No pricing shown\./);
  assert.doesNotMatch(html, /privacy policy/i);
  assert.doesNotMatch(html, /terms of service/i);
  assert.doesNotMatch(html, /supportgenius/i);
});

test("Showcase Closing, Questions & Footer: enforce strict price-free policy", () => {
  const { Closing } = loadComponent("src/components/showcase/Closing.tsx");
  const { ShowcaseFooter } = loadComponent("src/components/showcase/ShowcaseFooter.tsx");

  const closingHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(Closing));
  const footerHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(ShowcaseFooter));

  for (const html of [closingHtml, footerHtml]) {
    // Strictly assert no currency symbols
    assert.doesNotMatch(html, /[$€£]/);

    // Strictly assert no hourly rates
    assert.doesNotMatch(html, /\/hr/i);
    assert.doesNotMatch(html, /\/hour/i);

    // Strictly assert no monetary values or currency codes
    assert.doesNotMatch(html, /\b\d+(\.\d{2})?\s*(USD|EUR|GBP)\b/i);

    // Strictly assert no standalone percentage rates
    assert.doesNotMatch(html, /\b\d+%/);
  }
});

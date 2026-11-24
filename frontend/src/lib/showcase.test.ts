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
    if (id === "./motion" || id.includes("motion")) {
      return loadComponent("src/components/showcase/motion.ts");
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

test("Showcase Motion: motion matrix constants strictly respect design.md boundaries", () => {
  const { MOTION } = loadComponent<{
    MOTION: typeof import("../components/showcase/motion").MOTION;
  }>("src/components/showcase/motion.ts");

  // Hero paper assembly finite 650–800ms
  assert.ok(
    MOTION.HERO_ASSEMBLY_DURATION >= 650 && MOTION.HERO_ASSEMBLY_DURATION <= 800,
    `HERO_ASSEMBLY_DURATION ${MOTION.HERO_ASSEMBLY_DURATION} must be between 650 and 800ms`
  );
  assert.ok(
    MOTION.HERO_ASSEMBLY_TRAVEL <= 16,
    `HERO_ASSEMBLY_TRAVEL ${MOTION.HERO_ASSEMBLY_TRAVEL} must be <= 16px`
  );
  assert.ok(
    MOTION.HERO_ASSEMBLY_ROTATION <= 2,
    `HERO_ASSEMBLY_ROTATION ${MOTION.HERO_ASSEMBLY_ROTATION} must be <= 2deg`
  );

  // Art tilt max 2deg fine pointer only, ~180–250ms settling
  assert.ok(
    MOTION.TILT_MAX_DEG <= 2,
    `TILT_MAX_DEG ${MOTION.TILT_MAX_DEG} must be <= 2deg`
  );
  assert.ok(
    MOTION.TILT_SETTLE_MS >= 180 && MOTION.TILT_SETTLE_MS <= 250,
    `TILT_SETTLE_MS ${MOTION.TILT_SETTLE_MS} must be between 180 and 250ms`
  );

  // Section reveal <=16px / 350–450ms
  assert.ok(
    MOTION.SECTION_REVEAL_DURATION >= 350 && MOTION.SECTION_REVEAL_DURATION <= 450,
    `SECTION_REVEAL_DURATION ${MOTION.SECTION_REVEAL_DURATION} must be between 350 and 450ms`
  );
  assert.ok(
    MOTION.SECTION_REVEAL_TRAVEL <= 16,
    `SECTION_REVEAL_TRAVEL ${MOTION.SECTION_REVEAL_TRAVEL} must be <= 16px`
  );

  // Buttons arrow travel <=3px, 120–160ms
  assert.ok(
    MOTION.BUTTON_ARROW_TRAVEL <= 3,
    `BUTTON_ARROW_TRAVEL ${MOTION.BUTTON_ARROW_TRAVEL} must be <= 3px`
  );
  assert.ok(
    MOTION.BUTTON_ARROW_DURATION >= 120 && MOTION.BUTTON_ARROW_DURATION <= 160,
    `BUTTON_ARROW_DURATION ${MOTION.BUTTON_ARROW_DURATION} must be between 120 and 160ms`
  );
});

test("Showcase Motion: computeTilt calculates bounded rotations and handles bounds", () => {
  const { computeTilt } = loadComponent<{
    computeTilt: typeof import("../components/showcase/motion").computeTilt;
  }>("src/components/showcase/motion.ts");
  const rect = { left: 100, top: 100, width: 400, height: 400 };

  // Center coordinate produces zero tilt
  const center = computeTilt(300, 300, rect);
  assert.equal(center.rotateX, 0);
  assert.equal(center.rotateY, 0);

  // Corner coordinates are strictly bounded to max 2deg
  const topLeft = computeTilt(100, 100, rect);
  assert.ok(Math.abs(topLeft.rotateX) <= 2);
  assert.ok(Math.abs(topLeft.rotateY) <= 2);

  // Extreme coordinates beyond rect clamp to 2deg max
  const extreme = computeTilt(1000, -500, rect);
  assert.equal(Math.abs(extreme.rotateX), 2);
  assert.equal(Math.abs(extreme.rotateY), 2);
});

test("Showcase Motion: EstimateArtwork renders settled static layout for SSR and reduced motion", () => {
  const { EstimateArtwork } = loadComponent("src/components/showcase/EstimateArtwork.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(EstimateArtwork));

  // Renders complete illustrative estimate content without requiring client WAAPI
  assert.match(html, /ILLUSTRATIVE ESTIMATE/);
  assert.match(html, /Northline Studio/);
  assert.match(html, /Website refresh/);
  assert.match(html, /Ready to review/);

  // Reserved layout box prevents layout shift
  assert.match(html, /aspect-ratio:5 \/ 6|aspectRatio/);
  assert.match(html, /WORKFLOW PREVIEW · NO PRICING SHOWN/);
});

test("Showcase Motion: Approach and ProductSurfaces preserve immediate readability without motion blocking", () => {
  const { Approach } = loadComponent("src/components/showcase/Approach.tsx");
  const { ProductSurfaces } = loadComponent("src/components/showcase/ProductSurfaces.tsx");

  const approachHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(Approach));
  const productHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(ProductSurfaces));

  // Approach narrative and buttons are immediately readable
  assert.match(approachHtml, /THE APPROACH/);
  assert.match(approachHtml, /01 Define the work/);
  assert.match(approachHtml, /02 Review the numbers/);
  assert.match(approachHtml, /03 Prepare the document/);

  // Product surfaces headings and fixture projects are immediately present in markup
  assert.match(productHtml, /BUILT AROUND THE WORK/);
  assert.match(productHtml, /The details,/);
  assert.match(productHtml, /Sample workspace/);
  assert.match(productHtml, /Website refresh/);
  assert.match(productHtml, /Cloud infrastructure audit/);

  // Product surfaces preview uses deliberate statically settled composition without entrance ownership
  assert.match(productHtml, /grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-12 sm:mt-16 items-start/);
  assert.doesNotMatch(productHtml, /transition-\[opacity,transform\]/);
  assert.doesNotMatch(productHtml, /opacity-0/);
  assert.doesNotMatch(productHtml, /opacity-95/);
  assert.doesNotMatch(productHtml, /translate-y-4/);
});

test("Showcase Motion: DocumentStory and Questions include motion-reduce overrides", () => {
  const { DocumentStory } = loadComponent("src/components/showcase/DocumentStory.tsx");
  const { Questions } = loadComponent("src/components/showcase/Questions.tsx");

  const docHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(DocumentStory));
  const questionsHtml = ReactDOMServer.renderToStaticMarkup(React.createElement(Questions));

  // DocumentStory offset sheets disable transform and transition under reduced motion
  assert.match(docHtml, /motion-reduce:transform-none/);
  assert.match(docHtml, /motion-reduce:transition-none/);
  assert.match(docHtml, /motion-reduce:hover:transform-none/);

  // Questions accordion icon disables rotate and transition under reduced motion
  assert.match(questionsHtml, /motion-reduce:transition-none/);
  assert.match(questionsHtml, /motion-reduce:transform-none/);
  assert.match(questionsHtml, /motion-reduce:group-open:transform-none/);
});

test("Showcase Motion: createHeroMotionController respects reduced motion, gating, and tilt clearing", () => {
  const { createHeroMotionController } = loadComponent<{
    createHeroMotionController: typeof import("../components/showcase/motion").createHeroMotionController;
  }>("src/components/showcase/motion.ts");

  // Track animation calls and target styles
  const targetStyle: Record<string, string> = {};
  const containerStyle: Record<string, string> = {};

  const mockTarget = {
    style: targetStyle,
    animate: () => mockAnimation,
  } as unknown as HTMLElement;

  const mockContainer = {
    style: containerStyle,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 500 }),
  } as unknown as HTMLElement;

  let animateCallCount = 0;
  let playCallCount = 0;
  let pauseCallCount = 0;
  let cancelCallCount = 0;

  const mockAnimation = {
    playState: "running",
    play: () => {
      playCallCount++;
      mockAnimation.playState = "running";
    },
    pause: () => {
      pauseCallCount++;
      mockAnimation.playState = "paused";
    },
    cancel: () => {
      cancelCallCount++;
      mockAnimation.playState = "idle";
    },
    finish: () => {},
    onfinish: null as (() => void) | null,
  };

  mockTarget.animate = () => {
    animateCallCount++;
    mockAnimation.playState = "running";
    return mockAnimation as unknown as Animation;
  };

  // Case 1: Initial reduced motion -> zero animation created, target immediately settled
  const reducedController = createHeroMotionController({
    getSheet: () => mockTarget,
    getContainer: () => mockContainer,
    reducedMotion: true,
    elementIntersecting: true,
    documentVisible: true,
  });

  assert.equal(animateCallCount, 0, "No animations should be created when reduced motion is preferred");
  assert.equal(targetStyle.opacity, "1");
  assert.equal(targetStyle.transform, "none");
  reducedController.destroy();

  // Case 2: Standard mode - hidden or offscreen initially -> no animation starts until visible and intersecting
  const controller = createHeroMotionController({
    getSheet: () => mockTarget,
    getContainer: () => mockContainer,
    reducedMotion: false,
    elementIntersecting: false,
    documentVisible: true,
  });

  assert.equal(animateCallCount, 0, "Should not animate while offscreen");

  // Make visible while still offscreen
  controller.setDocumentVisible(true);
  assert.equal(animateCallCount, 0, "Still offscreen, should not animate");

  // Enter viewport -> starts animation
  controller.setElementIntersecting(true);
  assert.equal(animateCallCount, 1, "Animation should start once both intersecting and visible");
  assert.equal(controller.getStatus().isPlaying, true);

  // Tab hidden -> pause animation
  controller.setDocumentVisible(false);
  assert.equal(pauseCallCount, 1, "Animation should pause when tab hidden");

  // Tab visible -> resume animation
  controller.setDocumentVisible(true);
  assert.equal(playCallCount, 1, "Animation should resume when tab visible");

  // Complete assembly
  if (mockAnimation.onfinish) {
    mockAnimation.onfinish();
  }
  assert.equal(controller.getStatus().hasFinished, true);
  assert.equal(controller.getStatus().isPlaying, false);

  // Visibility changes after assembly completion must NOT replay
  controller.setDocumentVisible(false);
  controller.setDocumentVisible(true);
  assert.equal(animateCallCount, 1, "Assembly animation must never replay after completion");

  // Tilt manipulation with fine pointer
  // Ensure fine pointer is enabled on controller
  controller.setFinePointer(true);
  controller.handleMouseMove(100, 100);
  assert.ok(containerStyle.transform && containerStyle.transform.includes("rotateX"), "Outer container should have tilt transform");

  // Runtime reduction preference switch -> immediately clears outer tilt without transition delay
  controller.setReducedMotion(true);
  assert.equal(containerStyle.transition, "none");
  assert.equal(containerStyle.transform, "none");
  assert.equal(targetStyle.opacity, "1");
  assert.equal(targetStyle.transform, "none");

  // Pointer move while reduced motion is true must not apply tilt
  controller.handleMouseMove(50, 50);
  assert.equal(containerStyle.transform, "none");

  // Runtime preference toggling (reduced on/off): animation count must remain 1 (no replay)
  controller.setReducedMotion(false);
  assert.equal(animateCallCount, 1, "Toggling reduced motion after finish must not replay assembly");

  // Fine pointer change: fine -> coarse immediately clears tilt
  controller.setFinePointer(true);
  controller.handleMouseMove(100, 100);
  assert.ok(containerStyle.transform && containerStyle.transform.includes("rotateX"), "Tilt applied for fine pointer");
  controller.setFinePointer(false);
  assert.equal(containerStyle.transform, "none", "Coarse pointer must immediately clear tilt");

  // Clean up controller
  controller.destroy();
  assert.equal(controller.getStatus().isDestroyed, true);
  assert.ok(cancelCallCount >= 1, "Cancel should be invoked when animation finishes or controller is destroyed");

  // Calls after destroy are completely ignored
  controller.handleMouseMove(100, 100);
  assert.equal(containerStyle.transform, "none");
  controller.start();
  assert.equal(animateCallCount, 1, "Cannot restart animation after destroy");
});

test("Showcase Motion: controller suppresses deferred assembly when reduced before eligibility", () => {
  const { createHeroMotionController } = loadComponent<{
    createHeroMotionController: typeof import("../components/showcase/motion").createHeroMotionController;
  }>("src/components/showcase/motion.ts");

  const targetStyle: Record<string, string> = {};
  const containerStyle: Record<string, string> = {};
  const mockTarget = {
    style: targetStyle,
    animate: () => ({ playState: "running", play: () => {}, pause: () => {}, cancel: () => {}, finish: () => {} }),
  } as unknown as HTMLElement;
  const mockContainer = {
    style: containerStyle,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 500 }),
  } as unknown as HTMLElement;

  let animateCount = 0;
  mockTarget.animate = () => {
    animateCount++;
    return { playState: "running", play: () => {}, pause: () => {}, cancel: () => {}, finish: () => {} } as unknown as Animation;
  };

  // Controller initialized while offscreen
  const controller = createHeroMotionController({
    getSheet: () => mockTarget,
    getContainer: () => mockContainer,
    reducedMotion: false,
    elementIntersecting: false,
    documentVisible: true,
  });

  // User reduces motion before hero ever enters viewport
  controller.setReducedMotion(true);
  assert.equal(animateCount, 0);

  // User later restores normal motion, then scrolls into viewport
  controller.setReducedMotion(false);
  controller.setElementIntersecting(true);
  assert.equal(animateCount, 0, "Reduced motion before eligibility permanently settles without deferred start");
  assert.equal(targetStyle.transform, "none");
  assert.equal(targetStyle.opacity, "1");

  controller.destroy();
});

test("Showcase Motion: WAAPI finish cancels fill animation and releases callbacks", () => {
  const { createHeroMotionController } = loadComponent<{
    createHeroMotionController: typeof import("../components/showcase/motion").createHeroMotionController;
  }>("src/components/showcase/motion.ts");

  const targetStyle: Record<string, string> = {};
  const containerStyle: Record<string, string> = {};
  const mockTarget = {
    style: targetStyle,
  } as unknown as HTMLElement;
  const mockContainer = {
    style: containerStyle,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 500 }),
  } as unknown as HTMLElement;

  let cancelCallCount = 0;
  let onFinishAssigned = false;
  const mockAnimation = {
    playState: "running",
    play: () => {},
    pause: () => {},
    cancel: () => {
      cancelCallCount++;
    },
    finish: () => {},
    onfinish: null as (() => void) | null,
  };

  mockTarget.animate = () => {
    onFinishAssigned = true;
    return mockAnimation as unknown as Animation;
  };

  const controller = createHeroMotionController({
    getSheet: () => mockTarget,
    getContainer: () => mockContainer,
    reducedMotion: false,
    elementIntersecting: true,
    documentVisible: true,
  });
  controller.start();

  assert.equal(onFinishAssigned, true);
  // Complete the animation
  if (mockAnimation.onfinish) {
    mockAnimation.onfinish();
  }

  // Verify onfinish handler was detached and animation cancelled to release fill: forwards
  assert.equal(mockAnimation.onfinish, null, "onfinish callback must be detached");
  assert.equal(cancelCallCount, 1, "Animation must be cancelled on finish to release forwards fill");
  assert.equal(targetStyle.transform, "none");
  assert.equal(targetStyle.opacity, "1");

  controller.destroy();
});

test("Showcase Motion: controller initializes from actual media-query and resists false hydration snapshots", () => {
  const { createHeroMotionController } = loadComponent<{
    createHeroMotionController: typeof import("../components/showcase/motion").createHeroMotionController;
  }>("src/components/showcase/motion.ts");

  const targetStyle: Record<string, string> = {};
  const containerStyle: Record<string, string> = {};
  let animateCallCount = 0;

  const mockTarget = {
    style: targetStyle,
    animate: () => {
      animateCallCount++;
      return { playState: "running", play: () => {}, pause: () => {}, cancel: () => {}, finish: () => {} } as unknown as Animation;
    },
  } as unknown as HTMLElement;
  const mockContainer = {
    style: containerStyle,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 500 }),
  } as unknown as HTMLElement;

  // Simulate environment where prefers-reduced-motion is TRUE in window.matchMedia
  const globalObj = globalThis as unknown as {
    window?: { matchMedia: (query: string) => { matches: boolean } };
  };
  const prevWindow = globalObj.window;

  try {
    globalObj.window = {
      matchMedia: (query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
      }),
    };

    // Controller created once per lifetime
    const controller = createHeroMotionController({
      getContainer: () => mockContainer,
      getSheet: () => mockTarget,
    });

    // Simulate hydration effect:
    // The component executes:
    // controller.setReducedMotion(prefersReducedMotion());
    // instead of passing the stale false hook snapshot.
    const clientPref = globalObj.window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controller.setReducedMotion(clientPref);
    controller.setElementIntersecting(true);
    controller.start();

    // Verify ZERO animations were started despite being intersecting and mounted
    assert.equal(animateCallCount, 0, "No animation must start when client preference is reduced motion");
    assert.equal(targetStyle.opacity, "1");
    assert.equal(targetStyle.transform, "none");

    controller.destroy();
  } finally {
    globalObj.window = prevWindow;
  }
});

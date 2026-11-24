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

// Helper to transpile and load React components into CommonJS without external bundler
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
    if (id === "next/navigation") {
      return { usePathname: () => "/" };
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

test("Field: combines hint, unit announcement, and caller aria-describedby without dropping any", () => {
  const { Field } = loadComponent("src/components/ui/Field.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Field, {
      id: "rate-field",
      label: "Hourly rate",
      hint: "Rate in USD per hour",
      prefix: "$",
      suffix: "/hr",
      "aria-describedby": "caller-description",
    })
  );

  // aria-describedby on input should contain caller-description, rate-field-hint, and rate-field-unit
  assert.match(html, /aria-describedby="caller-description rate-field-hint rate-field-unit"/);
  // Input should NOT have bogus prefix/suffix forwarded attributes
  assert.doesNotMatch(html, /<input[^>]*\bprefix=/);
  assert.doesNotMatch(html, /<input[^>]*\bsuffix=/);
  // Unit span should exist with sr-only description
  assert.match(html, /<span id="rate-field-unit" class="sr-only">Unit: dollars, per hour<\/span>/);
  // Hint span should exist with corresponding ID
  assert.match(html, /<span id="rate-field-hint" class="text-sm text-ink-muted">Rate in USD per hour<\/span>/);
});

test("Field: forces aria-invalid=true on error even when caller requested aria-invalid=false, and merges error ID", () => {
  const { Field } = loadComponent("src/components/ui/Field.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Field, {
      id: "rate-field-err",
      label: "Hourly rate",
      error: "Rate is required",
      "aria-describedby": "caller-description",
      "aria-invalid": false,
    })
  );

  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="caller-description rate-field-err-error"/);
  assert.match(html, /<span id="rate-field-err-error" role="alert" class="text-sm text-danger font-medium">Rate is required<\/span>/);
});

test("Field: renders 16px text role for input and 14px text role for label", () => {
  const { Field } = loadComponent("src/components/ui/Field.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Field, {
      id: "test-typography",
      label: "Project title",
    })
  );

  // Label uses text-sm (14px)
  assert.match(html, /<label[^>]*class="[^"]*text-sm[^"]*"/);
  // Input uses text-base (16px)
  assert.match(html, /<input[^>]*class="[^"]*text-base[^"]*"/);
});

test("Field: disabled state reflects on input and container", () => {
  const { Field } = loadComponent("src/components/ui/Field.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Field, {
      id: "test-disabled",
      label: "Disabled Field",
      disabled: true,
    })
  );

  assert.match(html, /<input[^>]*disabled=""/);
  assert.match(html, /opacity-50 cursor-not-allowed bg-paper-sunken/);
});

test("BrandBar: renders wrap-safe responsive header markup with no nested button in link", () => {
  const { BrandBar } = loadComponent("src/components/BrandBar.tsx");
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(BrandBar));

  // Verify flex-wrap to prevent clipping at 320px
  assert.match(html, /flex flex-wrap items-center justify-between min-h-14/);
  // Verify links to dashboard, showcase, and new estimate
  assert.match(html, /href="\/dashboard"/);
  assert.match(html, /href="\/showcase"/);
  assert.match(html, /href="\/"/);
  // Verify no nested buttons inside links
  assert.doesNotMatch(html, /<a[^>]*>\s*<button/);
  assert.doesNotMatch(html, /<button[^>]*>\s*<a/);
  // Verify New estimate action text present
  assert.match(html, /New estimate/);
});

test("Button: provides visible focus ring and touch target heights without arbitrary Tailwind", () => {
  const code = readFileSync(join(process.cwd(), "src/components/ui/Button.tsx"), "utf8");
  assert.match(code, /focus-visible:ring-forest/);
  assert.match(code, /focus-visible:ring-2/);
  assert.match(code, /h-9/); // sm size (36px)
  assert.match(code, /h-11/); // md size (44px)
  assert.doesNotMatch(code, /min-h-\[\d+px\]/);
});

test("globals.css: defines exact Considered Work semantic tokens", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.match(css, /--canvas:/);
  assert.match(css, /--paper:/);
  assert.match(css, /--paper-muted:/);
  assert.match(css, /--ink:/);
  assert.match(css, /--ink-muted:/);
  assert.match(css, /--rule:/);
  assert.match(css, /--control-border:/);
  assert.match(css, /--forest:/);
  assert.match(css, /--dark-canvas:/);
  assert.match(css, /--on-dark:/);
  assert.match(css, /--danger:/);
  assert.match(css, /\.font-serif-display/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test("Field.tsx binds input through aria-describedby for hint and error", () => {
  const code = readFileSync(join(process.cwd(), "src/components/ui/Field.tsx"), "utf8");
  assert.match(code, /aria-describedby=\{describedBy\}/);
  assert.match(code, /id=\{errorId\}/);
  assert.match(code, /id=\{hintId\}/);
  assert.match(code, /aria-invalid=\{error \? true : undefined\}/);
});

test("Field.tsx renders visible prefix and suffix elements without forwarding to input", () => {
  const code = readFileSync(join(process.cwd(), "src/components/ui/Field.tsx"), "utf8");
  assert.match(code, /\{prefix && \(/);
  assert.match(code, /\{suffix && \(/);
  // Ensure prefix is destructured out of props so it does not get forwarded via {...props}
  assert.match(code, /prefix,\s*suffix,\s*id,/);
});

test("Button.tsx provides visible focus outline and touch target heights without arbitrary Tailwind", () => {
  const code = readFileSync(join(process.cwd(), "src/components/ui/Button.tsx"), "utf8");
  assert.match(code, /focus-visible:ring-forest/);
  assert.match(code, /focus-visible:ring-2/);
  assert.match(code, /h-9/); // sm size (36px)
  assert.match(code, /h-11/); // md size (44px)
  assert.doesNotMatch(code, /min-h-\[\d+px\]/); // no arbitrary bracket values
});

test("BrandBar.tsx eliminates nested button inside link", () => {
  const code = readFileSync(join(process.cwd(), "src/components/BrandBar.tsx"), "utf8");
  assert.doesNotMatch(code, /<Link[^>]*>\s*<Button/);
  assert.match(code, /<Link[\s\S]*?New estimate[\s\S]*?<\/Link>/);
});

test("BrandMark.tsx provides accessible SVG role and title support", () => {
  const code = readFileSync(join(process.cwd(), "src/components/ui/BrandMark.tsx"), "utf8");
  assert.match(code, /role=\{title \? "img" : "presentation"\}/);
  assert.match(code, /aria-hidden=\{title \? undefined : true\}/);
  assert.match(code, /\{title && <title>\{title\}<\/title>\}/);
});

test("globals.css defines exact Considered Work semantic tokens", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  // Check for presence of required CSS custom property names
  assert.match(css, /--canvas:/);
  assert.match(css, /--paper:/);
  assert.match(css, /--paper-muted:/);
  assert.match(css, /--ink:/);
  assert.match(css, /--brass:/);
  assert.match(css, /--brass-ink:/);
  assert.match(css, /--forest:/);
  assert.match(css, /--dark-canvas:/);
  assert.match(css, /--on-dark:/);
  assert.match(css, /--danger:/);
  assert.match(css, /\.font-serif-display/);
});

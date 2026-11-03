import test from "node:test";
import assert from "node:assert/strict";
import { folio } from "./folio.ts";

test("derives year and four-character reference", () => {
  assert.equal(folio({ id: "4f2a9c11-0000-4000-8000-000000000000", createdAt: "2026-03-08T10:00:00Z" }),
    "EST-2026-4F2A");
});

test("is stable across calls", () => {
  const p = { id: "abcd1234-0000-4000-8000-000000000000", createdAt: "2025-12-31T23:00:00Z" };
  assert.equal(folio(p), folio(p));
});

test("uses the UTC year, not the local one", () => {
  assert.equal(folio({ id: "abcd1234-0000-4000-8000-000000000000", createdAt: "2025-12-31T23:00:00Z" }),
    "EST-2025-ABCD");
});

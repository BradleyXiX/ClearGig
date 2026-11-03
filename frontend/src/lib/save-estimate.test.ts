// src/lib/save-estimate.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { saveEstimate, SaveEstimateError } from "./save-estimate.ts";
import type { EstimateDraft, SaveDeps } from "./save-estimate.ts";

const draft = (over: Partial<EstimateDraft> = {}): EstimateDraft => ({
  clientName: "Acme",
  title: "Portal",
  frontendHours: 10,
  backendHours: 5,
  hourlyRate: 150,
  contingencyPercentage: 15,
  profitMargin: 0,
  ...over,
});

function deps(over: Partial<SaveDeps> = {}) {
  const calls: string[] = [];
  const d: SaveDeps = {
    createClient: async (name) => {
      calls.push("client:" + name);
      return { id: "c1" };
    },
    createProject: async (input) => {
      calls.push("project:" + input.clientId);
      return { id: "p1" };
    },
    addLineItem: async (pid, input) => {
      calls.push("item:" + input.category);
      return {};
    },
    ...over,
  };
  return { d, calls };
}

test("existing client is reused, not recreated", async () => {
  const { d, calls } = deps();
  const r = await saveEstimate(draft({ clientId: "existing" }), d);
  assert.equal(r.clientCreated, false);
  assert.equal(r.clientId, "existing");
  assert.deepEqual(calls, ["project:existing", "item:FRONTEND", "item:BACKEND"]);
});

test("new client is created once and used by the project", async () => {
  const { d, calls } = deps();
  const r = await saveEstimate(draft(), d);
  assert.equal(r.clientCreated, true);
  assert.equal(r.clientId, "c1");
  assert.deepEqual(calls, ["client:Acme", "project:c1", "item:FRONTEND", "item:BACKEND"]);
});

test("both line items carry the shared rate", async () => {
  const seen: number[] = [];
  const { d } = deps({
    addLineItem: async (_p, input) => {
      seen.push(input.hourlyRate);
      return {};
    },
  });
  await saveEstimate(draft({ hourlyRate: 175 }), d);
  assert.deepEqual(seen, [175, 175]);
});

test("a zero-hour category writes no line item", async () => {
  const { d, calls } = deps();
  await saveEstimate(draft({ frontendHours: 0 }), d);
  assert.deepEqual(calls, ["client:Acme", "project:c1", "item:BACKEND"]);
});

test("both zero hours is rejected before any write", async () => {
  const { d, calls } = deps();
  await assert.rejects(() =>
    saveEstimate(draft({ frontendHours: 0, backendHours: 0 }), d)
  );
  assert.deepEqual(calls, []);
});

test("project failure names the orphaned client", async () => {
  const { d } = deps({
    createProject: async () => {
      throw new Error("500");
    },
  });
  await assert.rejects(
    () => saveEstimate(draft(), d),
    (err: unknown) => {
      assert.ok(err instanceof SaveEstimateError);
      assert.equal(err.clientId, "c1");
      assert.equal(err.clientName, "Acme");
      assert.match(err.message, /Acme/);
      return true;
    }
  );
});

test("project failure with an existing client orphans nothing", async () => {
  const { d } = deps({
    createProject: async () => {
      throw new Error("500");
    },
  });
  await assert.rejects(
    () => saveEstimate(draft({ clientId: "existing" }), d),
    (err: unknown) =>
      err instanceof SaveEstimateError && err.clientId === undefined
  );
});


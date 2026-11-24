// src/lib/wizard-controller.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createWizardController,
} from "./wizard-controller.ts";
import type { SaveDeps } from "./save-estimate.ts";

function createMockDeps() {
  const calls: string[] = [];
  const deps: SaveDeps = {
    createClient: async (name: string) => {
      calls.push(`createClient:${name}`);
      return { id: "c1" };
    },
    createProject: async (input: { clientId: string; title: string }) => {
      calls.push(`createProject:${input.clientId}`);
      return { id: "p1" };
    },
    addLineItem: async (_pid: string, input: { category: string }) => {
      calls.push(`addLineItem:${input.category}`);
      return {};
    },
  };
  return { deps, calls };
}

test("first line item succeeds, second fails: one project exists, identity is retained, subsequent save/Enter attempts cause zero new calls", async () => {
  const { deps, calls } = createMockDeps();
  let lineItemCallCount = 0;
  deps.addLineItem = async (_pid, input) => {
    calls.push(`addLineItem:${input.category}`);
    lineItemCallCount++;
    if (lineItemCallCount === 2) {
      throw new Error("backend line item failed");
    }
    return {};
  };

  const controller = createWizardController({
    deps,
    storage: { getItem: () => null, setItem: () => {} },
  });

  controller.setClientInput("Acme Corp");
  controller.setTitle("Platform Migration");
  controller.setFrontendHours("10");
  controller.setBackendHours("5");
  controller.setHourlyRate("150");

  // Attempt save
  await controller.handleSave();

  const state = controller.getState();
  assert.equal(state.savedProjectId, null);
  assert.equal(state.recoverableProjectId, "p1");
  assert.equal(state.selectedClientId, "c1");
  assert.match(state.saveError || "", /p1/);
  assert.equal(state.isSaving, false);

  // Calls so far: createClient:Acme Corp, createProject:c1, addLineItem:FRONTEND, addLineItem:BACKEND
  assert.deepEqual(calls, [
    "createClient:Acme Corp",
    "createProject:c1",
    "addLineItem:FRONTEND",
    "addLineItem:BACKEND",
  ]);

  // Subsequent save/Enter attempt must be blocked by the recovery lock and cause 0 new calls
  await controller.handleSave();
  assert.deepEqual(calls, [
    "createClient:Acme Corp",
    "createProject:c1",
    "addLineItem:FRONTEND",
    "addLineItem:BACKEND",
  ]);

  // Calling onEnter must also be blocked
  controller.onEnter();
  assert.deepEqual(calls, [
    "createClient:Acme Corp",
    "createProject:c1",
    "addLineItem:FRONTEND",
    "addLineItem:BACKEND",
  ]);
});

test("first line item fails: same lock/recovery outcome, with no false claim that any item was saved", async () => {
  const { deps, calls } = createMockDeps();
  deps.addLineItem = async (_pid, input) => {
    calls.push(`addLineItem:${input.category}`);
    throw new Error("database timeout on first item");
  };

  const controller = createWizardController({
    deps,
    storage: { getItem: () => null, setItem: () => {} },
  });

  controller.setClientInput("Beta LLC");
  controller.setTitle("API Redesign");
  controller.setFrontendHours("10");
  controller.setBackendHours("10");

  await controller.handleSave();

  const state = controller.getState();
  assert.equal(state.recoverableProjectId, "p1");
  assert.equal(state.selectedClientId, "c1");
  assert.match(state.saveError || "", /database timeout on first item/);

  // Subsequent save attempt is blocked
  await controller.handleSave();
  assert.deepEqual(calls, [
    "createClient:Beta LLC",
    "createProject:c1",
    "addLineItem:FRONTEND",
  ]);
});

test("client succeeds, project fails: retry reuses that client ID, createClient called once; legitimate client-name edit selects the intended identity", async () => {
  const { deps, calls } = createMockDeps();
  let projectAttempts = 0;
  deps.createProject = async (input) => {
    calls.push(`createProject:${input.clientId}`);
    projectAttempts++;
    if (projectAttempts === 1) {
      throw new Error("500 Internal Error creating project");
    }
    return { id: "p1" };
  };

  const controller = createWizardController({
    deps,
    storage: { getItem: () => null, setItem: () => {} },
  });

  controller.setClientInput("Gamma Inc");
  controller.setTitle("Security Audit");
  controller.setFrontendHours("5");
  controller.setBackendHours("0");

  // First save fails at project creation
  await controller.handleSave();
  let state = controller.getState();
  assert.equal(state.selectedClientId, "c1");
  assert.equal(state.recoverableProjectId, null);
  assert.match(state.saveError || "", /Gamma Inc/);
  assert.deepEqual(calls, ["createClient:Gamma Inc", "createProject:c1"]);

  // Retry save: should NOT call createClient again, should reuse c1
  await controller.handleSave();
  state = controller.getState();
  assert.equal(state.savedProjectId, "p1");
  assert.equal(state.saveError, null);
  assert.deepEqual(calls, [
    "createClient:Gamma Inc",
    "createProject:c1",
    "createProject:c1",
    "addLineItem:FRONTEND",
  ]);

  // Legitimate client-name edit must invalidate mismatched selection
  controller.setClientInput("Different Client");
  state = controller.getState();
  assert.equal(state.selectedClientId, undefined);
});

test("two immediate save invocations: synchronous in-flight guard ensures one creation chain", async () => {
  const { deps, calls } = createMockDeps();

  let signalProjectStarted!: () => void;
  const projectStarted = new Promise<void>((resolve) => {
    signalProjectStarted = resolve;
  });

  let resolveProject!: (val: { id: string }) => void;
  const projectFinished = new Promise<{ id: string }>((resolve) => {
    resolveProject = resolve;
  });

  deps.createProject = async (input) => {
    calls.push(`createProject:${input.clientId}`);
    signalProjectStarted();
    return projectFinished;
  };

  const controller = createWizardController({
    deps,
    storage: { getItem: () => null, setItem: () => {} },
  });

  controller.setClientInput("Delta Corp");
  controller.setTitle("Mobile App");
  controller.setFrontendHours("10");

  const p1 = controller.handleSave();
  const p2 = controller.handleSave(); // Immediate concurrent call

  // Await handshake that createProject has actually been entered
  await projectStarted;

  // At this point, createClient has run once, createProject has run once
  assert.deepEqual(calls, [
    "createClient:Delta Corp",
    "createProject:c1",
  ]);

  // Now resolve the project creation
  resolveProject({ id: "p1" });

  await Promise.all([p1, p2]);

  // Entire chain completed, line item added once, second save was blocked
  assert.deepEqual(calls, [
    "createClient:Delta Corp",
    "createProject:c1",
    "addLineItem:FRONTEND",
  ]);
});

test("storage unavailable: editable default loads and valid API save still works", async () => {
  const { deps, calls } = createMockDeps();
  const throwingStorage = {
    getItem: () => {
      throw new Error("SecurityError: localStorage is disabled");
    },
    setItem: () => {
      throw new Error("SecurityError: localStorage is disabled");
    },
  };

  const controller = createWizardController({
    deps,
    storage: throwingStorage,
  });

  // Default hourly rate remains 150 without crashing
  assert.equal(controller.getState().hourlyRate, "150");

  controller.setClientInput("Epsilon Ltd");
  controller.setTitle("Cloud Setup");
  controller.setFrontendHours("5");
  controller.setHourlyRate("200"); // User can edit rate

  await controller.handleSave(); // Save doesn't crash on setItem failure

  assert.equal(controller.getState().savedProjectId, "p1");
  assert.deepEqual(calls, [
    "createClient:Epsilon Ltd",
    "createProject:c1",
    "addLineItem:FRONTEND",
  ]);
});

test("explicit fresh-draft action clears recovery and draft deliberately", async () => {
  const { deps } = createMockDeps();
  deps.addLineItem = async () => {
    throw new Error("partial line item failure");
  };

  const controller = createWizardController({
    deps,
    storage: { getItem: () => null, setItem: () => {} },
  });

  controller.setClientInput("Zeta Co");
  controller.setTitle("Old Draft");
  controller.setFrontendHours("5");

  await controller.handleSave();
  assert.equal(controller.getState().recoverableProjectId, "p1");

  // Reset to fresh draft
  controller.resetDraft();

  const state = controller.getState();
  assert.equal(state.recoverableProjectId, null);
  assert.equal(state.clientInput, "");
  assert.equal(state.title, "");
  assert.equal(state.frontendHours, "");
  assert.equal(state.backendHours, "");
  assert.equal(state.saveError, null);
  assert.equal(state.step, 1);
});

test("recovery and success navigation: no nested interactive link/button and client input has explicit label and 16px text role", () => {
  const pageSrc = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");

  // Verify no nested <Link><Button> or <Button><Link>
  assert.equal(pageSrc.includes("<Link href={`/projects/${state.savedProjectId}`}><Button"), false);
  assert.equal(pageSrc.includes("<Link href={`/projects/${savedProjectId}`}><Button"), false);
  assert.equal(pageSrc.includes("<Link href={`/projects/${state.recoverableProjectId}`}><Button"), false);
  assert.equal(pageSrc.includes("<Link href={`/projects/${recoverableProjectId}`}><Button"), false);
  assert.doesNotMatch(pageSrc, /<Link[^>]*>\s*<Button/);
  assert.doesNotMatch(pageSrc, /<Button[^>]*>\s*<Link/);

  // Verify client input has an explicit linked label
  assert.match(pageSrc, /<label\s+htmlFor=\{clientInputId\}/);
  assert.match(pageSrc, /Client name\s*<\/label>/);
  assert.match(pageSrc, /<input\s+id=\{clientInputId\}/);

  // Verify client input uses text-base (16px) styling rather than text-sm
  assert.match(pageSrc, /text-base/);
  assert.doesNotMatch(pageSrc, /px-3\s+py-2\s+text-ink\s+text-sm/);
});

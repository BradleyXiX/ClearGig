// src/lib/project-controller.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createProjectController } from "./project-controller.ts";
import { ApiError, type Project, type LineItem } from "../services/api.ts";

function createMockProject(over: Partial<Project> = {}): Project {
  return {
    id: "p123",
    clientId: "c1",
    title: "Platform Redesign",
    status: "DRAFT",
    contingencyPercentage: 15,
    profitMargin: 10,
    createdAt: "2026-11-20T10:00:00Z",
    updatedAt: "2026-11-20T10:00:00Z",
    client: { id: "c1", name: "Acme Corp", createdAt: "2026-11-20T10:00:00Z" },
    lineItems: [
      {
        id: "item-1",
        projectId: "p123",
        category: "FRONTEND",
        description: "Dashboard UI",
        estimatedHours: 20,
        hourlyRate: 150,
        isRecurring: false,
      },
    ],
    ...over,
  };
}

function createMockApi() {
  const calls: string[] = [];
  let currentProject = createMockProject();

  const mockApi = {
    getProjectById: async (id: string) => {
      calls.push(`getProjectById:${id}`);
      return currentProject;
    },
    updateProject: async (id: string, input: Record<string, unknown>) => {
      calls.push(`updateProject:${id}:${JSON.stringify(input)}`);
      currentProject = {
        ...currentProject,
        contingencyPercentage: Number(input.contingency_percentage ?? currentProject.contingencyPercentage),
        profitMargin: Number(input.profit_margin ?? currentProject.profitMargin),
        status: (input.status as Project["status"]) ?? currentProject.status,
      };
      return currentProject;
    },
    addLineItem: async (projectId: string, input: Record<string, unknown>) => {
      calls.push(`addLineItem:${projectId}:${input.description}`);
      const newItem: LineItem = {
        id: `item-${Date.now()}`,
        projectId,
        category: input.category as LineItem["category"],
        description: String(input.description),
        estimatedHours: Number(input.estimated_hours),
        hourlyRate: Number(input.hourly_rate),
        isRecurring: Boolean(input.is_recurring),
      };
      currentProject = {
        ...currentProject,
        lineItems: [...(currentProject.lineItems || []), newItem],
      };
      return newItem;
    },
    deleteLineItem: async (id: string) => {
      calls.push(`deleteLineItem:${id}`);
      currentProject = {
        ...currentProject,
        lineItems: (currentProject.lineItems || []).filter((i) => i.id !== id),
      };
    },
    deleteProject: async (id: string) => {
      calls.push(`deleteProject:${id}`);
    },
  };

  return { mockApi, calls, setProject: (p: Project) => (currentProject = p) };
}

test("distinguishes 404 missing project from 503 unavailable API with retry", async () => {
  const { mockApi } = createMockApi();

  // Test 404
  mockApi.getProjectById = async () => {
    throw new ApiError(404, "Project not found", "NOT_FOUND");
  };

  const controller404 = createProjectController({ projectId: "p-missing", api: mockApi });
  await controller404.loadProject();
  let state = controller404.getState();
  assert.equal(state.loadErrorType, "not_found");
  assert.match(state.loadError || "", /not found/i);
  assert.equal(state.project, null);

  // Test 503
  mockApi.getProjectById = async () => {
    throw new ApiError(503, "Database unavailable", "DB_UNAVAILABLE");
  };

  const controller503 = createProjectController({ projectId: "p-offline", api: mockApi });
  await controller503.loadProject();
  state = controller503.getState();
  assert.equal(state.loadErrorType, "unavailable");
  assert.match(state.loadError || "", /unavailable/i);
  assert.equal(state.project, null);

  // Retry when available
  mockApi.getProjectById = async () => createMockProject();
  await controller503.loadProject();
  assert.equal(controller503.getState().loadErrorType, null);
  assert.ok(controller503.getState().project !== null);
});

test("double-submit prevention: concurrent handleSaveProject executes one update and preserves dirty values on failure", async () => {
  const { mockApi, calls } = createMockApi();

  let signalUpdateStarted!: () => void;
  const updateStarted = new Promise<void>((resolve) => {
    signalUpdateStarted = resolve;
  });

  let rejectUpdate!: (err: Error) => void;
  const updateFinished = new Promise<Project>((_, reject) => {
    rejectUpdate = reject;
  });

  mockApi.updateProject = async (id) => {
    calls.push(`updateProject:${id}`);
    signalUpdateStarted();
    return updateFinished;
  };

  const controller = createProjectController({ projectId: "p123", api: mockApi });
  await controller.loadProject();

  // Make adjustments dirty
  controller.setContingencyPercentage(25);
  controller.setProfitMargin(15);
  assert.equal(controller.isDirty(), true);

  // Attempt two concurrent saves
  const p1 = controller.handleSaveProject();
  const p2 = controller.handleSaveProject();

  await updateStarted;
  assert.equal(controller.getState().isSaving, true);

  // Fail the update
  rejectUpdate(new ApiError(500, "Server error saving project"));
  await Promise.all([p1, p2]);

  // Assert only one update call was made
  const updateCalls = calls.filter((c) => c.startsWith("updateProject:"));
  assert.equal(updateCalls.length, 1);

  // Crucial: dirty values are preserved so user does not lose edits
  const state = controller.getState();
  assert.equal(state.contingencyPercentage, 25);
  assert.equal(state.profitMargin, 15);
  assert.equal(controller.isDirty(), true);
  assert.match(state.saveError || "", /Server error saving project/);
});

test("add line item: prevents double-submit and clears form only on success", async () => {
  const { mockApi, calls } = createMockApi();

  let signalAddStarted!: () => void;
  const addStarted = new Promise<void>((resolve) => {
    signalAddStarted = resolve;
  });

  let resolveAdd!: (val: LineItem) => void;
  const addFinished = new Promise<LineItem>((resolve) => {
    resolveAdd = resolve;
  });

  mockApi.addLineItem = async (pid, input) => {
    calls.push(`addLineItem:${input.description}`);
    signalAddStarted();
    return addFinished;
  };

  const controller = createProjectController({ projectId: "p123", api: mockApi });
  await controller.loadProject();

  controller.setLineItemForm({
    category: "BACKEND",
    description: "Auth API",
    estimatedHours: "15",
    hourlyRate: "160",
    isRecurring: false,
  });

  const p1 = controller.handleAddLineItem();
  const p2 = controller.handleAddLineItem();

  await addStarted;
  assert.equal(controller.getState().isAddingLineItem, true);

  resolveAdd({
    id: "item-2",
    projectId: "p123",
    category: "BACKEND",
    description: "Auth API",
    estimatedHours: 15,
    hourlyRate: 160,
    isRecurring: false,
  });

  await Promise.all([p1, p2]);

  // Added only once
  const addCalls = calls.filter((c) => c.startsWith("addLineItem:"));
  assert.equal(addCalls.length, 1);

  // Form cleared on success
  const form = controller.getState().lineItemForm;
  assert.equal(form.description, "");
  assert.equal(form.estimatedHours, "");
  assert.equal(form.hourlyRate, "");
});

test("delete line item: handles in-flight deletion and reports real error without throwing", async () => {
  const { mockApi } = createMockApi();

  mockApi.deleteLineItem = async () => {
    throw new ApiError(500, "Failed to delete line item");
  };

  const controller = createProjectController({ projectId: "p123", api: mockApi });
  await controller.loadProject();

  await controller.handleDeleteLineItem("item-1");

  assert.match(controller.getState().lineItemError || "", /Failed to delete line item/);
  // Item remains in list because deletion failed
  assert.equal(controller.getState().project?.lineItems?.length, 1);
});

test("status menu and tabs: accessible selection and state changes", async () => {
  const { mockApi } = createMockApi();
  const controller = createProjectController({ projectId: "p123", api: mockApi });
  await controller.loadProject();

  assert.equal(controller.getState().status, "DRAFT");
  controller.setStatus("SENT");
  assert.equal(controller.getState().status, "SENT");
  assert.equal(controller.isDirty(), true);

  // Tab switching
  assert.equal(controller.getState().activeTab, "estimate");
  controller.setActiveTab("audit");
  assert.equal(controller.getState().activeTab, "audit");
});

test("markup and accessibility: LineItemTable and ProjectDetail enforce accessible status menu, labels, and single controls", () => {
  const pageSrc = readFileSync(join(process.cwd(), "src/app/projects/[id]/page.tsx"), "utf8");
  const tableSrc = readFileSync(join(process.cwd(), "src/components/LineItemTable.tsx"), "utf8");

  // Status menu uses listbox semantics
  assert.match(pageSrc, /aria-haspopup="listbox"/);
  assert.match(pageSrc, /role="listbox"/);
  assert.match(pageSrc, /role="option"/);

  // Tablist uses accessible tabs
  assert.match(pageSrc, /role="tablist"/);
  assert.match(pageSrc, /role="tab"/);
  assert.match(pageSrc, /aria-selected=/);

  // Category select has explicit linked label
  assert.match(pageSrc, /htmlFor="line-item-category"/);
  assert.match(pageSrc, /id="line-item-category"/);

  // Deletion confirm in LineItemTable has role="group" and returns focus
  assert.match(tableSrc, /role="group"/);
  assert.match(tableSrc, /handleCancelConfirm/);

  // Ensure no nested <Link><Button> or <Button><Link>
  assert.doesNotMatch(pageSrc, /<Link[^>]*>\s*<Button/);
  assert.doesNotMatch(pageSrc, /<Button[^>]*>\s*<Link/);
});

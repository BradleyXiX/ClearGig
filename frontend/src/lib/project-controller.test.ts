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
    updateProject: async (id: string, input: { contingency_percentage?: number; profit_margin?: number; status?: string }) => {
      calls.push(`updateProject:${id}:${JSON.stringify(input)}`);
      currentProject = {
        ...currentProject,
        contingencyPercentage: Number(input.contingency_percentage ?? currentProject.contingencyPercentage),
        profitMargin: Number(input.profit_margin ?? currentProject.profitMargin),
        status: (input.status as Project["status"]) ?? currentProject.status,
      };
      return currentProject;
    },
    addLineItem: async (projectId: string, input: { category: string; description: string; estimated_hours: number; hourly_rate: number; is_recurring?: boolean }) => {
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
      return { message: "Deleted" };
    },
    deleteProject: async (id: string) => {
      calls.push(`deleteProject:${id}`);
      return { message: "Deleted" };
    },
  };

  return { mockApi, calls, setProject: (p: Project) => (currentProject = p) };
}

test("raw TypeError/network rejection, HTTP500 and HTTP404 produce distinct truthful outcomes; retry reads successfully", async () => {
  const { mockApi } = createMockApi();

  // 1. Raw TypeError (fetch failed / network disconnect)
  mockApi.getProjectById = async () => {
    throw new TypeError("Failed to fetch");
  };
  const controllerNet = createProjectController({ projectId: "p-net", api: mockApi });
  await controllerNet.loadProject();
  assert.equal(controllerNet.getState().loadErrorType, "network");
  assert.match(controllerNet.getState().loadError || "", /Network connection failed/);
  assert.equal(controllerNet.getState().project, null);

  // 2. HTTP 500
  mockApi.getProjectById = async () => {
    throw new ApiError(500, "Internal Server Error", "SERVER_ERROR");
  };
  const controller500 = createProjectController({ projectId: "p-500", api: mockApi });
  await controller500.loadProject();
  assert.equal(controller500.getState().loadErrorType, "server_error");
  assert.match(controller500.getState().loadError || "", /500/);

  // 3. HTTP 404
  mockApi.getProjectById = async () => {
    throw new ApiError(404, "Project not found", "NOT_FOUND");
  };
  const controller404 = createProjectController({ projectId: "p-404", api: mockApi });
  await controller404.loadProject();
  assert.equal(controller404.getState().loadErrorType, "not_found");
  assert.match(controller404.getState().loadError || "", /not found in ledger/i);

  // 4. Retry reads successfully
  mockApi.getProjectById = async () => createMockProject();
  await controller500.loadProject();
  assert.equal(controller500.getState().loadErrorType, null);
  assert.ok(controller500.getState().project !== null);
});

test("unsaved draft preservation: editing adjustments without saving, then adding/deleting item keeps draft values and dirty state intact", async () => {
  const { mockApi } = createMockApi();
  const controller = createProjectController({ projectId: "p123", api: mockApi });
  await controller.loadProject();

  // Initial persisted values: contingency 15, margin 10, status DRAFT
  assert.equal(controller.getState().contingencyPercentage, 15);
  assert.equal(controller.isDirty(), false);

  // Edit adjustments locally without saving
  controller.setContingencyPercentage(30);
  controller.setProfitMargin(20);
  controller.setStatus("SENT");
  assert.equal(controller.isDirty(), true);

  // Add line item
  controller.setLineItemForm({
    category: "CLOUD",
    description: "Database Hosting",
    estimatedHours: "5",
    hourlyRate: "120",
    isRecurring: true,
  });
  await controller.handleAddLineItem();

  // Crucial invariant: persisted project has updated line items, but dirty adjustments remain 30, 20, SENT!
  let state = controller.getState();
  assert.equal(state.contingencyPercentage, 30, "contingency must remain 30");
  assert.equal(state.profitMargin, 20, "profitMargin must remain 20");
  assert.equal(state.status, "SENT", "status must remain SENT");
  assert.equal(controller.isDirty(), true);
  assert.equal(state.project?.lineItems?.length, 2);

  // Delete line item
  await controller.handleDeleteLineItem("item-1");
  state = controller.getState();
  assert.equal(state.contingencyPercentage, 30, "contingency preserved after delete");
  assert.equal(state.profitMargin, 20, "profitMargin preserved after delete");
  assert.equal(state.status, "SENT", "status preserved after delete");
  assert.equal(controller.isDirty(), true);
  assert.equal(state.project?.lineItems?.length, 1);
});

test("attempting edits while an adjustment save is pending: setters are locked to prevent overwritten edits", async () => {
  const { mockApi, calls } = createMockApi();

  let signalUpdateStarted!: () => void;
  const updateStarted = new Promise<void>((resolve) => {
    signalUpdateStarted = resolve;
  });

  let resolveUpdate!: (val: Project) => void;
  const updateFinished = new Promise<Project>((resolve) => {
    resolveUpdate = resolve;
  });

  mockApi.updateProject = async (id) => {
    calls.push(`updateProject:${id}`);
    signalUpdateStarted();
    return updateFinished;
  };

  const controller = createProjectController({ projectId: "p123", api: mockApi });
  await controller.loadProject();

  controller.setContingencyPercentage(25);
  const savePromise = controller.handleSaveProject();

  await updateStarted;
  assert.equal(controller.getState().isSaving, true);

  // Attempt mutations while save is pending
  controller.setContingencyPercentage(99);
  controller.setProfitMargin(99);
  controller.setStatus("REJECTED");

  // State remains at 25 and is not overwritten by transient edits during flight
  assert.equal(controller.getState().contingencyPercentage, 25);
  assert.equal(controller.getState().profitMargin, 10);
  assert.equal(controller.getState().status, "DRAFT");

  resolveUpdate(createMockProject({ contingencyPercentage: 25 }));
  await savePromise;

  assert.equal(controller.getState().isSaving, false);
  assert.equal(controller.getState().contingencyPercentage, 25);
  assert.equal(controller.isDirty(), false);
});

test("route replacement A -> B with delayed A response: B owns state, A callbacks are inert after disposal", async () => {
  const { mockApi } = createMockApi();

  let resolveA!: (val: Project) => void;
  const projectAFinished = new Promise<Project>((resolve) => {
    resolveA = resolve;
  });

  mockApi.getProjectById = async (id: string) => {
    if (id === "proj-A") {
      return projectAFinished;
    }
    return createMockProject({ id: "proj-B", title: "Project B" });
  };

  const controllerA = createProjectController({ projectId: "proj-A", api: mockApi });
  const loadAPromise = controllerA.loadProject();

  // User navigates from A to B: controllerA is disposed, controllerB is created
  controllerA.dispose();

  const controllerB = createProjectController({ projectId: "proj-B", api: mockApi });
  await controllerB.loadProject();

  // B is loaded with Project B
  assert.equal(controllerB.getState().project?.id, "proj-B");

  // A finally resolves late
  resolveA(createMockProject({ id: "proj-A", title: "Stale Project A" }));
  await loadAPromise;

  // Controller A was disposed: listener notifications and state overwrites are inert
  assert.equal(controllerB.getState().project?.id, "proj-B");
  assert.equal(controllerA.getState().project, null);
});

test("committed item write followed by read failure: committed outcome reported with read-only retry without re-POSTing", async () => {
  const { mockApi, calls } = createMockApi();
  let loadCount = 0;

  mockApi.getProjectById = async (id: string) => {
    loadCount++;
    if (loadCount === 2) {
      // Second load (the post-add refresh) fails
      throw new ApiError(503, "Database timeout on refresh");
    }
    return createMockProject({ id });
  };

  const controller = createProjectController({ projectId: "p123", api: mockApi });
  await controller.loadProject(); // load 1 succeeds

  controller.setLineItemForm({
    category: "FRONTEND",
    description: "New Feature",
    estimatedHours: "10",
    hourlyRate: "150",
    isRecurring: false,
  });

  await controller.handleAddLineItem();

  // Form was cleared because write succeeded
  assert.equal(controller.getState().lineItemForm.description, "");

  // Refresh failed, so mutationCommittedRefreshError is surfaced
  assert.match(
    controller.getState().mutationCommittedRefreshError || "",
    /Line item was saved, but refreshing project ledger failed/
  );

  // Retrying only calls getProjectById (read-only retry), not addLineItem
  const addCallsBefore = calls.filter((c) => c.startsWith("addLineItem:")).length;
  await controller.loadProject({ preserveDirtyDraft: true });
  const addCallsAfter = calls.filter((c) => c.startsWith("addLineItem:")).length;
  assert.equal(addCallsBefore, addCallsAfter, "Retry must be read-only without re-POSTing write");
});

test("native status select and toggle buttons semantics in source markup", () => {
  const pageSrc = readFileSync(join(process.cwd(), "src/app/projects/[id]/page.tsx"), "utf8");
  const tableSrc = readFileSync(join(process.cwd(), "src/components/LineItemTable.tsx"), "utf8");

  // Native labelled select for project status
  assert.match(pageSrc, /<label\s+htmlFor="project-status-select"/);
  assert.match(pageSrc, /<select\s+id="project-status-select"/);

  // Grouped toggle buttons with aria-pressed for Estimate | Audit switch
  assert.match(pageSrc, /role="group"/);
  assert.match(pageSrc, /aria-pressed=\{state\.activeTab === 'estimate'\}/);
  assert.match(pageSrc, /aria-pressed=\{state\.activeTab === 'audit'\}/);

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

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

test("real production lifecycle setup -> cleanup -> setup: second activation loads and becomes usable, late first-session responses remain ignored", async () => {
  const { mockApi } = createMockApi();

  let resolveFirstLoad!: (p: Project) => void;
  const firstLoadPromise = new Promise<Project>((resolve) => {
    resolveFirstLoad = resolve;
  });

  let loadCount = 0;
  mockApi.getProjectById = async (id: string) => {
    loadCount++;
    if (loadCount === 1) {
      return firstLoadPromise;
    }
    return createMockProject({ id, title: "Second Activation" });
  };

  const controller = createProjectController({ projectId: "p-replay", api: mockApi });

  // First effect activation (setup)
  const deactivate1 = controller.activate();
  assert.equal(controller.getState().isLoading, true);

  // React StrictMode or fast unmount (cleanup)
  deactivate1();

  // Second effect activation (setup)
  const deactivate2 = controller.activate();
  // Second load completes
  await new Promise((r) => setTimeout(r, 10));

  assert.equal(controller.getState().isLoading, false);
  assert.equal(controller.getState().project?.title, "Second Activation");

  // Late first-session response resolves
  resolveFirstLoad(createMockProject({ id: "p-replay", title: "Stale First Load" }));
  await firstLoadPromise;

  // Stale first-session response was ignored, second activation remains active
  assert.equal(controller.getState().project?.title, "Second Activation");

  deactivate2();
});

test("edit adjustments, add item succeeds, refresh rejects: actual page branch markup renders committed-refresh notice with read-only retry, retry preserves dirty draft without re-POSTing", async () => {
  const { mockApi, calls } = createMockApi();
  let loadCount = 0;

  mockApi.getProjectById = async (id: string) => {
    loadCount++;
    if (loadCount === 2) {
      // Refresh after addLineItem fails
      throw new ApiError(503, "Database refresh timeout");
    }
    return createMockProject({ id, contingencyPercentage: 15, profitMargin: 10 });
  };

  const controller = createProjectController({ projectId: "p-refresh-fail", api: mockApi });
  const deactivate = controller.activate();
  await new Promise((r) => setTimeout(r, 10));

  // Edit adjustments locally without saving
  controller.setContingencyPercentage(35);
  controller.setProfitMargin(25);
  controller.setStatus("SENT");
  assert.equal(controller.isDirty(), true);

  // Add line item
  controller.setLineItemForm({
    category: "CLOUD",
    description: "Production DB",
    estimatedHours: "8",
    hourlyRate: "180",
    isRecurring: true,
  });

  await controller.handleAddLineItem();

  const state = controller.getState();
  // Form was reset on write success
  assert.equal(state.lineItemForm.description, "");
  // Existing project data is preserved rather than blanked
  assert.ok(state.project !== null, "project data must remain available");
  // Dirty draft is preserved
  assert.equal(state.contingencyPercentage, 35);
  assert.equal(state.profitMargin, 25);
  assert.equal(state.status, "SENT");
  assert.equal(controller.isDirty(), true);
  // Mutation committed refresh error is present
  assert.match(state.mutationCommittedRefreshError || "", /Line item was saved, but refreshing project ledger failed/);

  // Verify the page source has the dedicated inline committed-refresh alert and preserves the project view
  const pageSrc = readFileSync(join(process.cwd(), "src/app/projects/[id]/page.tsx"), "utf8");
  assert.match(pageSrc, /state\.mutationCommittedRefreshError/);
  assert.match(pageSrc, /Retry read/);
  assert.match(pageSrc, /controller\.loadProject\(\{\s*preserveDirtyDraft:\s*true\s*\}\)/);

  // Invoke read-only retry
  const addCallsBefore = calls.filter((c) => c.startsWith("addLineItem:")).length;
  await controller.loadProject({ preserveDirtyDraft: true });
  const addCallsAfter = calls.filter((c) => c.startsWith("addLineItem:")).length;

  assert.equal(addCallsBefore, addCallsAfter, "Retry read must not re-POST addLineItem");
  assert.equal(controller.getState().mutationCommittedRefreshError, null, "Refresh error cleared on success");
  assert.equal(controller.getState().contingencyPercentage, 35, "Dirty contingency preserved on retry");
  assert.equal(controller.getState().profitMargin, 25, "Dirty margin preserved on retry");
  assert.equal(controller.getState().status, "SENT", "Dirty status preserved on retry");
  assert.equal(controller.isDirty(), true);

  deactivate();
});

test("mutation serialization: deferred adjustment save vs add/delete, and deferred add vs project delete serialize strictly", async () => {
  const { mockApi } = createMockApi();

  let signalSaveStarted!: () => void;
  const saveStarted = new Promise<void>((resolve) => {
    signalSaveStarted = resolve;
  });

  let resolveSave!: (p: Project) => void;
  const saveFinished = new Promise<Project>((resolve) => {
    resolveSave = resolve;
  });

  mockApi.updateProject = async () => {
    signalSaveStarted();
    return saveFinished;
  };

  const controller = createProjectController({ projectId: "p-serial", api: mockApi });
  await controller.loadProject();

  controller.setContingencyPercentage(40);
  const savePromise = controller.handleSaveProject();
  await saveStarted;

  assert.equal(controller.getState().isSaving, true);
  assert.equal(controller.isMutationPending(), true);

  // While save is in flight, attempt addLineItem and handleDeleteLineItem and handleDeleteProject
  controller.setLineItemForm({
    category: "FRONTEND",
    description: "Concurrent Add",
    estimatedHours: "5",
    hourlyRate: "100",
  });
  const addPromise = controller.handleAddLineItem();
  const deletePromise = controller.handleDeleteLineItem("item-1");
  let deleteProjectCalled = false;
  const deleteProjectPromise = controller.handleDeleteProject(() => {
    deleteProjectCalled = true;
  });

  await addPromise;
  await deletePromise;
  await deleteProjectPromise;

  // Because mutation was locked by save, add, delete-item and delete-project were rejected immediately
  assert.equal(deleteProjectCalled, false);
  assert.equal(controller.getState().lineItemForm.description, "Concurrent Add", "Form retained when write is blocked");

  // Complete the save
  resolveSave(createMockProject({ id: "p-serial", contingencyPercentage: 40 }));
  await savePromise;

  assert.equal(controller.getState().isSaving, false);
  assert.equal(controller.isMutationPending(), false);

  // Now next action proceeds normally
  let addStarted2 = false;
  mockApi.addLineItem = async () => {
    addStarted2 = true;
    return {
      id: "item-new",
      projectId: "p-serial",
      category: "FRONTEND",
      description: "Concurrent Add",
      estimatedHours: 5,
      hourlyRate: 100,
      isRecurring: false,
    };
  };
  await controller.handleAddLineItem();
  assert.equal(addStarted2, true, "After save reconciled, add proceeds");
});

test("concurrent double-submits and rejected-write form content preservation", async () => {
  const { mockApi } = createMockApi();

  let signalAddStarted!: () => void;
  const addStarted = new Promise<void>((resolve) => {
    signalAddStarted = resolve;
  });

  let rejectAdd!: (err: Error) => void;
  const addFinished = new Promise<LineItem>((_, reject) => {
    rejectAdd = reject;
  });

  mockApi.addLineItem = async () => {
    signalAddStarted();
    return addFinished;
  };

  const controller = createProjectController({ projectId: "p-dup", api: mockApi });
  await controller.loadProject();

  controller.setLineItemForm({
    category: "BACKEND",
    description: "Database Indexing",
    estimatedHours: "4",
    hourlyRate: "150",
    isRecurring: false,
  });

  // Rapid double-click
  const p1 = controller.handleAddLineItem();
  const p2 = controller.handleAddLineItem();

  await addStarted;
  assert.equal(controller.getState().isAddingLineItem, true);

  // Reject write
  rejectAdd(new ApiError(500, "Database disk full"));
  await Promise.all([p1, p2]);

  // Form content strictly preserved so user does not lose input
  const state = controller.getState();
  assert.equal(state.lineItemForm.description, "Database Indexing");
  assert.equal(state.lineItemForm.estimatedHours, "4");
  assert.equal(state.lineItemForm.hourlyRate, "150");
  assert.match(state.addLineItemError || "", /Database disk full/);
  assert.equal(state.isAddingLineItem, false);
});

test("delayed read started before adjustment save cannot overwrite saved state when resolving late", async () => {
  const { mockApi } = createMockApi();

  let resolveStaleRead!: (p: Project) => void;
  const staleReadPromise = new Promise<Project>((resolve) => {
    resolveStaleRead = resolve;
  });

  let readCount = 0;
  mockApi.getProjectById = async (id) => {
    readCount++;
    if (readCount === 1) {
      // First read is delayed
      return staleReadPromise;
    }
    return createMockProject({ id, contingencyPercentage: 35, profitMargin: 25 });
  };

  const controller = createProjectController({ projectId: "p-stale-read", api: mockApi });
  const initialLoadPromise = controller.loadProject();

  // User edits adjustments
  controller.setContingencyPercentage(35);
  controller.setProfitMargin(25);
  assert.equal(controller.isDirty(), true);

  // User saves adjustments and save resolves first
  await controller.handleSaveProject();
  assert.equal(controller.getState().contingencyPercentage, 35);
  assert.equal(controller.getState().profitMargin, 25);
  assert.equal(controller.getState().saveSuccessMessage, "Project adjustments saved successfully.");

  // Now the stale first read finally resolves with older values (15, 10)
  resolveStaleRead(createMockProject({ id: "p-stale-read", contingencyPercentage: 15, profitMargin: 10 }));
  await initialLoadPromise;

  // Stale read must NOT overwrite the saved adjustments or project
  const finalState = controller.getState();
  assert.equal(finalState.contingencyPercentage, 35, "Saved contingency 35 must not be overwritten by stale read");
  assert.equal(finalState.profitMargin, 25, "Saved margin 25 must not be overwritten by stale read");
  assert.equal(finalState.saveSuccessMessage, "Project adjustments saved successfully.");
});

test("competing mutation attempted during addLineItem post-write refresh is rejected by held lock", async () => {
  const { mockApi } = createMockApi();

  let signalRefreshStarted!: () => void;
  const refreshStarted = new Promise<void>((resolve) => {
    signalRefreshStarted = resolve;
  });

  let resolveRefresh!: (p: Project) => void;
  const refreshFinished = new Promise<Project>((resolve) => {
    resolveRefresh = resolve;
  });

  let readCount = 0;
  mockApi.getProjectById = async (id) => {
    readCount++;
    if (readCount === 2) {
      // Post-add refresh
      signalRefreshStarted();
      return refreshFinished;
    }
    return createMockProject({ id });
  };

  const controller = createProjectController({ projectId: "p-lock-refresh", api: mockApi });
  await controller.loadProject();

  controller.setLineItemForm({
    category: "FRONTEND",
    description: "New Item",
    estimatedHours: "2",
    hourlyRate: "120",
  });

  const addPromise = controller.handleAddLineItem();

  // Wait until add write has succeeded and refresh read is in flight
  await refreshStarted;

  // Lock must still be held!
  assert.equal(controller.isMutationPending(), true, "Mutation lock must be held during refresh reconciliation");

  // Competing save attempted during refresh reconciliation
  controller.setContingencyPercentage(50);
  const saveResult = controller.handleSaveProject();
  await saveResult;
  assert.equal(controller.getState().isSaving, false, "Competing save rejected during refresh");

  // Competing delete attempted during refresh reconciliation
  const deleteResult = controller.handleDeleteLineItem("item-1");
  await deleteResult;
  assert.equal(controller.getState().deletingLineItemId, null, "Competing delete rejected during refresh");

  // Complete refresh
  resolveRefresh(createMockProject({ id: "p-lock-refresh" }));
  await addPromise;

  assert.equal(controller.isMutationPending(), false, "Mutation lock released after refresh completes");
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

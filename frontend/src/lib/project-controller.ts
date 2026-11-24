import { type Project, ApiError } from '../services/api.ts';

export type LoadErrorType = 'not_found' | 'unavailable' | 'network' | 'server_error' | 'unknown' | null;

export interface LineItemFormData {
  category: 'FRONTEND' | 'BACKEND' | 'CLOUD' | 'MAINTENANCE';
  description: string;
  estimatedHours: string;
  hourlyRate: string;
  isRecurring: boolean;
}

export interface ProjectControllerState {
  project: Project | null;
  isLoading: boolean;
  loadError: string | null;
  loadErrorType: LoadErrorType;

  // Editable adjustments (separate from server project state)
  contingencyPercentage: number;
  profitMargin: number;
  status: Project['status'];
  isDirty: boolean;

  // Mutation in-flight and status states
  isSaving: boolean;
  saveError: string | null;
  saveSuccessMessage: string | null;

  isAddingLineItem: boolean;
  addLineItemError: string | null;

  deletingLineItemId: string | null;
  lineItemError: string | null;

  isDeletingProject: boolean;
  deleteProjectError: string | null;

  // Refresh error after committed mutation
  mutationCommittedRefreshError: string | null;

  // Add line item form
  lineItemForm: LineItemFormData;

  // UI state
  activeTab: 'estimate' | 'audit';
  confirmDeleteProject: boolean;
}

export interface ProjectApi {
  getProjectById: (id: string) => Promise<Project>;
  updateProject: (id: string, input: { contingency_percentage?: number; profit_margin?: number; status?: string }) => Promise<Project>;
  addLineItem: (projectId: string, input: { category: string; description: string; estimated_hours: number; hourly_rate: number; is_recurring?: boolean }) => Promise<unknown>;
  deleteLineItem: (id: string) => Promise<unknown>;
  deleteProject: (id: string) => Promise<unknown>;
}

export interface ProjectControllerOptions {
  projectId: string;
  api: ProjectApi;
}

export function createProjectController(options: ProjectControllerOptions) {
  const { projectId, api } = options;

  let disposed = false;
  let loadGeneration = 0;

  let state: ProjectControllerState = {
    project: null,
    isLoading: true,
    loadError: null,
    loadErrorType: null,

    contingencyPercentage: 0,
    profitMargin: 0,
    status: 'DRAFT',
    isDirty: false,

    isSaving: false,
    saveError: null,
    saveSuccessMessage: null,

    isAddingLineItem: false,
    addLineItemError: null,

    deletingLineItemId: null,
    lineItemError: null,

    isDeletingProject: false,
    deleteProjectError: null,
    mutationCommittedRefreshError: null,

    lineItemForm: {
      category: 'FRONTEND',
      description: '',
      estimatedHours: '',
      hourlyRate: '',
      isRecurring: false,
    },

    activeTab: 'estimate',
    confirmDeleteProject: false,
  };

  const listeners = new Set<() => void>();
  const notify = () => {
    if (disposed) return;
    for (const listener of listeners) {
      listener();
    }
  };

  // Synchronous in-flight guards
  let isSavingInFlight = false;
  let isAddingLineItemInFlight = false;
  let isDeletingProjectInFlight = false;
  let deletingItemIdInFlight: string | null = null;

  const controller = {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getState(): ProjectControllerState {
      return state;
    },

    dispose() {
      disposed = true;
      listeners.clear();
    },

    isDirty(): boolean {
      return state.isDirty;
    },

    setContingencyPercentage(val: number) {
      if (isSavingInFlight || state.isSaving) return;
      state = {
        ...state,
        contingencyPercentage: val,
        isDirty: true,
        saveSuccessMessage: null,
      };
      notify();
    },

    setProfitMargin(val: number) {
      if (isSavingInFlight || state.isSaving) return;
      state = {
        ...state,
        profitMargin: val,
        isDirty: true,
        saveSuccessMessage: null,
      };
      notify();
    },

    setStatus(status: Project['status']) {
      if (isSavingInFlight || state.isSaving) return;
      state = {
        ...state,
        status,
        isDirty: true,
        saveSuccessMessage: null,
      };
      notify();
    },

    setConfirmDeleteProject(confirm: boolean) {
      state = { ...state, confirmDeleteProject: confirm };
      notify();
    },

    setActiveTab(tab: 'estimate' | 'audit') {
      state = { ...state, activeTab: tab };
      notify();
    },

    setLineItemForm(form: Partial<LineItemFormData>) {
      if (isAddingLineItemInFlight || state.isAddingLineItem) return;
      state = {
        ...state,
        lineItemForm: { ...state.lineItemForm, ...form },
        addLineItemError: null,
      };
      notify();
    },

    clearMessages() {
      state = {
        ...state,
        saveError: null,
        saveSuccessMessage: null,
        addLineItemError: null,
        lineItemError: null,
        deleteProjectError: null,
        mutationCommittedRefreshError: null,
      };
      notify();
    },

    async loadProject(options?: { preserveDirtyDraft?: boolean }) {
      if (disposed) return;
      const currentGen = ++loadGeneration;

      state = {
        ...state,
        isLoading: true,
        loadError: null,
        loadErrorType: null,
      };
      notify();

      try {
        const data = await api.getProjectById(projectId);
        if (disposed || currentGen !== loadGeneration) return;

        // If preserveDirtyDraft is requested, keep user's edited adjustment fields intact
        const shouldPreserveDraft = options?.preserveDirtyDraft && state.isDirty;

        state = {
          ...state,
          isLoading: false,
          project: data,
          contingencyPercentage: shouldPreserveDraft
            ? state.contingencyPercentage
            : Number(data.contingencyPercentage) || 0,
          profitMargin: shouldPreserveDraft
            ? state.profitMargin
            : Number(data.profitMargin) || 0,
          status: shouldPreserveDraft ? state.status : data.status,
          isDirty: shouldPreserveDraft ? true : false,
          loadError: null,
          loadErrorType: null,
          mutationCommittedRefreshError: null,
        };
        notify();
      } catch (err: unknown) {
        if (disposed || currentGen !== loadGeneration) return;

        let loadErrorType: LoadErrorType = 'unknown';
        let msg = 'Failed to load estimate.';

        if (err instanceof ApiError) {
          if (err.status === 404) {
            loadErrorType = 'not_found';
            msg = `Estimate "${projectId}" not found in ledger.`;
          } else if (err.status === 503 || err.code === 'DB_UNAVAILABLE') {
            loadErrorType = 'unavailable';
            msg = 'Service temporarily unavailable. Unable to reach database.';
          } else if (err.status >= 500) {
            loadErrorType = 'server_error';
            msg = `Server error (${err.status}): ${err.message}`;
          } else {
            msg = err.message;
          }
        } else if (err instanceof TypeError || (err instanceof Error && err.name === 'TypeError')) {
          // Raw fetch rejections (TypeError: Failed to fetch / network offline)
          loadErrorType = 'network';
          msg = 'Network connection failed. Check your internet connection or proxy.';
        } else if (err instanceof Error) {
          msg = err.message;
        }

        state = {
          ...state,
          isLoading: false,
          loadError: msg,
          loadErrorType,
        };
        notify();
      }
    },

    async handleSaveProject() {
      if (isSavingInFlight || state.isSaving || !state.isDirty) return;

      isSavingInFlight = true;
      state = {
        ...state,
        isSaving: true,
        saveError: null,
        saveSuccessMessage: null,
      };
      notify();

      // Snapshot the submitted adjustments
      const submittedContingency = state.contingencyPercentage;
      const submittedMargin = state.profitMargin;
      const submittedStatus = state.status;

      try {
        const updated = await api.updateProject(projectId, {
          contingency_percentage: submittedContingency,
          profit_margin: submittedMargin,
          status: submittedStatus,
        });

        if (disposed) return;

        state = {
          ...state,
          isSaving: false,
          project: updated,
          contingencyPercentage: Number(updated.contingencyPercentage) || 0,
          profitMargin: Number(updated.profitMargin) || 0,
          status: updated.status,
          isDirty: false,
          saveSuccessMessage: 'Project adjustments saved successfully.',
        };
        isSavingInFlight = false;
        notify();
      } catch (err: unknown) {
        isSavingInFlight = false;
        if (disposed) return;
        const msg = err instanceof Error ? err.message : 'Failed to save project adjustments';
        // Note: Dirty values are strictly preserved
        state = {
          ...state,
          isSaving: false,
          saveError: msg,
        };
        notify();
      }
    },

    async handleAddLineItem() {
      if (isAddingLineItemInFlight || state.isAddingLineItem) return;

      const { category, description, estimatedHours, hourlyRate, isRecurring } = state.lineItemForm;
      if (!description.trim() || !estimatedHours || !hourlyRate) return;

      isAddingLineItemInFlight = true;
      state = {
        ...state,
        isAddingLineItem: true,
        addLineItemError: null,
      };
      notify();

      try {
        await api.addLineItem(projectId, {
          category,
          description: description.trim(),
          estimated_hours: Number(estimatedHours),
          hourly_rate: Number(hourlyRate),
          is_recurring: isRecurring,
        });

        if (disposed) return;

        // Reset form on write success
        state = {
          ...state,
          isAddingLineItem: false,
          lineItemForm: {
            category: 'FRONTEND',
            description: '',
            estimatedHours: '',
            hourlyRate: '',
            isRecurring: false,
          },
        };
        isAddingLineItemInFlight = false;
        notify();

        // Refresh project data while strictly preserving dirty draft adjustments
        await controller.loadProject({ preserveDirtyDraft: true });
        if (state.loadError && !disposed) {
          state = {
            ...state,
            mutationCommittedRefreshError: 'Line item was saved, but refreshing project ledger failed. Click Retry to reload.',
          };
          notify();
        }
      } catch (err: unknown) {
        isAddingLineItemInFlight = false;
        if (disposed) return;
        const msg = err instanceof Error ? err.message : 'Failed to add line item';
        // Form inputs remain preserved on rejected write
        state = {
          ...state,
          isAddingLineItem: false,
          addLineItemError: msg,
        };
        notify();
      }
    },

    async handleDeleteLineItem(itemId: string) {
      if (deletingItemIdInFlight || state.deletingLineItemId) return;

      deletingItemIdInFlight = itemId;
      state = {
        ...state,
        deletingLineItemId: itemId,
        lineItemError: null,
      };
      notify();

      try {
        await api.deleteLineItem(itemId);
        deletingItemIdInFlight = null;
        if (disposed) return;

        state = {
          ...state,
          deletingLineItemId: null,
        };
        notify();

        // Refresh project data while strictly preserving dirty draft adjustments
        await controller.loadProject({ preserveDirtyDraft: true });
        if (state.loadError && !disposed) {
          state = {
            ...state,
            mutationCommittedRefreshError: 'Line item was deleted, but refreshing project ledger failed. Click Retry to reload.',
          };
          notify();
        }
      } catch (err: unknown) {
        deletingItemIdInFlight = null;
        if (disposed) return;
        const msg = err instanceof Error ? err.message : 'Failed to delete line item';
        state = {
          ...state,
          deletingLineItemId: null,
          lineItemError: msg,
        };
        notify();
      }
    },

    async handleDeleteProject(onDeleted: () => void) {
      if (isDeletingProjectInFlight || state.isDeletingProject) return;

      isDeletingProjectInFlight = true;
      state = {
        ...state,
        isDeletingProject: true,
        deleteProjectError: null,
      };
      notify();

      try {
        await api.deleteProject(projectId);
        isDeletingProjectInFlight = false;
        if (!disposed) {
          onDeleted();
        }
      } catch (err: unknown) {
        isDeletingProjectInFlight = false;
        if (disposed) return;
        const msg = err instanceof Error ? err.message : 'Failed to delete project';
        state = {
          ...state,
          isDeletingProject: false,
          deleteProjectError: msg,
        };
        notify();
      }
    },
  };

  return controller;
}

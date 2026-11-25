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
  let activeSessionId = 0;
  let activeGeneration = 0;
  let committedMutationVersion = 0;

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

  // Synchronous unified mutation lock across save/add/item-delete/project-delete
  let activeMutation: 'save' | 'add' | 'delete-item' | 'delete-project' | null = null;

  const controller = {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getState(): ProjectControllerState {
      return state;
    },

    /**
     * Called when an effect or coordinator mounts/activates.
     * Returns an unmount/cleanup function for that specific session.
     * Stale requests from previous sessions are muted, but a subsequent session
     * can load and become fully active without discarding component-held controller state.
     */
    activate() {
      const sessionId = ++activeSessionId;
      // Trigger initial load for this active session
      controller.loadProject();

      return () => {
        // When this session cleans up, bump session ID to invalidate pending requests from it
        if (activeSessionId === sessionId) {
          activeSessionId = ++activeSessionId;
        }
      };
    },

    /**
     * Terminal disposal when the route or owner unmounts permanently.
     */
    dispose() {
      disposed = true;
      activeSessionId = ++activeSessionId;
      listeners.clear();
    },

    isDirty(): boolean {
      return state.isDirty;
    },

    isMutationPending(): boolean {
      return activeMutation !== null;
    },

    setContingencyPercentage(val: number) {
      if (activeMutation !== null || state.isSaving) return;
      state = {
        ...state,
        contingencyPercentage: val,
        isDirty: true,
        saveSuccessMessage: null,
      };
      notify();
    },

    setProfitMargin(val: number) {
      if (activeMutation !== null || state.isSaving) return;
      state = {
        ...state,
        profitMargin: val,
        isDirty: true,
        saveSuccessMessage: null,
      };
      notify();
    },

    setStatus(status: Project['status']) {
      if (activeMutation !== null || state.isSaving) return;
      state = {
        ...state,
        status,
        isDirty: true,
        saveSuccessMessage: null,
      };
      notify();
    },

    setConfirmDeleteProject(confirm: boolean) {
      if (activeMutation !== null && confirm) return;
      state = { ...state, confirmDeleteProject: confirm };
      notify();
    },

    setActiveTab(tab: 'estimate' | 'audit') {
      state = { ...state, activeTab: tab };
      notify();
    },

    setLineItemForm(form: Partial<LineItemFormData>) {
      if (activeMutation === 'add' || state.isAddingLineItem) return;
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
      const thisSession = activeSessionId;
      const thisGen = ++activeGeneration;
      const readBaselineVersion = committedMutationVersion;

      // Only show top-level isLoading if we don't already have project data
      state = {
        ...state,
        isLoading: state.project === null,
        loadError: null,
        loadErrorType: null,
      };
      notify();

      try {
        const data = await api.getProjectById(projectId);
        if (disposed || activeSessionId !== thisSession || activeGeneration !== thisGen) {
          return;
        }

        // Stale-read protection: If a mutation committed while this read was in flight,
        // do not overwrite the newer mutation result with stale data.
        if (readBaselineVersion < committedMutationVersion) {
          // Read was superseded by a committed mutation; keep newer state
          state = {
            ...state,
            isLoading: false,
          };
          notify();
          return;
        }

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
        if (disposed || activeSessionId !== thisSession || activeGeneration !== thisGen) {
          return;
        }

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
      if (activeMutation !== null || !state.isDirty) return;

      activeMutation = 'save';
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
      const thisSession = activeSessionId;

      try {
        const updated = await api.updateProject(projectId, {
          contingency_percentage: submittedContingency,
          profit_margin: submittedMargin,
          status: submittedStatus,
        });

        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }

        committedMutationVersion++;

        state = {
          ...state,
          isSaving: false,
          project: updated,
          contingencyPercentage: Number(updated.contingencyPercentage) || 0,
          profitMargin: Number(updated.profitMargin) || 0,
          status: updated.status,
          isDirty: false,
          saveSuccessMessage: 'Project adjustments saved successfully.',
          mutationCommittedRefreshError: null,
        };
        activeMutation = null;
        notify();
      } catch (err: unknown) {
        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }
        const msg = err instanceof Error ? err.message : 'Failed to save project adjustments';
        // Note: Dirty values are strictly preserved
        state = {
          ...state,
          isSaving: false,
          saveError: msg,
        };
        activeMutation = null;
        notify();
      }
    },

    async handleAddLineItem() {
      if (activeMutation !== null) return;

      const { category, description, estimatedHours, hourlyRate, isRecurring } = state.lineItemForm;
      if (!description.trim() || !estimatedHours || !hourlyRate) return;

      activeMutation = 'add';
      state = {
        ...state,
        isAddingLineItem: true,
        addLineItemError: null,
      };
      notify();

      const thisSession = activeSessionId;

      try {
        await api.addLineItem(projectId, {
          category,
          description: description.trim(),
          estimated_hours: Number(estimatedHours),
          hourly_rate: Number(hourlyRate),
          is_recurring: isRecurring,
        });

        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }

        committedMutationVersion++;

        // Reset form on write success
        state = {
          ...state,
          lineItemForm: {
            category: 'FRONTEND',
            description: '',
            estimatedHours: '',
            hourlyRate: '',
            isRecurring: false,
          },
        };

        // Mutation lock remains held through add read reconciliation!
        // Refresh project data while strictly preserving dirty draft adjustments
        await controller.loadProject({ preserveDirtyDraft: true });

        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }

        if (state.loadError) {
          state = {
            ...state,
            mutationCommittedRefreshError: 'Line item was saved, but refreshing project ledger failed. Click Retry to reload.',
          };
        }

        activeMutation = null;
        state = {
          ...state,
          isAddingLineItem: false,
        };
        notify();
      } catch (err: unknown) {
        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }
        const msg = err instanceof Error ? err.message : 'Failed to add line item';
        // Form inputs remain preserved on rejected write
        state = {
          ...state,
          isAddingLineItem: false,
          addLineItemError: msg,
        };
        activeMutation = null;
        notify();
      }
    },

    async handleDeleteLineItem(itemId: string) {
      if (activeMutation !== null) return;

      activeMutation = 'delete-item';
      state = {
        ...state,
        deletingLineItemId: itemId,
        lineItemError: null,
      };
      notify();

      const thisSession = activeSessionId;

      try {
        await api.deleteLineItem(itemId);

        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }

        committedMutationVersion++;

        // Mutation lock remains held through delete read reconciliation!
        // Refresh project data while strictly preserving dirty draft adjustments
        await controller.loadProject({ preserveDirtyDraft: true });

        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }

        if (state.loadError) {
          state = {
            ...state,
            mutationCommittedRefreshError: 'Line item was deleted, but refreshing project ledger failed. Click Retry to reload.',
          };
        }

        activeMutation = null;
        state = {
          ...state,
          deletingLineItemId: null,
        };
        notify();
      } catch (err: unknown) {
        if (disposed || activeSessionId !== thisSession) {
          activeMutation = null;
          return;
        }
        const msg = err instanceof Error ? err.message : 'Failed to delete line item';
        state = {
          ...state,
          deletingLineItemId: null,
          lineItemError: msg,
        };
        activeMutation = null;
        notify();
      }
    },

    async handleDeleteProject(onDeleted: () => void) {
      if (activeMutation !== null) return;

      activeMutation = 'delete-project';
      state = {
        ...state,
        isDeletingProject: true,
        deleteProjectError: null,
      };
      notify();

      const thisSession = activeSessionId;

      try {
        await api.deleteProject(projectId);
        activeMutation = null;
        if (!disposed && activeSessionId === thisSession) {
          onDeleted();
        }
      } catch (err: unknown) {
        activeMutation = null;
        if (disposed || activeSessionId !== thisSession) return;
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

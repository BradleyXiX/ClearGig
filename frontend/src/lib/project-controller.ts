import { type Project, ApiError } from '../services/api.ts';

export type LoadErrorType = 'not_found' | 'unavailable' | 'unknown' | null;

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

  // Editable settings
  contingencyPercentage: number;
  profitMargin: number;
  status: Project['status'];

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

  // Add line item form
  lineItemForm: LineItemFormData;

  // UI state
  activeTab: 'estimate' | 'audit';
  statusMenuOpen: boolean;
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

  let state: ProjectControllerState = {
    project: null,
    isLoading: true,
    loadError: null,
    loadErrorType: null,

    contingencyPercentage: 0,
    profitMargin: 0,
    status: 'DRAFT',

    isSaving: false,
    saveError: null,
    saveSuccessMessage: null,

    isAddingLineItem: false,
    addLineItemError: null,

    deletingLineItemId: null,
    lineItemError: null,

    isDeletingProject: false,
    deleteProjectError: null,

    lineItemForm: {
      category: 'FRONTEND',
      description: '',
      estimatedHours: '',
      hourlyRate: '',
      isRecurring: false,
    },

    activeTab: 'estimate',
    statusMenuOpen: false,
    confirmDeleteProject: false,
  };

  const listeners = new Set<() => void>();
  const notify = () => {
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

    isDirty(): boolean {
      if (!state.project) return false;
      const initialContingency = Number(state.project.contingencyPercentage) || 0;
      const initialMargin = Number(state.project.profitMargin) || 0;
      const initialStatus = state.project.status;

      return (
        state.contingencyPercentage !== initialContingency ||
        state.profitMargin !== initialMargin ||
        state.status !== initialStatus
      );
    },

    setContingencyPercentage(val: number) {
      state = { ...state, contingencyPercentage: val, saveSuccessMessage: null };
      notify();
    },

    setProfitMargin(val: number) {
      state = { ...state, profitMargin: val, saveSuccessMessage: null };
      notify();
    },

    setStatus(status: Project['status']) {
      state = { ...state, status, saveSuccessMessage: null };
      notify();
    },

    setStatusMenuOpen(open: boolean) {
      state = { ...state, statusMenuOpen: open };
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
      };
      notify();
    },

    async loadProject() {
      state = { ...state, isLoading: true, loadError: null, loadErrorType: null };
      notify();

      try {
        const data = await api.getProjectById(projectId);
        state = {
          ...state,
          isLoading: false,
          project: data,
          contingencyPercentage: Number(data.contingencyPercentage) || 0,
          profitMargin: Number(data.profitMargin) || 0,
          status: data.status,
          loadError: null,
          loadErrorType: null,
        };
        notify();
      } catch (err: unknown) {
        let loadErrorType: LoadErrorType = 'unknown';
        let msg = 'Error loading project';

        if (err instanceof ApiError) {
          if (err.status === 404) {
            loadErrorType = 'not_found';
            msg = `Estimate "${projectId}" not found.`;
          } else if (err.status === 503 || err.code === 'DB_UNAVAILABLE') {
            loadErrorType = 'unavailable';
            msg = 'Service temporarily unavailable. Unable to reach database.';
          } else {
            msg = err.message;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }

        state = {
          ...state,
          isLoading: false,
          project: null,
          loadError: msg,
          loadErrorType,
        };
        notify();
      }
    },

    async handleSaveProject() {
      if (isSavingInFlight || state.isSaving || !controller.isDirty()) return;

      isSavingInFlight = true;
      state = {
        ...state,
        isSaving: true,
        saveError: null,
        saveSuccessMessage: null,
      };
      notify();

      try {
        const updated = await api.updateProject(projectId, {
          contingency_percentage: state.contingencyPercentage,
          profit_margin: state.profitMargin,
          status: state.status,
        });

        state = {
          ...state,
          isSaving: false,
          project: updated,
          contingencyPercentage: Number(updated.contingencyPercentage) || 0,
          profitMargin: Number(updated.profitMargin) || 0,
          status: updated.status,
          saveSuccessMessage: 'Project adjustments saved successfully.',
        };
        isSavingInFlight = false;
        notify();
      } catch (err: unknown) {
        isSavingInFlight = false;
        const msg = err instanceof Error ? err.message : 'Failed to save project adjustments';
        // Note: Dirty values (contingencyPercentage, profitMargin, status) are strictly preserved
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

        // Reset form on success
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

        // Refresh project data
        await controller.loadProject();
      } catch (err: unknown) {
        isAddingLineItemInFlight = false;
        const msg = err instanceof Error ? err.message : 'Failed to add line item';
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
        state = {
          ...state,
          deletingLineItemId: null,
        };
        notify();
        await controller.loadProject();
      } catch (err: unknown) {
        deletingItemIdInFlight = null;
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
        onDeleted();
      } catch (err: unknown) {
        isDeletingProjectInFlight = false;
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

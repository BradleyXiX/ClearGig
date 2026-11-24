import { saveEstimate, SaveEstimateError, type SaveDeps, type SaveResult } from './save-estimate.ts';

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface ClientItem {
  id: string;
  name: string;
}

export interface WizardState {
  step: number;
  clientInput: string;
  selectedClientId?: string;
  existingClients: ClientItem[];
  title: string;
  frontendHours: string;
  backendHours: string;
  hourlyRate: string;
  isSaving: boolean;
  saveError: string | null;
  recoverableProjectId: string | null;
  savedProjectId: string | null;
  confirmDiscard: boolean;
}

export interface WizardControllerOptions {
  deps: SaveDeps;
  storage?: StorageAdapter;
  initialClients?: ClientItem[];
}

export function createWizardController(options: WizardControllerOptions) {
  const { deps } = options;

  // Storage acquisition is guarded because accessing window.localStorage itself can throw SecurityError
  const getStorage = (): StorageAdapter | undefined => {
    if (options.storage) return options.storage;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      // Access to window.localStorage denied or failed
    }
    return undefined;
  };

  // Safe storage retrieval: best-effort, never crashes
  const getInitialRate = (): string => {
    try {
      const storage = getStorage();
      if (storage) {
        const val = storage.getItem('cleargig.rate');
        if (val) return val;
      }
    } catch {
      // storage unavailable or denied
    }
    return '150';
  };

  const safePersistRate = (rate: number) => {
    try {
      const storage = getStorage();
      if (storage) {
        storage.setItem('cleargig.rate', String(rate));
      }
    } catch {
      // storage unavailable or denied
    }
  };

  let state: WizardState = {
    step: 1,
    clientInput: '',
    selectedClientId: undefined,
    existingClients: options.initialClients ? [...options.initialClients] : [],
    title: '',
    frontendHours: '',
    backendHours: '',
    hourlyRate: getInitialRate(),
    isSaving: false,
    saveError: null,
    recoverableProjectId: null,
    savedProjectId: null,
    confirmDiscard: false,
  };

  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  // Synchronous in-flight guard to block concurrent invocations before state renders
  let isSavingInFlight = false;

  const controller = {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getState(): WizardState {
      return state;
    },

    setClients(clients: ClientItem[]) {
      state = { ...state, existingClients: clients };
      notify();
    },

    setStep(step: number | ((prev: number) => number)) {
      if (isSavingInFlight || state.isSaving) return;
      const nextStep = typeof step === 'function' ? step(state.step) : step;
      state = { ...state, step: nextStep };
      notify();
    },

    setClientInput(val: string) {
      if (isSavingInFlight || state.isSaving) return;
      const trimmed = val.trim();
      const match = state.existingClients.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      state = {
        ...state,
        clientInput: val,
        // If matched an existing client, select it; otherwise if user edited name, clear old selection
        selectedClientId: match ? match.id : undefined,
      };
      notify();
    },

    setTitle(val: string) {
      if (isSavingInFlight || state.isSaving) return;
      state = { ...state, title: val };
      notify();
    },

    setFrontendHours(val: string) {
      if (isSavingInFlight || state.isSaving) return;
      state = { ...state, frontendHours: val };
      notify();
    },

    setBackendHours(val: string) {
      if (isSavingInFlight || state.isSaving) return;
      state = { ...state, backendHours: val };
      notify();
    },

    setHourlyRate(val: string) {
      if (isSavingInFlight || state.isSaving) return;
      state = { ...state, hourlyRate: val };
      notify();
    },

    setConfirmDiscard(val: boolean) {
      state = { ...state, confirmDiscard: val };
      notify();
    },

    resetDraft() {
      // Explicit, deliberate fresh-draft action that clears recovery and draft (blocked while saving)
      if (isSavingInFlight || state.isSaving) return;
      state = {
        ...state,
        step: 1,
        clientInput: '',
        selectedClientId: undefined,
        title: '',
        frontendHours: '',
        backendHours: '',
        saveError: null,
        recoverableProjectId: null,
        savedProjectId: null,
        confirmDiscard: false,
      };
      notify();
    },

    onEnter() {
      // Guarded Enter handler
      if (isSavingInFlight || state.isSaving || state.recoverableProjectId) {
        // Locked: no progression or duplicate saves while saving or once a partial project exists
        return;
      }

      const fHours = Number(state.frontendHours) || 0;
      const bHours = Number(state.backendHours) || 0;

      if (state.step === 1 && state.clientInput.trim()) {
        state = { ...state, step: 2 };
        notify();
      } else if (state.step === 2 && state.title.trim()) {
        state = { ...state, step: 3 };
        notify();
      } else if (state.step === 3 && (fHours > 0 || bHours > 0)) {
        state = { ...state, step: 4 };
        notify();
      } else if (state.step === 4) {
        controller.handleSave();
      }
    },

    onShiftEnter() {
      if (isSavingInFlight || state.isSaving) return;
      if (state.step > 1 && state.step < 5) {
        state = { ...state, step: state.step - 1 };
        notify();
      }
    },

    async handleSave(): Promise<SaveResult | undefined> {
      // 1. Synchronous in-flight guard and recovery lock check
      if (isSavingInFlight || state.isSaving || state.recoverableProjectId) {
        return;
      }

      isSavingInFlight = true;
      state = {
        ...state,
        isSaving: true,
        saveError: null,
      };
      notify();

      // Snapshot the submitted draft values so asynchronous results associate strictly with this snapshot
      const submittedClientId = state.selectedClientId;
      const submittedClientName = state.clientInput.trim();
      const submittedTitle = state.title.trim();
      const fHours = Number(state.frontendHours) || 0;
      const bHours = Number(state.backendHours) || 0;
      const rate = Number(state.hourlyRate) || 150;

      safePersistRate(rate);

      try {
        const res = await saveEstimate(
          {
            clientId: submittedClientId,
            clientName: submittedClientName,
            title: submittedTitle,
            frontendHours: fHours,
            backendHours: bHours,
            hourlyRate: rate,
            contingencyPercentage: 15,
            profitMargin: 0,
          },
          deps
        );

        state = {
          ...state,
          isSaving: false,
          savedProjectId: res.projectId,
          step: 5,
        };
        isSavingInFlight = false;
        notify();
        return res;
      } catch (err: unknown) {
        isSavingInFlight = false;
        if (err instanceof SaveEstimateError) {
          if (err.projectId) {
            // Project created, line items failed. Lock against retry.
            state = {
              ...state,
              isSaving: false,
              recoverableProjectId: err.projectId,
              selectedClientId: err.clientId ?? submittedClientId,
              saveError: `Project "${submittedTitle}" was created with ID: ${err.projectId}, but saving line items failed: ${err.message}. You can inspect or complete the project directly. Further creation is locked to prevent duplicate estimates.`,
            };
          } else if (err.clientId) {
            // Client created, project creation failed. Retain clientId for retry without re-creating client.
            const updatedClients = [...state.existingClients];
            if (!updatedClients.some((c) => c.id === err.clientId)) {
              updatedClients.push({ id: err.clientId, name: err.clientName || submittedClientName });
            }
            state = {
              ...state,
              isSaving: false,
              selectedClientId: err.clientId,
              existingClients: updatedClients,
              saveError: `Client "${err.clientName}" was created, but creating the project failed. Retrying will reuse this client without creating duplicate client records.`,
            };
          } else {
            state = {
              ...state,
              isSaving: false,
              saveError: err.message,
            };
          }
        } else {
          state = {
            ...state,
            isSaving: false,
            saveError: err instanceof Error ? err.message : 'Failed to save estimate',
          };
        }
        notify();
      }
    },
  };

  return controller;
}

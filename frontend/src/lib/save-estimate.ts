export interface EstimateDraft {
  clientId?: string; // set when an existing client was picked
  clientName: string;
  title: string;
  frontendHours: number;
  backendHours: number;
  hourlyRate: number;
  contingencyPercentage: number;
  profitMargin: number;
}

export interface SaveDeps {
  createClient: (name: string) => Promise<{ id: string }>;
  createProject: (input: {
    clientId: string;
    title: string;
    contingencyPercentage: number;
    profitMargin: number;
  }) => Promise<{ id: string }>;
  addLineItem: (
    projectId: string,
    input: {
      category: 'FRONTEND' | 'BACKEND';
      description: string;
      estimatedHours: number;
      hourlyRate: number;
      isRecurring: boolean;
    }
  ) => Promise<unknown>;
}

export interface SaveResult {
  projectId: string;
  clientId: string;
  clientCreated: boolean;
}

export class SaveEstimateError extends Error {
  clientId?: string;
  clientName?: string;

  constructor(message: string, clientId?: string, clientName?: string) {
    super(message);
    this.name = 'SaveEstimateError';
    this.clientId = clientId;
    this.clientName = clientName;
  }
}

export async function saveEstimate(
  draft: EstimateDraft,
  deps: SaveDeps
): Promise<SaveResult> {
  if (draft.frontendHours <= 0 && draft.backendHours <= 0) {
    throw new SaveEstimateError(
      'Estimate must contain at least one category with estimated hours greater than zero.'
    );
  }

  let clientId = draft.clientId;
  let clientCreated = false;

  if (!clientId) {
    const client = await deps.createClient(draft.clientName);
    clientId = client.id;
    clientCreated = true;
  }

  let project: { id: string };
  try {
    project = await deps.createProject({
      clientId,
      title: draft.title,
      contingencyPercentage: draft.contingencyPercentage,
      profitMargin: draft.profitMargin,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (clientCreated) {
      throw new SaveEstimateError(
        `Failed to create project for client "${draft.clientName}". Client was created, but project failed: ${errorMsg}`,
        clientId,
        draft.clientName
      );
    }
    throw new SaveEstimateError(
      `Failed to create project: ${errorMsg}`,
      undefined,
      draft.clientName
    );
  }

  if (draft.frontendHours > 0) {
    await deps.addLineItem(project.id, {
      category: 'FRONTEND',
      description: 'Frontend Development',
      estimatedHours: draft.frontendHours,
      hourlyRate: draft.hourlyRate,
      isRecurring: false,
    });
  }

  if (draft.backendHours > 0) {
    await deps.addLineItem(project.id, {
      category: 'BACKEND',
      description: 'Backend & API Development',
      estimatedHours: draft.backendHours,
      hourlyRate: draft.hourlyRate,
      isRecurring: false,
    });
  }

  return {
    projectId: project.id,
    clientId,
    clientCreated,
  };
}


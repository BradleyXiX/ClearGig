const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  // Append /api/v1 if the user provided only the origin (e.g. https://cleargig-backend.onrender.com)
  if (!cleanUrl.endsWith('/api/v1')) {
    return `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export interface Client {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  projectId: string;
  category: 'FRONTEND' | 'BACKEND' | 'CLOUD' | 'MAINTENANCE';
  description: string;
  estimatedHours: number;
  hourlyRate: number;
  isRecurring: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  contingencyPercentage: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  lineItems?: LineItem[];
}

export interface CreateClientDTO {
  name: string;
  email?: string;
}

export interface CreateProjectDTO {
  client_id: string;
  title: string;
  contingency_percentage?: number;
  profit_margin?: number;
}

export interface CreateLineItemDTO {
  category: string;
  description: string;
  estimated_hours: number;
  hourly_rate: number;
  is_recurring?: boolean;
}

export interface UpdateProjectDTO {
  title?: string;
  status?: string;
  contingency_percentage?: number;
  profit_margin?: number;
}

// Global fetch helper
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(endpoint: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    // The API returns { error, message, code } and never raw error text.
    // Fall back to a generic message for non-JSON responses (proxy pages).
    let message = `Request failed (${res.status})`;
    let code: string | undefined;
    const raw = await res.text();
    if (raw) {
      try {
        const body = JSON.parse(raw) as { error?: string; message?: string; code?: string };
        message = body.message || body.error || message;
        code = body.code;
      } catch {
        // not JSON - keep the generic message
      }
    }
    throw new ApiError(res.status, message, code);
  }
  return res;
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await request(endpoint, options);
  if (res.status === 204) {
    throw new ApiError(res.status, `Unexpected 204 No Content for endpoint expecting JSON: ${endpoint}`);
  }
  const text = await res.text();
  if (!text) {
    throw new ApiError(res.status, `Empty response body for endpoint expecting JSON: ${endpoint}`);
  }
  return JSON.parse(text) as T;
}

async function fetchVoid(endpoint: string, options?: RequestInit): Promise<void> {
  await request(endpoint, options);
}

export const api = {
  async getClients(): Promise<Client[]> {
    return fetchJson<Client[]>('/clients');
  },

  async createClient(data: CreateClientDTO): Promise<Client> {
    return fetchJson<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    return fetchJson<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getProjects(): Promise<Project[]> {
    return fetchJson<Project[]>('/projects');
  },

  async getProjectById(id: string): Promise<Project> {
    return fetchJson<Project>(`/projects/${id}`);
  },

  async createProject(data: CreateProjectDTO): Promise<Project> {
    return fetchJson<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addLineItem(projectId: string, data: CreateLineItemDTO): Promise<LineItem> {
    return fetchJson<LineItem>(`/projects/${projectId}/line-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteLineItem(id: string): Promise<{ message: string }> {
    return fetchJson<{ message: string }>(`/line-items/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteProject(id: string): Promise<void> {
    return fetchVoid(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
};

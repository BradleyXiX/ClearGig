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
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

export const api = {
  async getClients(): Promise<Client[]> {
    return fetchAPI<Client[]>('/clients');
  },

  async createClient(data: CreateClientDTO): Promise<Client> {
    return fetchAPI<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    return fetchAPI<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getProjects(): Promise<Project[]> {
    return fetchAPI<Project[]>('/projects');
  },

  async getProjectById(id: string): Promise<Project> {
    return fetchAPI<Project>(`/projects/${id}`);
  },

  async createProject(data: CreateProjectDTO): Promise<Project> {
    return fetchAPI<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addLineItem(projectId: string, data: CreateLineItemDTO): Promise<LineItem> {
    return fetchAPI<LineItem>(`/projects/${projectId}/line-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteLineItem(id: string): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>(`/line-items/${id}`, {
      method: 'DELETE',
    });
  },

  async deleteProject(id: string): Promise<void> {
    return fetchAPI<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
};

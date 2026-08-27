const API_BASE_URL = 'http://localhost:5000/api/v1';

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

export const api = {
  async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  async createProject(data: CreateProjectDTO): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async addLineItem(projectId: string, data: CreateLineItemDTO): Promise<LineItem> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add line item');
    return response.json();
  },

  async deleteLineItem(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/line-items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete line item');
    return response.json();
  }
};

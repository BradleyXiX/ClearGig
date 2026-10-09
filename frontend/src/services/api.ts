const API_BASE_URL = 'http://localhost:5001/api/v1';

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

// MOCK DATA SETUP
const mockClients: Client[] = [
  { id: 'c1', name: 'Acme Corp', email: 'hello@acme.co', createdAt: new Date().toISOString() },
  { id: 'c2', name: 'Vercel Inc.', email: 'billing@vercel.com', createdAt: new Date().toISOString() },
];

const mockProjects: Project[] = [
  {
    id: 'p1',
    clientId: 'c1',
    title: 'E-commerce Overhaul',
    status: 'DRAFT',
    contingencyPercentage: 15,
    profitMargin: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: mockClients[0],
    lineItems: [
      { id: 'l1', projectId: 'p1', category: 'FRONTEND', description: 'Next.js App Router Setup', estimatedHours: 40, hourlyRate: 150, isRecurring: false },
      { id: 'l2', projectId: 'p1', category: 'BACKEND', description: 'Stripe Integration', estimatedHours: 25, hourlyRate: 150, isRecurring: false },
      { id: 'l3', projectId: 'p1', category: 'MAINTENANCE', description: 'Monthly Retainer', estimatedHours: 10, hourlyRate: 100, isRecurring: true },
    ]
  },
  {
    id: 'p2',
    clientId: 'c2',
    title: 'Marketing Site 3D',
    status: 'ACCEPTED',
    contingencyPercentage: 10,
    profitMargin: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    client: mockClients[1],
    lineItems: [
      { id: 'l4', projectId: 'p2', category: 'FRONTEND', description: 'Three.js Hero Section', estimatedHours: 60, hourlyRate: 200, isRecurring: false },
    ]
  }
];

// DELAY HELPER
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  async getClients(): Promise<Client[]> {
    await delay(500);
    return [...mockClients];
  },

  async createClient(data: CreateClientDTO): Promise<Client> {
    await delay(300);
    const newClient: Client = {
      id: `c${Date.now()}`,
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString()
    };
    mockClients.push(newClient);
    return newClient;
  },

  async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    await delay(300);
    const p = mockProjects.find(p => p.id === id);
    if (!p) throw new Error('Not found');
    Object.assign(p, data);
    return p;
  },

  async getProjects(): Promise<Project[]> {
    await delay(800);
    return [...mockProjects];
  },

  async getProjectById(id: string): Promise<Project> {
    await delay(400);
    const p = mockProjects.find(p => p.id === id);
    if (!p) throw new Error('Not found');
    return p;
  },

  async createProject(data: CreateProjectDTO): Promise<Project> {
    await delay(500);
    const newProject: Project = {
      id: `p${Date.now()}`,
      clientId: data.client_id,
      title: data.title,
      status: 'DRAFT',
      contingencyPercentage: data.contingency_percentage || 10,
      profitMargin: data.profit_margin || 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client: mockClients.find(c => c.id === data.client_id),
      lineItems: []
    };
    mockProjects.push(newProject);
    return newProject;
  },

  async addLineItem(projectId: string, data: CreateLineItemDTO): Promise<LineItem> {
    await delay(300);
    const p = mockProjects.find(p => p.id === projectId);
    if (!p) throw new Error('Not found');
    const li: LineItem = {
      id: `l${Date.now()}`,
      projectId,
      category: data.category as any,
      description: data.description,
      estimatedHours: data.estimated_hours,
      hourlyRate: data.hourly_rate,
      isRecurring: data.is_recurring || false
    };
    if (!p.lineItems) p.lineItems = [];
    p.lineItems.push(li);
    return li;
  },

  async deleteLineItem(id: string): Promise<{ message: string }> {
    await delay(200);
    mockProjects.forEach(p => {
      if (p.lineItems) {
        p.lineItems = p.lineItems.filter(li => li.id !== id);
      }
    });
    return { message: 'Deleted' };
  },

  async deleteProject(id: string): Promise<void> {
    await delay(300);
    const index = mockProjects.findIndex(p => p.id === id);
    if (index > -1) mockProjects.splice(index, 1);
  }
};

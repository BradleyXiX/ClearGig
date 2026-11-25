/**
 * Deterministic, clearly labelled fixture data for ClearGig local UI previews
 * and baseline verification. Uses invented sample names only — never production data.
 */

export const FIXTURE_CLIENTS = [
  {
    id: 'client-sample-northline',
    name: 'Northline Studio (Sample)',
    email: 'ops@northline-sample.example',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'client-sample-alder',
    name: 'Alder & Pine Software (Sample)',
    email: 'projects@alderpine-sample.example',
    createdAt: '2026-10-12T14:30:00.000Z',
  },
];

export const FIXTURE_PROJECTS = [
  {
    id: 'proj-sample-01',
    clientId: 'client-sample-northline',
    title: 'Website refresh (Sample fixture)',
    status: 'DRAFT',
    contingencyPercentage: 15,
    profitMargin: 20,
    createdAt: '2026-11-02T09:00:00.000Z',
    updatedAt: '2026-11-18T16:15:00.000Z',
    client: FIXTURE_CLIENTS[0],
    lineItems: [
      {
        id: 'li-sample-01',
        projectId: 'proj-sample-01',
        category: 'FRONTEND',
        description: 'Responsive marketing and intake interface',
        estimatedHours: 64,
        hourlyRate: 150,
        isRecurring: false,
      },
      {
        id: 'li-sample-02',
        projectId: 'proj-sample-01',
        category: 'BACKEND',
        description: 'Content schema and API integration',
        estimatedHours: 40,
        hourlyRate: 165,
        isRecurring: false,
      },
      {
        id: 'li-sample-03',
        projectId: 'proj-sample-01',
        category: 'MAINTENANCE',
        description: 'Monthly uptime monitoring and patching',
        estimatedHours: 8,
        hourlyRate: 150,
        isRecurring: true,
      },
    ],
  },
  {
    id: 'proj-sample-02',
    clientId: 'client-sample-alder',
    title: 'Client portal architecture (Sample fixture)',
    status: 'SENT',
    contingencyPercentage: 10,
    profitMargin: 25,
    createdAt: '2026-10-20T11:30:00.000Z',
    updatedAt: '2026-11-15T12:00:00.000Z',
    client: FIXTURE_CLIENTS[1],
    lineItems: [
      {
        id: 'li-sample-04',
        projectId: 'proj-sample-02',
        category: 'FRONTEND',
        description: 'Workspace views and document preview',
        estimatedHours: 80,
        hourlyRate: 160,
        isRecurring: false,
      },
      {
        id: 'li-sample-05',
        projectId: 'proj-sample-02',
        category: 'CLOUD',
        description: 'Managed infrastructure and staging environment',
        estimatedHours: 16,
        hourlyRate: 175,
        isRecurring: true,
      },
    ],
  },
];

export const FIXTURE_ERRORS = {
  unavailable: {
    status: 503,
    body: {
      error: 'Database unavailable',
      message: 'The database is temporarily unreachable. (Sample fixture error)',
      code: 'DB_UNAVAILABLE',
    },
  },
  notFound: {
    status: 404,
    body: {
      error: 'Project not found',
      message: 'Project not found',
      code: 'NOT_FOUND',
    },
  },
  badRequest: {
    status: 400,
    body: {
      error: 'Validation failed',
      message: 'Missing required fields',
      code: 'VALIDATION_ERROR',
    },
  },
};

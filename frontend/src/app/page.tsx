'use client';

import { useEffect, useState } from 'react';
import { Plus, LayoutDashboard } from 'lucide-react';
import { api, Project, Client } from '../services/api';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
      if (data.length > 0 && !newClientId) {
        setNewClientId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClientId) return;

    try {
      await api.createProject({
        title: newTitle,
        client_id: newClientId,
        contingency_percentage: 10, // Default 10%
        profit_margin: 20 // Default 20%
      });
      setNewTitle('');
      setNewClientId('');
      setIsCreating(false);
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    try {
      const newClient = await api.createClient({ name: newClientName, email: newClientEmail });
      await loadClients();
      setNewClientId(newClient.id);
      setIsCreatingClient(false);
      setNewClientName('');
      setNewClientEmail('');
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const activeProjects = projects.filter(p => p.status !== 'REJECTED');
  
  const totalValue = activeProjects.reduce((total, p) => {
    const base = p.lineItems?.filter(i => !i.isRecurring).reduce((sum, item) => sum + (Number(item.estimatedHours) * Number(item.hourlyRate)), 0) || 0;
    const contingency = base * (Number(p.contingencyPercentage) / 100);
    const profit = (base + contingency) * (Number(p.profitMargin) / 100);
    return total + base + contingency + profit;
  }, 0);

  const totalMRR = activeProjects.reduce((total, p) => {
    const recurring = p.lineItems?.filter(i => i.isRecurring).reduce((sum, item) => sum + (Number(item.estimatedHours) * Number(item.hourlyRate)), 0) || 0;
    const profit = recurring * (Number(p.profitMargin) / 100);
    return total + recurring + profit;
  }, 0);

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ClearGig</h1>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Estimate
        </button>
      </header>

      {isCreating && (
        <div className="mb-8 p-6 bg-card border border-border rounded-xl shadow-sm glass">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Create New Estimate</h2>
          <form onSubmit={handleCreateProject} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Project Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., E-commerce Redesign"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-1 flex justify-between">
                Client
                <button type="button" onClick={() => setIsCreatingClient(!isCreatingClient)} className="text-primary text-xs hover:underline">
                  {isCreatingClient ? 'Select Existing' : '+ New Client'}
                </button>
              </label>
              {isCreatingClient ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Client Name"
                  />
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Email (optional)"
                  />
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    disabled={!newClientName}
                    className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="" disabled>Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-md border border-border text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm glass hover:border-primary/50 transition-colors duration-300">
          <div className="text-muted-foreground text-sm font-medium mb-1">Total Pipeline Value</div>
          <div className="text-3xl font-bold text-foreground">
            {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm glass hover:border-emerald-500/50 transition-colors duration-300">
          <div className="text-muted-foreground text-sm font-medium mb-1">Monthly Recurring</div>
          <div className="text-3xl font-bold text-emerald-500">
            {totalMRR.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm glass hover:border-blue-500/50 transition-colors duration-300">
          <div className="text-muted-foreground text-sm font-medium mb-1">Active Estimates</div>
          <div className="text-3xl font-bold text-foreground">{activeProjects.length}</div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">Recent Estimates</h2>
        
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-24 bg-secondary rounded-xl"></div>
              <div className="h-24 bg-secondary rounded-xl"></div>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border">
            No estimates found. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

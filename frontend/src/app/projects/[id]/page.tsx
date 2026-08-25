'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { api, Project, LineItem } from '../../../services/api';
import LineItemTable from '../../../components/LineItemTable';
import SummaryPanel from '../../../components/SummaryPanel';

export default function ProjectDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local state for UI form
  const [category, setCategory] = useState('FRONTEND');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await api.getProjectById(id);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLineItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !estimatedHours || !hourlyRate) return;

    try {
      await api.addLineItem(id, {
        category,
        description,
        estimated_hours: Number(estimatedHours),
        hourly_rate: Number(hourlyRate),
        is_recurring: isRecurring
      });
      
      // Reset form
      setDescription('');
      setEstimatedHours('');
      setHourlyRate('');
      setIsRecurring(false);
      
      // Reload project to get updated items
      loadProject();
    } catch (error) {
      console.error('Error adding line item:', error);
    }
  };

  const handleDeleteLineItem = async (itemId: string) => {
    try {
      await api.deleteLineItem(itemId);
      loadProject();
    } catch (error) {
      console.error('Error deleting line item:', error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen p-8 flex items-center justify-center text-muted-foreground">Loading estimate details...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Link href="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Calculate costs
  const baseCost = project.lineItems?.filter(i => !i.isRecurring).reduce((sum, item) => sum + (Number(item.estimatedHours) * Number(item.hourlyRate)), 0) || 0;
  const recurringCost = project.lineItems?.filter(i => i.isRecurring).reduce((sum, item) => sum + (Number(item.estimatedHours) * Number(item.hourlyRate)), 0) || 0;

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.title}</h1>
            <p className="text-muted-foreground mt-1">Client ID: {project.clientId}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
              {project.status}
            </span>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
              <Save className="w-4 h-4" />
              Save Estimate
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Add Line Item Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm glass">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Add Line Item</h2>
            <form onSubmit={handleAddLineItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="FRONTEND">Frontend</option>
                    <option value="BACKEND">Backend</option>
                    <option value="CLOUD">Cloud/DevOps</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Set up authentication"
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Estimated Hours</label>
                  <input 
                    type="number" 
                    min="0" step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Hourly Rate ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium text-foreground">Recurring Monthly Cost</span>
                </label>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </form>
          </div>

          {/* Line Items Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Estimate Breakdown</h2>
            </div>
            <LineItemTable items={project.lineItems || []} onDelete={handleDeleteLineItem} />
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <SummaryPanel 
            baseCost={baseCost} 
            recurringCost={recurringCost}
            contingencyPercentage={Number(project.contingencyPercentage) || 0}
            profitMargin={Number(project.profitMargin) || 0}
          />

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Global Toggles</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                  <span>Contingency Buffer</span>
                  <span>{project.contingencyPercentage}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="50" step="5"
                  value={Number(project.contingencyPercentage)}
                  readOnly
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">Edit not implemented yet</p>
              </div>
              <div>
                <label className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                  <span>Profit Margin</span>
                  <span>{project.profitMargin}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="100" step="5"
                  value={Number(project.profitMargin)}
                  readOnly
                  className="w-full accent-primary"
                />
                 <p className="text-xs text-muted-foreground mt-1 text-right">Edit not implemented yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

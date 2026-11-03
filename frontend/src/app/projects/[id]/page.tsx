'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Project } from '@/services/api';
import { computeTotals } from '@/lib/totals';
import { folio } from '@/lib/folio';
import { Stamp } from '@/components/ui/Stamp';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import LineItemTable from '@/components/LineItemTable';
import { EstimateSummary } from '@/components/EstimateSummary';

export default function ProjectDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  // Local state for editable settings
  const [contingencyPercentage, setContingencyPercentage] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [status, setStatus] = useState<Project['status']>('DRAFT');

  // Add line item form state
  const [category, setCategory] = useState<'FRONTEND' | 'BACKEND' | 'CLOUD' | 'MAINTENANCE'>('FRONTEND');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const loadProject = async () => {
    try {
      const data = await api.getProjectById(id);
      setProject(data);
      setContingencyPercentage(Number(data.contingencyPercentage) || 0);
      setProfitMargin(Number(data.profitMargin) || 0);
      setStatus(data.status);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleAddLineItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !estimatedHours || !hourlyRate) return;

    try {
      await api.addLineItem(id, {
        category,
        description,
        estimated_hours: Number(estimatedHours),
        hourly_rate: Number(hourlyRate),
        is_recurring: isRecurring,
      });

      setDescription('');
      setEstimatedHours('');
      setHourlyRate('');
      setIsRecurring(false);
      loadProject();
    } catch (error) {
      console.error('Error adding line item:', error);
    }
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      await api.updateProject(id, {
        contingency_percentage: contingencyPercentage,
        profit_margin: profitMargin,
        status: status,
      });
      await loadProject();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
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

  const handleDeleteProject = async () => {
    try {
      await api.deleteProject(id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleExport = () => {
    window.open(`/projects/${id}/document`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-paper-sunken animate-pulse rounded-control" />
          <div className="h-64 bg-paper-sunken animate-pulse rounded-card" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-ink">Estimate not found</h2>
        <Link href="/dashboard" className="text-sm font-medium text-accent hover:underline">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const isLocked = status !== 'DRAFT';
  const isDirty =
    contingencyPercentage !== (Number(project.contingencyPercentage) || 0) ||
    profitMargin !== (Number(project.profitMargin) || 0) ||
    status !== project.status;

  const currentTotals = computeTotals({
    lineItems: project.lineItems,
    contingencyPercentage,
    profitMargin,
  });

  const folioNumber = folio(project);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-xs font-medium uppercase tracking-wider text-ink-muted hover:text-ink transition-colors duration-150 inline-block mb-4"
        >
          ← Back to dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                {folioNumber}
              </span>
              <span className="text-ink-muted">•</span>
              <span className="text-xs uppercase tracking-wider text-ink-muted">
                {project.client?.name ?? 'Unknown client'}
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-ink">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Stamp with dropdown menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="p-1 rounded-control hover:bg-paper-sunken transition-colors duration-150"
                title="Change status"
              >
                <Stamp status={status} />
              </button>
              {statusMenuOpen && (
                <div className="absolute right-0 mt-1 z-30 bg-paper-raised border border-rule rounded-card p-1 flex flex-col gap-1 min-w-32">
                  {(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatus(s);
                        setStatusMenuOpen(false);
                      }}
                      className="px-3 py-1.5 text-left text-xs uppercase tracking-wider text-ink hover:bg-paper-sunken rounded-control transition-colors duration-150"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSaveProject}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Two-item switch under title: Estimate | FinOps audit */}
        <div className="flex items-center gap-6 border-b border-rule mt-6">
          <button
            type="button"
            className="py-2 border-b-2 border-accent text-ink font-medium text-sm transition-colors duration-150"
          >
            Estimate
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="py-2 border-b-2 border-transparent text-ink-muted text-sm opacity-50 cursor-not-allowed transition-colors duration-150"
          >
            FinOps audit
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form + Ruled Ledger */}
        <div className="lg:col-span-2 space-y-8">
          {/* Add Line Item Form (hidden when locked) */}
          {isLocked ? (
            <div className="border border-rule rounded-card bg-paper-sunken p-6 text-center">
              <p className="text-sm text-ink-muted">
                Estimate is locked ({status}). Switch status back to DRAFT to add or remove items.
              </p>
            </div>
          ) : (
            <div className="border border-rule rounded-card bg-paper-raised p-6">
              <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted mb-4">
                Add line item
              </h2>
              <form onSubmit={handleAddLineItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-ink-muted block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as typeof category)}
                      className="w-full bg-paper-raised text-ink border border-rule rounded-control px-3 py-2 text-sm focus:outline-none focus:border-accent"
                    >
                      <option value="FRONTEND">Frontend</option>
                      <option value="BACKEND">Backend</option>
                      <option value="CLOUD">Cloud</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <Field
                      label="Description"
                      type="text"
                      placeholder="Scope module description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Field
                      label="Estimated hours"
                      type="number"
                      step="0.5"
                      min="0"
                      suffix="hrs"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Field
                      label="Hourly rate"
                      type="number"
                      step="1"
                      min="0"
                      suffix="$/hr"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-rule">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="accent-accent w-4 h-4 rounded-control"
                    />
                    <span className="text-xs uppercase tracking-wider text-ink">
                      Recurring monthly cost
                    </span>
                  </label>
                  <Button variant="secondary" size="sm" type="submit">
                    Add item
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Line items ledger */}
          <div className="border border-rule rounded-card bg-paper-raised p-6">
            <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted mb-4">
              Line items ledger
            </h2>
            <LineItemTable
              items={project.lineItems || []}
              onDelete={handleDeleteLineItem}
              isLocked={isLocked}
            />
          </div>
        </div>

        {/* Right Column: Summary rail + Global toggles + Delete */}
        <div className="space-y-6">
          <EstimateSummary
            totals={currentTotals}
            contingencyPercentage={contingencyPercentage}
            profitMargin={profitMargin}
            onExport={handleExport}
          />

          {/* Global Toggles */}
          <div className="border border-rule rounded-card bg-paper-raised p-6 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Project adjustments
            </h2>

            <Field
              label="Contingency buffer"
              type="number"
              step="1"
              min="0"
              max="100"
              suffix="%"
              value={contingencyPercentage}
              onChange={(e) => setContingencyPercentage(Number(e.target.value))}
              disabled={isLocked}
            />

            <Field
              label="Profit margin"
              type="number"
              step="1"
              min="0"
              max="100"
              suffix="%"
              value={profitMargin}
              onChange={(e) => setProfitMargin(Number(e.target.value))}
              disabled={isLocked}
            />
          </div>

          {/* Destructive Action with two-step inline confirm */}
          <div className="border border-rule rounded-card bg-paper-raised p-6">
            {confirmDeleteProject ? (
              <div className="space-y-3">
                <p className="text-xs text-danger">
                  Permanently delete this estimate?
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" onClick={handleDeleteProject} className="flex-1">
                    Confirm delete
                  </Button>
                  <Button variant="quiet" size="sm" onClick={() => setConfirmDeleteProject(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDeleteProject(true)}
                className="w-full"
              >
                Delete estimate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useSyncExternalStore, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { computeTotals } from '@/lib/totals';
import { folio } from '@/lib/folio';
import {
  createProjectController,
  type ProjectControllerState,
} from '@/lib/project-controller';
import { Stamp } from '@/components/ui/Stamp';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import LineItemTable from '@/components/LineItemTable';
import { EstimateSummary } from '@/components/EstimateSummary';
import { FinOpsAudit } from '@/components/FinOpsAudit';

export default function ProjectDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Initialize project controller once per component lifetime
  const [controller] = React.useState(() =>
    createProjectController({
      projectId: id,
      api,
    })
  );

  const state: ProjectControllerState = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState
  );

  useEffect(() => {
    controller.loadProject();
  }, [controller]);

  const handleCancelDeleteProject = () => {
    controller.setConfirmDeleteProject(false);
    // Return focus logically to the delete trigger button
    deleteTriggerRef.current?.focus();
  };

  const handleExportEstimate = () => {
    window.open(`/projects/${id}/document`, '_blank');
  };

  const handleExportAudit = () => {
    window.open(`/projects/${id}/document?variant=audit`, '_blank');
  };

  if (state.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-paper-sunken animate-pulse rounded-control" />
          <div className="h-64 bg-paper-sunken animate-pulse rounded-card" />
        </div>
      </div>
    );
  }

  if (state.loadErrorType === 'not_found' || (!state.project && !state.isLoading && state.loadErrorType !== 'unavailable')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <h2 className="text-2xl font-semibold text-ink">Estimate not found</h2>
        <p className="text-sm text-ink-muted">
          {state.loadError ?? `Estimate "${id}" does not exist in the ledger.`}
        </p>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center font-sans rounded-control font-medium h-9 px-4 py-2 text-xs uppercase tracking-wider bg-ink text-paper hover:bg-forest transition-colors duration-150"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (state.loadErrorType === 'unavailable') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <h2 className="text-2xl font-semibold text-ink">Service unavailable</h2>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          {state.loadError ?? 'Unable to connect to the ClearGig database service. Your data is safe.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="primary" onClick={() => controller.loadProject()}>
            Retry connection
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center font-sans rounded-control font-medium h-11 px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-paper-sunken transition-colors duration-150"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const project = state.project!;
  const isLocked = state.status !== 'DRAFT';
  const isDirty = controller.isDirty();

  const currentTotals = computeTotals({
    lineItems: project.lineItems || [],
    contingencyPercentage: state.contingencyPercentage,
    profitMargin: state.profitMargin,
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
            {/* Status Stamp with accessible dropdown menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => controller.setStatusMenuOpen(!state.statusMenuOpen)}
                aria-expanded={state.statusMenuOpen}
                aria-haspopup="listbox"
                className="p-1 rounded-control hover:bg-paper-sunken transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-forest"
                title="Change status"
              >
                <Stamp status={state.status} />
              </button>
              {state.statusMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Estimate status options"
                  className="absolute right-0 mt-1 z-30 bg-paper-raised border border-rule rounded-card p-1 flex flex-col gap-1 min-w-36 shadow-lg"
                >
                  {(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="option"
                      aria-selected={state.status === s}
                      onClick={() => {
                        controller.setStatus(s);
                        controller.setStatusMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 text-left text-xs uppercase tracking-wider rounded-control transition-colors duration-150 ${
                        state.status === s
                          ? 'bg-ink text-paper font-semibold'
                          : 'text-ink hover:bg-paper-sunken'
                      }`}
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
              onClick={() => controller.handleSaveProject()}
              disabled={!isDirty || state.isSaving}
            >
              {state.isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Persistent Mutation Feedback Alerts */}
        {state.saveError && (
          <div
            role="alert"
            className="mt-4 border border-danger rounded-card p-3 bg-paper-sunken text-xs text-danger flex justify-between items-center"
          >
            <span>{state.saveError}</span>
            <Button variant="quiet" size="sm" onClick={() => controller.clearMessages()}>
              Dismiss
            </Button>
          </div>
        )}

        {state.saveSuccessMessage && (
          <div
            role="status"
            className="mt-4 border border-accent rounded-card p-3 bg-paper-raised text-xs text-accent flex justify-between items-center"
          >
            <span>{state.saveSuccessMessage}</span>
            <Button variant="quiet" size="sm" onClick={() => controller.clearMessages()}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Two-item switch under title: Estimate | FinOps audit */}
        <div className="flex items-center gap-6 border-b border-rule mt-6" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={state.activeTab === 'estimate'}
            onClick={() => controller.setActiveTab('estimate')}
            className={`py-2 border-b-2 text-sm transition-colors duration-150 ${
              state.activeTab === 'estimate'
                ? 'border-accent text-ink font-medium'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Estimate
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={state.activeTab === 'audit'}
            onClick={() => controller.setActiveTab('audit')}
            className={`py-2 border-b-2 text-sm transition-colors duration-150 ${
              state.activeTab === 'audit'
                ? 'border-accent text-ink font-medium'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            FinOps audit
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {state.activeTab === 'estimate' ? (
            <>
              {/* Add Line Item Form (hidden when locked) */}
              {isLocked ? (
                <div className="border border-rule rounded-card bg-paper-sunken p-6 text-center">
                  <p className="text-sm text-ink-muted">
                    Estimate is currently in <span className="font-semibold">{state.status}</span> status. Switch status back to DRAFT to add or remove items.
                  </p>
                </div>
              ) : (
                <div className="border border-rule rounded-card bg-paper-raised p-6 space-y-4">
                  <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                    Add line item
                  </h2>

                  {state.addLineItemError && (
                    <div
                      role="alert"
                      className="border border-danger rounded-card p-3 bg-paper-sunken text-xs text-danger"
                    >
                      {state.addLineItemError}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      controller.handleAddLineItem();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="line-item-category"
                          className="text-xs font-medium uppercase tracking-wider text-ink-muted block mb-1"
                        >
                          Category
                        </label>
                        <select
                          id="line-item-category"
                          value={state.lineItemForm.category}
                          onChange={(e) =>
                            controller.setLineItemForm({
                              category: e.target.value as typeof state.lineItemForm.category,
                            })
                          }
                          disabled={state.isAddingLineItem}
                          className="w-full bg-paper-raised text-ink border border-rule rounded-control px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
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
                          value={state.lineItemForm.description}
                          onChange={(e) =>
                            controller.setLineItemForm({ description: e.target.value })
                          }
                          disabled={state.isAddingLineItem}
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
                          value={state.lineItemForm.estimatedHours}
                          onChange={(e) =>
                            controller.setLineItemForm({ estimatedHours: e.target.value })
                          }
                          disabled={state.isAddingLineItem}
                          required
                        />
                      </div>
                      <div>
                        <Field
                          label="Hourly rate"
                          type="number"
                          step="1"
                          min="0"
                          prefix="$"
                          suffix="/hr"
                          value={state.lineItemForm.hourlyRate}
                          onChange={(e) =>
                            controller.setLineItemForm({ hourlyRate: e.target.value })
                          }
                          disabled={state.isAddingLineItem}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-rule">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.lineItemForm.isRecurring}
                          onChange={(e) =>
                            controller.setLineItemForm({ isRecurring: e.target.checked })
                          }
                          disabled={state.isAddingLineItem}
                          className="accent-accent w-4 h-4 rounded-control"
                        />
                        <span className="text-xs uppercase tracking-wider text-ink">
                          Recurring monthly cost
                        </span>
                      </label>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="submit"
                        disabled={state.isAddingLineItem}
                      >
                        {state.isAddingLineItem ? 'Adding item...' : 'Add item'}
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
                  onDelete={(itemId) => controller.handleDeleteLineItem(itemId)}
                  isLocked={isLocked}
                  deletingId={state.deletingLineItemId}
                  errorMessage={state.lineItemError}
                />
              </div>
            </>
          ) : (
            <FinOpsAudit
              defaultMonthlySpend={
                currentTotals.recurringMonthly > 0 ? currentTotals.recurringMonthly : 12500
              }
            />
          )}
        </div>

        {/* Right Column: Summary rail + Global toggles + Delete */}
        <div className="space-y-6">
          {state.activeTab === 'estimate' ? (
            <EstimateSummary
              totals={currentTotals}
              contingencyPercentage={state.contingencyPercentage}
              profitMargin={state.profitMargin}
              onExport={handleExportEstimate}
            />
          ) : (
            <div className="border border-rule rounded-card bg-paper-raised p-6 space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Audit export
              </h2>
              <Button variant="primary" onClick={handleExportAudit} className="w-full">
                Export audit
              </Button>
            </div>
          )}

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
              value={state.contingencyPercentage}
              onChange={(e) => controller.setContingencyPercentage(Number(e.target.value))}
              disabled={isLocked || state.isSaving}
            />

            <Field
              label="Profit margin"
              type="number"
              step="1"
              min="0"
              max="100"
              suffix="%"
              value={state.profitMargin}
              onChange={(e) => controller.setProfitMargin(Number(e.target.value))}
              disabled={isLocked || state.isSaving}
            />
          </div>

          {/* Destructive Action with two-step inline confirm */}
          <div className="border border-rule rounded-card bg-paper-raised p-6">
            {state.confirmDeleteProject ? (
              <div className="space-y-3">
                <p className="text-xs text-danger">
                  Permanently delete this estimate?
                </p>
                {state.deleteProjectError && (
                  <p className="text-xs text-danger font-medium">
                    {state.deleteProjectError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={state.isDeletingProject}
                    onClick={() =>
                      controller.handleDeleteProject(() => {
                        router.push('/dashboard');
                      })
                    }
                    className="flex-1"
                  >
                    {state.isDeletingProject ? 'Deleting...' : 'Confirm delete'}
                  </Button>
                  <Button
                    variant="quiet"
                    size="sm"
                    disabled={state.isDeletingProject}
                    onClick={handleCancelDeleteProject}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                ref={deleteTriggerRef}
                variant="danger"
                size="sm"
                onClick={() => controller.setConfirmDeleteProject(true)}
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

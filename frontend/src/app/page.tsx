'use client';

import React, { useEffect, useSyncExternalStore, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { type SaveDeps } from '@/lib/save-estimate';
import {
  createWizardController,
  type WizardState,
} from '@/lib/wizard-controller';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Rule } from '@/components/ui/Rule';

export default function WizardPage() {
  const router = useRouter();
  const clientInputId = useId();

  // Create wizard controller once per component lifetime using lazy state initializer
  const [controller] = React.useState(() => {
    const deps: SaveDeps = {
      createClient: (name) => api.createClient({ name }),
      createProject: (i) =>
        api.createProject({
          client_id: i.clientId,
          title: i.title,
          contingency_percentage: i.contingencyPercentage,
          profit_margin: i.profitMargin,
        }),
      addLineItem: (projectId, i) =>
        api.addLineItem(projectId, {
          category: i.category,
          description: i.description,
          estimated_hours: i.estimatedHours,
          hourly_rate: i.hourlyRate,
          is_recurring: i.isRecurring,
        }),
    };
    return createWizardController({ deps });
  });

  // Subscribe to controller state changes with useSyncExternalStore
  const state: WizardState = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState
  );

  useEffect(() => {
    api
      .getClients()
      .then((clients) => {
        controller.setClients(clients);
      })
      .catch(() => {});
  }, [controller]);

  // Navigate upon successful save
  useEffect(() => {
    if (state.savedProjectId && state.step === 5) {
      router.push(`/projects/${state.savedProjectId}`);
    }
  }, [state.savedProjectId, state.step, router]);

  const fHours = Number(state.frontendHours) || 0;
  const bHours = Number(state.backendHours) || 0;
  const rate = Number(state.hourlyRate) || 150;
  const baseCost = (fHours + bHours) * rate;
  const contingency = Math.round(baseCost * 0.15);
  const total = baseCost + contingency;
  const isDirty = Boolean(
    state.clientInput || state.title || state.frontendHours || state.backendHours
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.confirmDiscard) {
          router.push('/dashboard');
        } else if (isDirty) {
          controller.setConfirmDiscard(true);
        } else {
          router.push('/dashboard');
        }
      } else if (e.key === 'Enter') {
        const target = e.target;
        if (
          target instanceof HTMLElement &&
          (target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.getAttribute('role') === 'button')
        ) {
          // Let the focused button or link handle its own activation
          return;
        }

        if (e.shiftKey) {
          controller.onShiftEnter();
        } else {
          controller.onEnter();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [controller, isDirty, router, state.confirmDiscard]);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 text-ink">
      <div role="status" aria-live="polite" className="sr-only">
        {state.step === 1 && 'Step 1 of 5: Client identification'}
        {state.step === 2 && 'Step 2 of 5: Project title'}
        {state.step === 3 && 'Step 3 of 5: Scope hours and shared rate'}
        {state.step === 4 && 'Step 4 of 5: Estimate review'}
        {state.step === 5 && 'Step 5 of 5: Estimate saved'}
      </div>

      <div className="space-y-2 mb-8">
        <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-ink-muted">
          <span>New estimate</span>
          <span>Step {state.step} of 5</span>
        </div>
        <Rule />
      </div>

      {state.confirmDiscard && (
        <div className="border border-danger rounded-card p-4 bg-paper-sunken space-y-3 mb-6">
          <p className="text-xs text-danger">Discard draft and return to dashboard?</p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              Discard
            </Button>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => controller.setConfirmDiscard(false)}
            >
              Continue editing
            </Button>
          </div>
        </div>
      )}

      {state.saveError && (
        <div className="border border-danger rounded-card p-4 bg-paper-sunken text-xs text-danger mb-6 space-y-3">
          <p>{state.saveError}</p>
          {state.recoverableProjectId && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/projects/${state.recoverableProjectId}`}
                className="inline-flex items-center justify-center font-sans rounded-control font-medium h-9 px-3 py-1.5 text-xs uppercase tracking-wider bg-ink text-paper hover:bg-forest transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest"
              >
                Inspect partial project ({state.recoverableProjectId})
              </Link>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => controller.resetDraft()}
              >
                Start fresh draft
              </Button>
            </div>
          )}
        </div>
      )}

      {state.step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Who is the client?
            </h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">
              Select an existing client or enter a new name
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={clientInputId}
              className="text-sm font-medium text-ink-muted"
            >
              Client name
            </label>
            <div className="flex items-center w-full bg-paper text-ink border border-control-border rounded-control px-3 py-2 text-base transition-colors duration-150 focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-forest">
              <input
                id={clientInputId}
                list="wizard-clients"
                value={state.clientInput}
                onChange={(e) => controller.setClientInput(e.target.value)}
                placeholder="e.g. Acme Corporation"
                autoFocus
                className="w-full bg-transparent outline-none placeholder:text-ink-muted placeholder:opacity-60 text-base"
              />
            </div>
            <datalist id="wizard-clients">
              {state.existingClients.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            {state.selectedClientId && (
              <span className="text-xs font-mono text-accent">
                Existing client selected
              </span>
            )}
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="quiet"
              onClick={() =>
                isDirty ? controller.setConfirmDiscard(true) : router.push('/dashboard')
              }
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!state.clientInput.trim()}
              onClick={() => controller.setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {state.step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              What is the project title?
            </h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">
              Brief scope directive or project name
            </p>
          </div>
          <Field
            label="Project title"
            value={state.title}
            onChange={(e) => controller.setTitle(e.target.value)}
            placeholder="e.g. Platform Migration"
            autoFocus
          />
          <div className="flex justify-between items-center pt-4">
            <Button variant="quiet" onClick={() => controller.setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!state.title.trim()}
              onClick={() => controller.setStep(3)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {state.step === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Estimated scope & rate
            </h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">
              Enter hours and shared hourly rate
            </p>
          </div>
          <div className="space-y-4">
            <Field
              label="Frontend scope"
              type="number"
              min="0"
              suffix="hrs"
              value={state.frontendHours}
              onChange={(e) => controller.setFrontendHours(e.target.value)}
              autoFocus
            />
            <Field
              label="Backend scope"
              type="number"
              min="0"
              suffix="hrs"
              value={state.backendHours}
              onChange={(e) => controller.setBackendHours(e.target.value)}
            />
            <Field
              label="Shared hourly rate"
              type="number"
              min="1"
              prefix="$"
              suffix="/hr"
              value={state.hourlyRate}
              onChange={(e) => controller.setHourlyRate(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button variant="quiet" onClick={() => controller.setStep(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={fHours <= 0 && bHours <= 0}
              onClick={() => controller.setStep(4)}
            >
              Review
            </Button>
          </div>
        </div>
      )}

      {state.step === 4 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Review estimate
            </h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">
              Verify details before creating
            </p>
          </div>
          <div className="border border-rule rounded-card bg-paper-raised p-6 space-y-4 font-mono text-sm">
            <div className="flex justify-between text-ink">
              <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
                Client
              </span>
              <span className="font-medium">{state.clientInput}</span>
            </div>
            <div className="flex justify-between text-ink">
              <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
                Title
              </span>
              <span className="font-medium">{state.title}</span>
            </div>
            <div className="flex justify-between text-ink">
              <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
                Scope
              </span>
              <span>
                {fHours}h FE + {bHours}h BE @ ${rate}/hr
              </span>
            </div>
            <div className="flex justify-between text-ink">
              <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
                Contingency (15%)
              </span>
              <span className="tabular-nums">
                ${contingency.toLocaleString('en-US')}
              </span>
            </div>
            <Rule strong />
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">
                Total
              </span>
              <span className="text-4xl font-semibold tabular-nums text-accent">
                ${total.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="quiet"
              disabled={state.isSaving}
              onClick={() => controller.setStep(3)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              disabled={state.isSaving || Boolean(state.recoverableProjectId)}
              onClick={() => controller.handleSave()}
            >
              {state.isSaving
                ? 'Saving...'
                : state.recoverableProjectId
                ? 'Creation locked'
                : 'Save estimate'}
            </Button>
          </div>
        </div>
      )}

      {state.step === 5 && (
        <div className="space-y-6 text-center py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Estimate saved
          </h1>
          <p className="text-sm text-ink-muted">Project has been created successfully.</p>
          {state.savedProjectId && (
            <div className="pt-4 flex justify-center gap-4">
              <Link
                href={`/projects/${state.savedProjectId}`}
                className="inline-flex items-center justify-center font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-4 py-2 text-sm font-medium h-11 bg-ink text-paper hover:bg-forest"
              >
                Open estimate
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-4 py-2 text-sm font-medium h-11 bg-transparent text-ink-muted hover:text-ink hover:bg-paper-sunken"
              >
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

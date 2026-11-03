'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Client } from '@/services/api';
import { saveEstimate, SaveEstimateError, type SaveDeps } from '@/lib/save-estimate';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Rule } from '@/components/ui/Rule';

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [existingClients, setExistingClients] = useState<Client[]>([]);
  const [clientInput, setClientInput] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [frontendHours, setFrontendHours] = useState('');
  const [backendHours, setBackendHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('150');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    api.getClients().then(setExistingClients).catch(() => {});
    const cachedRate = localStorage.getItem('cleargig.rate');
    if (cachedRate) setHourlyRate(cachedRate);
  }, []);

  const fHours = Number(frontendHours) || 0;
  const bHours = Number(backendHours) || 0;
  const rate = Number(hourlyRate) || 150;
  const baseCost = (fHours + bHours) * rate;
  const contingency = Math.round(baseCost * 0.15);
  const total = baseCost + contingency;
  const isDirty = Boolean(clientInput || title || frontendHours || backendHours);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      localStorage.setItem('cleargig.rate', String(rate));
      const deps: SaveDeps = {
        createClient: (name) => api.createClient({ name }),
        createProject: (i) => api.createProject({
          client_id: i.clientId,
          title: i.title,
          contingency_percentage: i.contingencyPercentage,
          profit_margin: i.profitMargin,
        }),
        addLineItem: (projectId, i) => api.addLineItem(projectId, {
          category: i.category,
          description: i.description,
          estimated_hours: i.estimatedHours,
          hourly_rate: i.hourlyRate,
          is_recurring: i.isRecurring,
        }),
      };
      const res = await saveEstimate({
        clientId: selectedClientId,
        clientName: clientInput.trim(),
        title: title.trim(),
        frontendHours: fHours,
        backendHours: bHours,
        hourlyRate: rate,
        contingencyPercentage: 15,
        profitMargin: 0,
      }, deps);
      setSavedProjectId(res.projectId);
      setStep(5);
      router.push('/projects/' + res.projectId);
    } catch (err: unknown) {
      if (err instanceof SaveEstimateError) {
        setSaveError(err.clientId ? `Client "${err.clientName}" was saved, but the estimate was not: ${err.message}` : err.message);
      } else {
        setSaveError(err instanceof Error ? err.message : 'Failed to save estimate');
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDiscard) router.push('/dashboard');
        else if (isDirty) setConfirmDiscard(true);
        else router.push('/dashboard');
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          if (step > 1 && step < 5) setStep((s) => s - 1);
        } else {
          if (step === 1 && clientInput.trim()) setStep(2);
          else if (step === 2 && title.trim()) setStep(3);
          else if (step === 3 && (fHours > 0 || bHours > 0)) setStep(4);
          else if (step === 4) handleSave();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, clientInput, title, fHours, bHours, confirmDiscard, isDirty, isSaving]);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 text-ink">
      <div className="space-y-2 mb-8">
        <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-ink-muted">
          <span>New estimate</span>
          <span>{step} of 5</span>
        </div>
        <Rule />
      </div>

      {confirmDiscard && (
        <div className="border border-danger rounded-card p-4 bg-paper-sunken space-y-3 mb-6">
          <p className="text-xs text-danger">Discard draft and return to dashboard?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => router.push('/dashboard')}>Discard</Button>
            <Button variant="quiet" size="sm" onClick={() => setConfirmDiscard(false)}>Continue editing</Button>
          </div>
        </div>
      )}

      {saveError && (
        <div className="border border-danger rounded-card p-4 bg-paper-sunken text-xs text-danger mb-6">
          {saveError}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Who is the client?</h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">Select an existing client or enter a new name</p>
          </div>
          <div className="space-y-2">
            <input
              list="wizard-clients"
              value={clientInput}
              onChange={(e) => {
                const val = e.target.value;
                setClientInput(val);
                const match = existingClients.find((c) => c.name.toLowerCase() === val.trim().toLowerCase());
                setSelectedClientId(match ? match.id : undefined);
              }}
              placeholder="Client name"
              autoFocus
              className="w-full border border-rule rounded-control bg-paper-sunken px-3 py-2 text-ink text-sm focus:outline-none focus:border-accent"
            />
            <datalist id="wizard-clients">
              {existingClients.map((c) => <option key={c.id} value={c.name} />)}
            </datalist>
            {selectedClientId && <span className="text-xs font-mono text-accent">Existing client selected</span>}
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button variant="quiet" onClick={() => isDirty ? setConfirmDiscard(true) : router.push('/dashboard')}>Cancel</Button>
            <Button variant="primary" disabled={!clientInput.trim()} onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">What is the project title?</h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">Brief scope directive or project name</p>
          </div>
          <Field label="Project title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Platform Migration" autoFocus />
          <div className="flex justify-between items-center pt-4">
            <Button variant="quiet" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" disabled={!title.trim()} onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Estimated scope & rate</h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">Enter hours and shared hourly rate</p>
          </div>
          <div className="space-y-4">
            <Field label="Frontend scope" type="number" min="0" suffix="hrs" value={frontendHours} onChange={(e) => setFrontendHours(e.target.value)} autoFocus />
            <Field label="Backend scope" type="number" min="0" suffix="hrs" value={backendHours} onChange={(e) => setBackendHours(e.target.value)} />
            <Field label="Shared hourly rate" type="number" min="1" prefix="$" suffix="/hr" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button variant="quiet" onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" disabled={fHours <= 0 && bHours <= 0} onClick={() => setStep(4)}>Review</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Review estimate</h1>
            <p className="text-xs uppercase tracking-wider text-ink-muted mt-1">Verify details before creating</p>
          </div>
          <div className="border border-rule rounded-card bg-paper-raised p-6 space-y-4 font-mono text-sm">
            <div className="flex justify-between text-ink"><span className="text-ink-muted font-sans text-xs uppercase tracking-wider">Client</span><span className="font-medium">{clientInput}</span></div>
            <div className="flex justify-between text-ink"><span className="text-ink-muted font-sans text-xs uppercase tracking-wider">Title</span><span className="font-medium">{title}</span></div>
            <div className="flex justify-between text-ink"><span className="text-ink-muted font-sans text-xs uppercase tracking-wider">Scope</span><span>{fHours}h FE + {bHours}h BE @ ${rate}/hr</span></div>
            <div className="flex justify-between text-ink"><span className="text-ink-muted font-sans text-xs uppercase tracking-wider">Contingency (15%)</span><span className="tabular-nums">${contingency.toLocaleString('en-US')}</span></div>
            <Rule strong />
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-sans text-xs uppercase tracking-wider text-ink-muted">Total</span>
              <span className="text-4xl font-semibold tabular-nums text-accent">${total.toLocaleString('en-US')}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button variant="quiet" onClick={() => setStep(3)}>Back</Button>
            <Button variant="primary" disabled={isSaving} onClick={handleSave}>{isSaving ? 'Saving...' : 'Save estimate'}</Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 text-center py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Estimate saved</h1>
          <p className="text-sm text-ink-muted">Project has been created successfully.</p>
          {savedProjectId && (
            <div className="pt-4 flex justify-center gap-4">
              <Link href={`/projects/${savedProjectId}`}><Button variant="primary">Open estimate</Button></Link>
              <Link href="/dashboard"><Button variant="quiet">Go to dashboard</Button></Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

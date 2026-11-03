'use client';

import { useState } from 'react';
import type { LineItem } from '../services/api';
import { Button } from './ui/Button';

interface LineItemTableProps {
  items: LineItem[];
  onDelete: (id: string) => void;
  isLocked?: boolean;
}

export default function LineItemTable({
  items,
  onDelete,
  isLocked = false,
}: LineItemTableProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-ink-muted">
        No line items added yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-rule text-xs font-medium uppercase tracking-wider text-ink-muted">
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 px-4">Category</th>
            <th className="py-2 px-4 text-right">Hours</th>
            <th className="py-2 px-4 text-right">Rate</th>
            <th className="py-2 px-4 text-right">Subtotal</th>
            {!isLocked && <th className="py-2 pl-4 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {items.map((item) => {
            const subtotal = Number(item.estimatedHours) * Number(item.hourlyRate);
            const isConfirming = confirmingId === item.id;

            return (
              <tr key={item.id} className="h-12 hover:bg-paper-sunken transition-colors duration-150">
                <td className="py-3 pr-4 text-sm font-medium text-ink">
                  {item.description}
                  {item.isRecurring && (
                    <span className="ml-2 text-xs uppercase tracking-wider text-ink-muted">
                      (Monthly)
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-xs uppercase tracking-wider text-ink-muted">
                  {item.category}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-sm text-ink">
                  {Number(item.estimatedHours)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-sm text-ink">
                  ${Number(item.hourlyRate)}/hr
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-sm font-medium text-ink">
                  ${subtotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
                {!isLocked && (
                  <td className="py-3 pl-4 text-right">
                    {isConfirming ? (
                      <div className="inline-flex items-center gap-1 justify-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setConfirmingId(null);
                            onDelete(item.id);
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="quiet"
                          size="sm"
                          onClick={() => setConfirmingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="quiet"
                        size="sm"
                        onClick={() => setConfirmingId(item.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

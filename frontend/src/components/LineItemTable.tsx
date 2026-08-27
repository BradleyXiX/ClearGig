import { Trash2 } from 'lucide-react';
import { LineItem } from '../services/api';

interface LineItemTableProps {
  items: LineItem[];
  onDelete: (id: string) => void;
  isLocked?: boolean;
}

export default function LineItemTable({ items, onDelete, isLocked = false }: LineItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 bg-secondary/50 rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground">No line items added yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-foreground">
        <thead className="bg-secondary/80 text-secondary-foreground font-medium border-b border-border">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">Category</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3 text-right">Hours</th>
            <th className="px-4 py-3 text-right">Rate</th>
            <th className="px-4 py-3 text-right">Subtotal</th>
            <th className="px-4 py-3 rounded-tr-lg"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {item.category}
                </span>
                {item.isRecurring && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Monthly
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-medium">{item.description}</td>
              <td className="px-4 py-3 text-right">{Number(item.estimatedHours)}</td>
              <td className="px-4 py-3 text-right">${Number(item.hourlyRate)}/hr</td>
              <td className="px-4 py-3 text-right font-semibold">
                ${(Number(item.estimatedHours) * Number(item.hourlyRate)).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                {!isLocked && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

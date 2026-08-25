interface SummaryPanelProps {
  baseCost: number;
  recurringCost: number;
  contingencyPercentage: number;
  profitMargin: number;
}

export default function SummaryPanel({ baseCost, recurringCost, contingencyPercentage, profitMargin }: SummaryPanelProps) {
  const contingencyAmount = baseCost * (contingencyPercentage / 100);
  const costWithContingency = baseCost + contingencyAmount;
  const profitAmount = costWithContingency * (profitMargin / 100);
  const finalTotal = costWithContingency + profitAmount;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Estimate Summary</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Base Development Cost</span>
          <span className="font-medium text-foreground">{formatCurrency(baseCost)}</span>
        </div>
        
        {contingencyPercentage > 0 && (
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Contingency Buffer ({contingencyPercentage}%)</span>
            <span className="text-orange-500 font-medium">+{formatCurrency(contingencyAmount)}</span>
          </div>
        )}
        
        {profitMargin > 0 && (
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Profit Margin ({profitMargin}%)</span>
            <span className="text-blue-500 font-medium">+{formatCurrency(profitAmount)}</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Project Cost</div>
            <div className="text-3xl font-bold text-foreground mt-1">{formatCurrency(finalTotal)}</div>
          </div>
        </div>
        
        {recurringCost > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Estimated Monthly Cloud/Maint.</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {formatCurrency(recurringCost)} / mo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface AuditInput {
  monthlySpend: number;
  savingsRate: number;
}

export interface AuditResult {
  monthlySavings: number;
  optimizedSpend: number;
  annualizedSavings: number;
  contingencyFee: number;
  clientNetSavings: number;
}

export function computeAudit(input: AuditInput): AuditResult {
  const monthlySavings = input.monthlySpend * (input.savingsRate / 100);
  const optimizedSpend = input.monthlySpend - monthlySavings;
  const annualizedSavings = monthlySavings * 12;
  const contingencyFee = monthlySavings * 3 * 0.5;
  const clientNetSavings = annualizedSavings - contingencyFee;

  return {
    monthlySavings,
    optimizedSpend,
    annualizedSavings,
    contingencyFee,
    clientNetSavings,
  };
}

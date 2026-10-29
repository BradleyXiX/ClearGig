'use client';

import React, { useState } from 'react';
import {
  Printer,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  DollarSign,
  Cloud,
  FileText,
  Percent,
} from 'lucide-react';

interface SummaryPanelProps {
  baseCost: number;
  recurringCost: number;
  contingencyPercentage: number;
  profitMargin: number;
  projectTitle?: string;
  clientName?: string;
}

export default function SummaryPanel({
  baseCost,
  recurringCost,
  contingencyPercentage,
  profitMargin,
  projectTitle = 'Cloud Infrastructure & Optimization',
  clientName = 'Valued Client',
}: SummaryPanelProps) {
  // Toggle for Venture #9 Cloud FinOps Savings Audit Mode
  const [isFinOpsMode, setIsFinOpsMode] = useState(false);

  // FinOps state: initialize monthly cloud spend from recurringCost or default $12,500/mo
  const [monthlySpendInput, setMonthlySpendInput] = useState<number | ''>(
    recurringCost > 0 ? recurringCost : 12500
  );
  // Default target optimization rate is 30% (industry standard benchmark)
  const [savingsRate, setSavingsRate] = useState<number>(30);

  // Standard calculations
  const contingencyAmount = baseCost * (contingencyPercentage / 100);
  const costWithContingency = baseCost + contingencyAmount;
  const profitAmount = costWithContingency * (profitMargin / 100);
  const finalTotal = costWithContingency + profitAmount;

  // FinOps calculations (Venture #9)
  const currentMonthlySpend =
    typeof monthlySpendInput === 'number'
      ? monthlySpendInput
      : Number(monthlySpendInput) || 0;
  const monthlySavings = currentMonthlySpend * (savingsRate / 100);
  const optimizedSpend = Math.max(0, currentMonthlySpend - monthlySavings);
  // 12-Month Annualized Savings
  const annualizedSavings = monthlySavings * 12;
  // Our 50% First-3-Months Contingency Fee
  // (3 months of savings) * 50%
  const contingencyFee = monthlySavings * 3 * 0.5;
  // Client Net First-Year Savings
  const clientNetSavings = annualizedSavings - contingencyFee;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const formatExactCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      {/* Print Stylesheet for PDF Export */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 12mm;
          }
          body, html {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide application UI, navbar, interactive inputs, and action buttons */
          header, nav, aside, button, input, select, textarea, [role="slider"], .no-print {
            display: none !important;
          }
          .min-h-screen, .max-w-7xl, .grid {
            display: block !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .finops-screen-wrapper {
            display: none !important;
          }
          .proposal-print-document {
            display: block !important;
            background: #ffffff !important;
            color: #0f172a !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Screen Wrapper */}
      <div className="finops-screen-wrapper space-y-4">
        {/* Venture #9 Mode Switcher Toggle */}
        <div className="bg-secondary/70 border border-border rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isFinOpsMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Cloud FinOps Audit Mode
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wider">
                    Venture #9
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Performance-based cloud savings & contingency model
                </p>
              </div>
            </div>

            {/* Accessible Toggle Button */}
            <button
              type="button"
              role="switch"
              aria-checked={isFinOpsMode}
              onClick={() => setIsFinOpsMode(!isFinOpsMode)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isFinOpsMode ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              title="Toggle Cloud FinOps Savings Audit Mode"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  isFinOpsMode ? 'translate-x-5 bg-black' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Panel Content based on Active Mode */}
        {isFinOpsMode ? (
          /* Cloud FinOps Savings Audit Mode (Venture #9) */
          <div className="bg-primary/5 rounded-xl border border-primary/30 p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>FinOps Savings Audit</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                50% Contingency Model
              </span>
            </div>

            {/* Inputs & Tuning */}
            <div className="space-y-4">
              <div>
                <label className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1.5">
                  <span>Current Monthly Cloud Spend</span>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(currentMonthlySpend)} / mo
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={monthlySpendInput}
                    onChange={(e) =>
                      setMonthlySpendInput(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    placeholder="e.g. 12500"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    Target Optimization Rate
                  </span>
                  <span className="text-primary font-bold">{savingsRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Conservative (15%)</span>
                  <span>Benchmark (30%)</span>
                  <span>Aggressive (50%)</span>
                </div>
              </div>
            </div>

            {/* Monthly Spend Comparison Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-background/80 rounded-lg p-3 border border-border">
                <span className="text-[11px] text-muted-foreground block">
                  Current Monthly Spend
                </span>
                <span className="text-base font-bold text-foreground">
                  {formatCurrency(currentMonthlySpend)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Pre-Audit Baseline
                </span>
              </div>
              <div className="bg-background/80 rounded-lg p-3 border border-primary/40">
                <span className="text-[11px] text-primary block flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Optimized Spend
                </span>
                <span className="text-base font-bold text-foreground">
                  {formatCurrency(optimizedSpend)}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  Save {formatCurrency(monthlySavings)} / mo
                </span>
              </div>
            </div>

            {/* Executive FinOps Financial Metrics */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  12-Month Annualized Savings
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatCurrency(annualizedSavings)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-muted-foreground block">
                    Our 50% First-3-Months Contingency Fee
                  </span>
                  <span className="text-[10px] text-muted-foreground/80">
                    50% of verified savings (Months 1–3 only)
                  </span>
                </div>
                <span className="text-base font-semibold text-primary">
                  {formatCurrency(contingencyFee)}
                </span>
              </div>

              <div className="bg-secondary/60 rounded-lg p-3 border border-border/80 flex justify-between items-center mt-2">
                <div>
                  <span className="text-xs font-medium text-foreground block">
                    Client Net 1st-Year Benefit
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Keeps 100% of savings from Month 4 onwards
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(clientNetSavings)}
                </span>
              </div>
            </div>

            {/* Performance Guarantee */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-emerald-300">
                <span className="font-semibold block text-emerald-200">
                  Zero Upfront Cost Guarantee
                </span>
                If we don&apos;t reduce verified cloud spend, our contingency
                fee is $0.00.
              </div>
            </div>

            {/* 1-Click Print / Export Client Proposal PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-primary/20 active:scale-[0.99] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Client Proposal PDF</span>
            </button>
          </div>
        ) : (
          /* Standard Estimate Summary Mode */
          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Estimate Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Base Development Cost</span>
                <span className="font-medium text-foreground">
                  {formatExactCurrency(baseCost)}
                </span>
              </div>

              {contingencyPercentage > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Contingency Buffer ({contingencyPercentage}%)</span>
                  <span className="text-orange-500 font-medium">
                    +{formatExactCurrency(contingencyAmount)}
                  </span>
                </div>
              )}

              {profitMargin > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Profit Margin ({profitMargin}%)</span>
                  <span className="text-blue-500 font-medium">
                    +{formatExactCurrency(profitAmount)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Project Cost
                  </div>
                  <div className="text-3xl font-bold text-foreground mt-1">
                    {formatExactCurrency(finalTotal)}
                  </div>
                </div>
              </div>

              {recurringCost > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Estimated Monthly Cloud/Maint.
                    </span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {formatExactCurrency(recurringCost)} / mo
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-click print in standard mode as well */}
            <div className="mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border py-2.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export Client Proposal PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Print / Export Document (Visible only when printing) */}
      <div className="proposal-print-document hidden print:block text-slate-900 font-sans">
        {/* Proposal Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">
                ClearGig Advisory Services &bull; Venture #9
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                CLOUD FINOPS SAVINGS AUDIT & PROPOSAL
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Performance-Based Cloud Infrastructure Cost Optimization
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-semibold text-slate-900">
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p>Project: {projectTitle}</p>
              <p>Client: {clientName}</p>
              <p className="font-mono text-[10px] mt-1 text-slate-400">REF: CG-FINOPS-V9</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
            1. Executive Summary & Audit Scope
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            ClearGig was engaged to conduct a Cloud FinOps infrastructure savings audit. Our analysis assesses current
            workload allocation, compute rightsizing, idle/orphaned storage volumes, database instance reservation strategies,
            and network egress patterns across the client&apos;s cloud infrastructure.
          </p>
        </div>

        {/* Financial Comparison & Savings Breakdown */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
            2. Cloud Spend Optimization & Savings Forecast
          </h2>

          <table className="w-full text-xs text-left border-collapse mb-4">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 font-bold text-slate-800">
                <th className="py-2 px-3">Metric / Line Item</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3 text-right">Financial Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Current Monthly Cloud Spend</td>
                <td className="py-2 px-3 text-slate-600">Documented baseline cloud infrastructure run-rate</td>
                <td className="py-2 px-3 text-right font-medium text-slate-900">
                  {formatCurrency(currentMonthlySpend)} / mo
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">Target Optimized Monthly Spend</td>
                <td className="py-2 px-3 text-slate-600">Post-optimization run-rate ({savingsRate}% target reduction)</td>
                <td className="py-2 px-3 text-right font-medium text-slate-900">
                  {formatCurrency(optimizedSpend)} / mo
                </td>
              </tr>
              <tr className="bg-emerald-50/50">
                <td className="py-2 px-3 font-bold text-emerald-900">Projected Monthly Net Savings</td>
                <td className="py-2 px-3 text-emerald-800">Direct recurring monthly operational reduction</td>
                <td className="py-2 px-3 text-right font-bold text-emerald-800">
                  {formatCurrency(monthlySavings)} / mo
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="py-2.5 px-3 text-slate-900">12-Month Annualized Savings</td>
                <td className="py-2.5 px-3 text-slate-700">Total cumulative client savings across Year 1</td>
                <td className="py-2.5 px-3 text-right text-base text-slate-900">
                  {formatCurrency(annualizedSavings)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commercial Model: Contingency Fee */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
            3. Performance-Based Contingency Fee Structure
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 border border-slate-200 rounded bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Contingency Terms
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                50% of Realized Savings (Months 1–3)
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Zero upfront retainer. ClearGig collects 50% of the verified savings achieved during the first 90 days.
              </p>
            </div>
            <div className="p-3 border border-slate-200 rounded bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Total Contingency Fee
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {formatCurrency(contingencyFee)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                One-time advisory fee based on realized 90-day performance.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-950">
            <p className="font-bold">Client Net Year-1 Savings: {formatCurrency(clientNetSavings)}</p>
            <p className="mt-0.5 text-emerald-800">
              The client retains 100% of all ongoing savings starting from Month 4 into perpetuity, securing an immediate
              positive ROI in year one.
            </p>
          </div>
        </div>

        {/* Guarantees & Terms */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
            4. 100% Risk-Free Performance Guarantee
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            This agreement is purely contingency-based. If ClearGig does not deliver verified cloud billing cost
            reductions, no contingency fee is payable, and the client owes $0.00. Implementation work is non-disruptive
            and executed in coordination with client engineering leadership.
          </p>
        </div>

        {/* Signature & Acceptance Block */}
        <div className="pt-4 border-t-2 border-slate-900">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-6">
            5. Authorization & Acceptance
          </h2>
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-semibold text-slate-900 mb-8">For Client: {clientName}</p>
              <div className="border-b border-slate-400 mb-2"></div>
              <p className="text-slate-600">Authorized Signature</p>
              <div className="border-b border-slate-400 mt-6 mb-2"></div>
              <p className="text-slate-600">Printed Name & Title / Date</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-8">For ClearGig Advisory Services (Venture #9)</p>
              <div className="border-b border-slate-400 mb-2"></div>
              <p className="text-slate-600">Authorized Engagement Partner</p>
              <div className="border-b border-slate-400 mt-6 mb-2"></div>
              <p className="text-slate-600">Date of Execution</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

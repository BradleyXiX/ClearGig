import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What can I estimate?",
    answer:
      "Software project work by category, hourly scope and rates, one-time costs and recurring monthly items.",
  },
  {
    question: "How do documents work?",
    answer:
      "Open the saved project's estimate or audit document, then use browser print or save-to-PDF. No claim of generated legal contracts or e-signing.",
  },
  {
    question: "Are audit savings guaranteed?",
    answer:
      "No. The FinOps view models a scenario from the supplied spend and savings-rate assumptions; it does not verify cloud-account savings.",
  },
];

export function Questions() {
  return (
    <div className="pt-12 sm:pt-16" aria-labelledby="questions-heading">
      <div className="space-y-3 mb-6 sm:mb-8">
        <span className="text-xs font-mono font-medium uppercase tracking-wider text-forest block">
          USEFUL QUESTIONS
        </span>
        <h3
          id="questions-heading"
          className="text-xl sm:text-2xl font-sans tracking-tight text-ink font-semibold"
        >
          Questions before you begin.
        </h3>
        <p className="text-sm text-ink-muted max-w-xl font-sans">
          A clear accounting of what ClearGig calculates, what documents provide, and the limits of modeled scenarios.
        </p>
      </div>

      {/* Native HTML disclosure list - fully functional without client JavaScript */}
      <div className="divide-y divide-rule border-y border-rule" role="region" aria-label="Frequently Asked Questions">
        {FAQS.map((faq, index) => (
          <details key={index} className="group py-4 sm:py-5 cursor-pointer">
            <summary className="flex items-center justify-between gap-4 text-base sm:text-lg font-sans font-medium text-ink list-none outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded-control select-none">
              <span>{faq.question}</span>
              <span
                className="font-mono text-sm text-ink-muted transition-transform duration-150 group-open:rotate-45 shrink-0 px-1 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:group-open:transform-none"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <div className="pt-3 pr-8 text-sm sm:text-base text-ink-muted font-sans leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

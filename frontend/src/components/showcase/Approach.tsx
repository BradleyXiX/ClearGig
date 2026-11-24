"use client";

import React, { useState } from "react";
import {
  EstimateExample,
  type ScenarioId,
  type ApproachStepId,
} from "./EstimateExample";

export function Approach() {
  const [scenario, setScenario] = useState<ScenarioId>("website");
  const [activeStep, setActiveStep] = useState<ApproachStepId>("01");
  const [announcement, setAnnouncement] = useState<string>(
    "Website refresh scenario selected. Step 1: Define the work."
  );

  const handleScenarioChange = (newScenario: ScenarioId) => {
    setScenario(newScenario);
    setAnnouncement(
      `${newScenario === "website" ? "Website refresh" : "Product build"} scenario selected.`
    );
  };

  const handleStepChange = (newStep: ApproachStepId, stepTitle: string) => {
    setActiveStep(newStep);
    setAnnouncement(`Step ${newStep}: ${stepTitle} focused.`);
  };

  return (
    <section
      id="approach"
      className="w-full bg-dark-canvas text-on-dark py-16 sm:py-24 border-t border-rule-strong"
      aria-labelledby="approach-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Screen Reader Live Region for Scenario/Step Announcements */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Narrative Column (~38%) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-on-dark-muted block">
                THE APPROACH
              </span>
              <h2
                id="approach-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-sans tracking-tight text-on-dark leading-tight"
              >
                From scope{" "}
                <span className="font-serif-display font-normal block sm:inline">
                  to a clear next step.
                </span>
              </h2>
            </div>

            <p className="text-base sm:text-lg text-on-dark-muted leading-relaxed">
              Define the work. Understand the numbers. Prepare the document.
            </p>

            {/* Scenario Switcher Controls */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-on-dark-muted block">
                Select sample scenario:
              </span>
              <div className="flex flex-wrap gap-2.5" role="group" aria-label="Sample Scenarios">
                <button
                  type="button"
                  onClick={() => handleScenarioChange("website")}
                  aria-pressed={scenario === "website"}
                  className={`px-3.5 py-2 rounded-control text-xs font-mono uppercase tracking-wider transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-dark cursor-pointer ${
                    scenario === "website"
                      ? "bg-forest text-on-dark font-semibold border border-forest"
                      : "bg-dark-canvas text-on-dark-muted border border-rule-strong hover:text-on-dark"
                  }`}
                >
                  Website refresh
                </button>
                <button
                  type="button"
                  onClick={() => handleScenarioChange("product")}
                  aria-pressed={scenario === "product"}
                  className={`px-3.5 py-2 rounded-control text-xs font-mono uppercase tracking-wider transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-dark cursor-pointer ${
                    scenario === "product"
                      ? "bg-forest text-on-dark font-semibold border border-forest"
                      : "bg-dark-canvas text-on-dark-muted border border-rule-strong hover:text-on-dark"
                  }`}
                >
                  Product build
                </button>
              </div>
            </div>

            {/* Three Step Buttons */}
            <div className="space-y-3 pt-2" role="group" aria-label="Workflow Steps">
              <button
                type="button"
                onClick={() => handleStepChange("01", "Define the work")}
                aria-pressed={activeStep === "01"}
                className={`w-full text-left p-4 rounded-control border transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-dark cursor-pointer ${
                  activeStep === "01"
                    ? "bg-dark-canvas border-forest shadow-xs"
                    : "bg-dark-canvas/60 border-rule-strong/50 hover:border-rule-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-dark">
                    01 Define the work
                  </span>
                  {activeStep === "01" && (
                    <span className="text-xs font-mono text-focus-dark font-medium">Selected</span>
                  )}
                </div>
                <p className="text-xs text-on-dark-muted mt-1 leading-normal">
                  Identify specific categories, deliverables and workstreams without guesswork.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleStepChange("02", "Review the numbers")}
                aria-pressed={activeStep === "02"}
                className={`w-full text-left p-4 rounded-control border transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-dark cursor-pointer ${
                  activeStep === "02"
                    ? "bg-dark-canvas border-forest shadow-xs"
                    : "bg-dark-canvas/60 border-rule-strong/50 hover:border-rule-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-dark">
                    02 Review the numbers
                  </span>
                  {activeStep === "02" && (
                    <span className="text-xs font-mono text-focus-dark font-medium">Selected</span>
                  )}
                </div>
                <p className="text-xs text-on-dark-muted mt-1 leading-normal">
                  Account for one-time milestones, ongoing maintenance and contingency adjustments.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleStepChange("03", "Prepare the document")}
                aria-pressed={activeStep === "03"}
                className={`w-full text-left p-4 rounded-control border transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-dark cursor-pointer ${
                  activeStep === "03"
                    ? "bg-dark-canvas border-forest shadow-xs"
                    : "bg-dark-canvas/60 border-rule-strong/50 hover:border-rule-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-dark">
                    03 Prepare the document
                  </span>
                  {activeStep === "03" && (
                    <span className="text-xs font-mono text-focus-dark font-medium">Selected</span>
                  )}
                </div>
                <p className="text-xs text-on-dark-muted mt-1 leading-normal">
                  Produce clean, structured documentation ready for client review and approval.
                </p>
              </button>
            </div>
          </div>

          {/* Right Local Estimate Panel (~62%) */}
          <div className="lg:col-span-7 w-full flex justify-center">
            <EstimateExample scenario={scenario} activeStep={activeStep} />
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { Questions } from "./Questions";

export function Closing() {
  return (
    <section
      id="closing"
      className="w-full bg-paper text-ink pt-16 pb-16 sm:pt-24 sm:pb-24 border-t border-rule"
      aria-labelledby="closing-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Ruled Two-Column Conversion Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12 sm:pb-16 border-b border-rule items-start">
          {/* Left Column: Heading */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-forest block">
              GETTING STARTED
            </span>
            <h2
              id="closing-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-sans tracking-tight text-ink leading-tight"
            >
              Make the next proposal{" "}
              <span className="font-serif-display font-normal block sm:inline">
                a considered one.
              </span>
            </h2>
          </div>

          {/* Right Column: Narrative & Single Primary CTA Hierarchy */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-base sm:text-lg text-ink-muted font-sans leading-relaxed">
              Bring your scope, rates and recurring costs into one considered estimate. Export a clean, printable document ready for your next client conversation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2 font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-5 py-2.5 text-sm uppercase tracking-wider font-medium h-11 bg-ink text-paper hover:bg-forest"
              >
                <span>Build an estimate</span>
                <span aria-hidden="true" className="text-base transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none">→</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink h-11"
              >
                Open workspace
              </Link>
            </div>

            <div className="text-xs font-mono text-ink-muted/80">
              No sign-up or credit card required to begin estimating.
            </div>
          </div>
        </div>

        {/* Three Native FAQ Questions */}
        <Questions />
      </div>
    </section>
  );
}

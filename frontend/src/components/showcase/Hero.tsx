import React from "react";
import Link from "next/link";
import { EstimateArtwork } from "./EstimateArtwork";

export function Hero() {
  return (
    <section id="overview" className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden" aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Narrative Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-forest block">
                PROJECT ESTIMATES, CONSIDERED.
              </span>
              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-sans tracking-tight text-ink leading-tight">
                Good work.{" "}
                <span className="font-serif-display font-normal block sm:inline">
                  Clearly scoped.
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg text-ink-muted max-w-xl leading-relaxed">
              Bring your scope, rates and recurring costs into one considered estimate. Ready for the next client conversation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-5 py-2.5 text-sm uppercase tracking-wider font-medium h-11 bg-ink text-paper hover:bg-forest"
              >
                <span>Build an estimate</span>
                <span aria-hidden="true" className="text-base">→</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center font-sans rounded-control select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink h-11"
              >
                Explore workspace
              </Link>
            </div>

            <div className="pt-2 text-xs font-mono text-ink-muted/80">
              Built for independent developers and small studios.
            </div>
          </div>

          {/* Reserved Artwork Column */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-lg">
              <EstimateArtwork />
            </div>
          </div>
        </div>

        {/* Product framing strip */}
        <div className="mt-16 sm:mt-24 pt-8 pb-8 border-y border-rule">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block">Structure</span>
              <span className="text-sm font-medium text-ink">One-time + recurring</span>
            </div>
            <div className="space-y-1 sm:border-l sm:border-rule sm:pl-6">
              <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block">Adjustments</span>
              <span className="text-sm font-medium text-ink">Clear cost adjustments</span>
            </div>
            <div className="space-y-1 sm:border-l sm:border-rule sm:pl-6">
              <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block">Output</span>
              <span className="text-sm font-medium text-ink">Estimate + audit documents</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

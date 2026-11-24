"use client";

import React, { useEffect, useRef } from "react";
import {
  useReducedMotion,
  useDocumentVisibility,
  createHeroMotionController,
  type HeroMotionController,
} from "./motion";

export function EstimateArtwork({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<HeroMotionController | null>(null);
  const reducedMotion = useReducedMotion();

  // Document visibility gate (pauses when hidden/backgrounded)
  useDocumentVisibility((visible) => {
    controllerRef.current?.setDocumentVisible(visible);
  });

  // Initialize lifecycle controller and element intersection gate
  useEffect(() => {
    const controller = createHeroMotionController({
      getContainer: () => containerRef.current,
      getSheet: () => sheetRef.current,
      reducedMotion,
    });
    controllerRef.current = controller;

    let observer: IntersectionObserver | null = null;

    if (containerRef.current && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            controller.setElementIntersecting(entry.isIntersecting);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    } else {
      // Fallback: if IntersectionObserver is unavailable, mark intersecting
      controller.setElementIntersecting(true);
    }

    controller.setReducedMotion(reducedMotion);
    controller.start();

    return () => {
      observer?.disconnect();
      controller.destroy();
      controllerRef.current = null;
    };
  }, [reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    controllerRef.current?.handleMouseMove(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    controllerRef.current?.handleMouseLeave();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden rounded-panel border border-rule-strong bg-dark-canvas text-on-dark shadow-md transform-gpu motion-reduce:transition-none motion-reduce:transform-none ${className}`.trim()}
      style={{
        aspectRatio: "5 / 6",
        transformStyle: "preserve-3d",
      }}
      aria-label="ClearGig illustrative project composition"
    >
      {/* Responsive photograph background with reserved layout box */}
      <picture className="absolute inset-0 block w-full h-full select-none pointer-events-none">
        <source
          media="(max-width: 640px)"
          type="image/avif"
          srcSet="/cleargig/boardroom-mobile-640.avif 1x, /cleargig/boardroom-mobile-480.avif 0.75x"
        />
        <source
          media="(max-width: 640px)"
          type="image/webp"
          srcSet="/cleargig/boardroom-mobile-640.webp 1x, /cleargig/boardroom-mobile-480.webp 0.75x"
        />
        <source
          media="(min-width: 641px)"
          type="image/avif"
          srcSet="/cleargig/boardroom-desktop-1200.avif 1200w, /cleargig/boardroom-desktop-800.avif 800w"
          sizes="(max-width: 1024px) 800px, 1200px"
        />
        <source
          media="(min-width: 641px)"
          type="image/webp"
          srcSet="/cleargig/boardroom-desktop-1200.webp 1200w, /cleargig/boardroom-desktop-800.webp 800w"
          sizes="(max-width: 1024px) 800px, 1200px"
        />
        <img
          src="/cleargig/boardroom-desktop-1200.webp"
          alt="Architectural boardroom window casting morning light over a wood planning table"
          className="w-full h-full object-cover object-top"
          width={1200}
          height={800}
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* Top/Right photo caption inset */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <span className="inline-block bg-dark-canvas/80 backdrop-blur-xs text-on-dark-muted px-2.5 py-1 rounded-control text-xs font-mono tracking-wide border border-rule-strong/40">
          A clearer start to the work ahead.
        </span>
      </div>

      {/* Floating HTML estimate sheet at lower-left (Hero Paper Assembly owner) */}
      <div
        ref={sheetRef}
        className="absolute bottom-3 left-3 right-3 sm:right-auto sm:bottom-5 sm:left-5 z-10 sm:max-w-xs w-auto transform-gpu motion-reduce:transition-none motion-reduce:transform-none"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="bg-paper text-ink p-4 sm:p-5 rounded-panel border border-rule shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <span className="text-xs font-mono font-medium tracking-wider text-ink-muted uppercase">
              ILLUSTRATIVE ESTIMATE
            </span>
            <span className="text-xs font-mono font-medium text-forest bg-accent-wash px-1.5 py-0.5 rounded-control">
              Ready to review
            </span>
          </div>

          <div className="pt-3 pb-3 space-y-2">
            <div>
              <div className="text-sm font-semibold text-ink">Northline Studio</div>
              <div className="text-xs text-ink-muted">Website refresh</div>
            </div>

            <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs pt-1 border-t border-rule/60">
              <div>
                <dt className="text-xs font-mono uppercase text-ink-muted">Project scope</dt>
                <dd className="font-medium text-ink">Defined</dd>
              </div>
              <div>
                <dt className="text-xs font-mono uppercase text-ink-muted">Workstreams</dt>
                <dd className="font-medium text-ink">Frontend + backend</dd>
              </div>
              <div>
                <dt className="text-xs font-mono uppercase text-ink-muted">Cost structure</dt>
                <dd className="font-medium text-ink">One-time + recurring</dd>
              </div>
              <div>
                <dt className="text-xs font-mono uppercase text-ink-muted">Status</dt>
                <dd className="font-medium text-forest">Ready to review</dd>
              </div>
            </dl>
          </div>

          <div className="pt-2 border-t border-rule text-center">
            <span className="text-xs font-mono text-ink-muted uppercase tracking-wider block">
              WORKFLOW PREVIEW · NO PRICING SHOWN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

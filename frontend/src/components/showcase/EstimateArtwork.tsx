"use client";

import React, { useEffect, useRef } from "react";
import {
  MOTION,
  useReducedMotion,
  usePageVisibility,
  isFinePointer,
  computeTilt,
} from "./motion";

export function EstimateArtwork({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const reducedMotion = useReducedMotion();

  // Pause/resume animation on document visibility change
  usePageVisibility((visible) => {
    if (!animationRef.current) return;
    if (visible && animationRef.current.playState === "paused") {
      animationRef.current.play();
    } else if (!visible && animationRef.current.playState === "running") {
      animationRef.current.pause();
    }
  });

  // Hero paper assembly: Finite 650–800ms WAAPI animation
  useEffect(() => {
    const sheetEl = sheetRef.current;
    if (!sheetEl || reducedMotion) {
      if (sheetEl) {
        sheetEl.style.transform = "none";
        sheetEl.style.opacity = "1";
      }
      return;
    }

    try {
      const anim = sheetEl.animate(
        [
          {
            transform: `translateY(${MOTION.HERO_ASSEMBLY_TRAVEL}px) rotate(-${MOTION.HERO_ASSEMBLY_ROTATION}deg)`,
            opacity: 0.8,
          },
          {
            transform: "translateY(0px) rotate(0deg)",
            opacity: 1,
          },
        ],
        {
          duration: MOTION.HERO_ASSEMBLY_DURATION,
          easing: MOTION.EASE_CONSIDERED,
          fill: "forwards",
        }
      );

      animationRef.current = anim;

      return () => {
        anim.cancel();
        animationRef.current = null;
      };
    } catch {
      // Fallback for environments without WAAPI
      sheetEl.style.transform = "none";
      sheetEl.style.opacity = "1";
    }
  }, [reducedMotion]);

  // Art tilt: Fine pointer only, max 2deg, no React state re-renders per frame
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !isFinePointer() || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const { rotateX, rotateY } = computeTilt(e.clientX, e.clientY, rect, MOTION.TILT_MAX_DEG);

    containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden rounded-panel border border-rule-strong bg-dark-canvas text-on-dark shadow-md transform-gpu transition-transform duration-200 ${className}`.trim()}
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
        className="absolute bottom-3 left-3 right-3 sm:right-auto sm:bottom-5 sm:left-5 z-10 sm:max-w-xs w-auto transform-gpu"
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

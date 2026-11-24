"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Motion constants governing the Considered Work showcase animation matrix.
 * Strictly bounded by design.md Section 7.
 */
export const MOTION = {
  /** Finite 650–800ms hero paper assembly duration */
  HERO_ASSEMBLY_DURATION: 750,
  /** ~16px travel for paper settling */
  HERO_ASSEMBLY_TRAVEL: 16,
  /** <=2deg rotation during paper assembly */
  HERO_ASSEMBLY_ROTATION: 1.5,
  /** Max 2deg tilt for fine-pointer art depth */
  TILT_MAX_DEG: 2,
  /** Settle duration on pointer exit (~180–250ms) */
  TILT_SETTLE_MS: 200,
  /** Decorative preview reveal (<=16px / 350–450ms) */
  SECTION_REVEAL_DURATION: 400,
  SECTION_REVEAL_TRAVEL: 16,
  /** Button arrow travel <=3px, 120–160ms */
  BUTTON_ARROW_TRAVEL: 2,
  BUTTON_ARROW_DURATION: 150,
  /** Considered Work standard easing curve from tokens */
  EASE_CONSIDERED: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/**
 * Check if the user prefers reduced motion (SSR-safe).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if the active primary input is a fine pointer (mouse/stylus).
 */
export function isFinePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: fine)").matches;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * React hook tracking prefers-reduced-motion state via useSyncExternalStore.
 * Safe for React 19 hydration and SSR.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/**
 * React hook tracking document visibility to pause animations when hidden/offscreen.
 */
export function usePageVisibility(onChange?: (visible: boolean) => void): boolean {
  const cbRef = useRef(onChange);

  useEffect(() => {
    cbRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibility = () => {
      const visible = document.visibilityState === "visible";
      cbRef.current?.(visible);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return typeof document !== "undefined" ? document.visibilityState === "visible" : true;
}

/**
 * Pure function computing bounded tilt rotation (<=2deg) from client coordinates.
 */
export function computeTilt(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxDeg: number = MOTION.TILT_MAX_DEG
): { rotateX: number; rotateY: number } {
  if (rect.width <= 0 || rect.height <= 0) return { rotateX: 0, rotateY: 0 };

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const percentX = (clientX - centerX) / (rect.width / 2);
  const percentY = (clientY - centerY) / (rect.height / 2);

  const rawRotateX = Math.max(-maxDeg, Math.min(maxDeg, -percentY * maxDeg));
  const rawRotateY = Math.max(-maxDeg, Math.min(maxDeg, percentX * maxDeg));

  const rotateX = Object.is(rawRotateX, -0) ? 0 : rawRotateX;
  const rotateY = Object.is(rawRotateY, -0) ? 0 : rawRotateY;

  return { rotateX, rotateY };
}

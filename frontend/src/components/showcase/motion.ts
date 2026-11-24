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

/**
 * React hook tracking whether the primary pointer is fine.
 * Subscribes to changes (e.g. tablet dock/undock, external mouse disconnect).
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribeFinePointer,
    isFinePointer,
    () => false
  );
}

function subscribeFinePointer(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * Check if the document is currently visible (SSR-safe).
 */
export function isDocumentVisible(): boolean {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return prefersReducedMotion();
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * React hook tracking prefers-reduced-motion state via useSyncExternalStore.
 * Responds to runtime changes without cascading render warnings.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/**
 * React hook tracking document visibility specifically (visibilitychange event).
 */
export function useDocumentVisibility(onChange?: (visible: boolean) => void): boolean {
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

export interface HeroMotionConfig {
  getContainer: () => HTMLElement | null;
  getSheet: () => HTMLElement | null;
  onFinished?: () => void;
  reducedMotion?: boolean;
  documentVisible?: boolean;
  elementIntersecting?: boolean;
}

export interface HeroMotionController {
  start(): void;
  setDocumentVisible(visible: boolean): void;
  setElementIntersecting(intersecting: boolean): void;
  setReducedMotion(reduced: boolean): void;
  setFinePointer(fine: boolean): void;
  handleMouseMove(clientX: number, clientY: number): void;
  handleMouseLeave(): void;
  destroy(): void;
  getStatus(): {
    isDocumentVisible: boolean;
    isElementIntersecting: boolean;
    isReducedMotion: boolean;
    isFinePointer: boolean;
    hasStarted: boolean;
    hasFinished: boolean;
    isPlaying: boolean;
    isDestroyed: boolean;
  };
}

/**
 * Controller governing hero paper assembly and fine-pointer tilt.
 * Gates WAAPI execution by both document visibility and element intersection.
 * Settle immediately under reduced motion and prevents replaying finite sequences.
 */
export function createHeroMotionController(config: HeroMotionConfig): HeroMotionController {
  let isDocumentVisibleState =
    config.documentVisible !== undefined ? config.documentVisible : isDocumentVisible();
  let isElementIntersectingState =
    config.elementIntersecting !== undefined ? config.elementIntersecting : false;
  let isReducedMotionState =
    config.reducedMotion !== undefined ? config.reducedMotion : prefersReducedMotion();
  let isFinePointerState = isFinePointer();

  let hasStartedState = false;
  let hasFinishedState = false;
  let isDestroyedState = false;
  let activeAnimation: Animation | null = null;

  const settleSheetImmediately = () => {
    const sheet = config.getSheet();
    if (sheet) {
      sheet.style.transform = "none";
      sheet.style.opacity = "1";
    }
  };

  const clearTiltImmediately = () => {
    const container = config.getContainer();
    if (container) {
      container.style.transition = "none";
      container.style.transform = "none";
    }
  };

  const checkAndTrigger = () => {
    if (isDestroyedState) return;

    if (isReducedMotionState) {
      settleSheetImmediately();
      clearTiltImmediately();
      return;
    }

    if (hasFinishedState) return;

    const canPlay = isDocumentVisibleState && isElementIntersectingState;

    if (activeAnimation) {
      if (canPlay && activeAnimation.playState === "paused") {
        activeAnimation.play();
      } else if (!canPlay && activeAnimation.playState === "running") {
        activeAnimation.pause();
      }
      return;
    }

    if (canPlay && !hasStartedState) {
      startAnimation();
    }
  };

  const startAnimation = () => {
    if (isDestroyedState || hasStartedState || hasFinishedState || isReducedMotionState) {
      settleSheetImmediately();
      return;
    }

    const sheet = config.getSheet();
    if (!sheet) return;

    hasStartedState = true;

    try {
      if (typeof sheet.animate !== "function") {
        settleSheetImmediately();
        hasFinishedState = true;
        config.onFinished?.();
        return;
      }

      const anim = sheet.animate(
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

      activeAnimation = anim;

      anim.onfinish = () => {
        hasFinishedState = true;
        // Commit settled inline styles, detach callback, and cancel/release WAAPI fill animation
        anim.onfinish = null;
        anim.cancel();
        activeAnimation = null;
        settleSheetImmediately();
        config.onFinished?.();
      };
    } catch {
      settleSheetImmediately();
      hasFinishedState = true;
      activeAnimation = null;
      config.onFinished?.();
    }
  };

  // If already reduced motion upon initialization, ensure settled layout
  if (isReducedMotionState) {
    settleSheetImmediately();
    clearTiltImmediately();
  }

  return {
    start() {
      if (isDestroyedState) return;
      checkAndTrigger();
    },

    setDocumentVisible(visible: boolean) {
      if (isDestroyedState) return;
      isDocumentVisibleState = visible;
      checkAndTrigger();
    },

    setElementIntersecting(intersecting: boolean) {
      if (isDestroyedState) return;
      isElementIntersectingState = intersecting;
      checkAndTrigger();
    },

    setReducedMotion(reduced: boolean) {
      if (isDestroyedState) return;
      isReducedMotionState = reduced;

      if (reduced) {
        // Reduced motion requested: cancel any running animation and mark finished so it never starts later
        hasFinishedState = true;
        if (activeAnimation) {
          activeAnimation.onfinish = null;
          activeAnimation.cancel();
          activeAnimation = null;
        }
        settleSheetImmediately();
        clearTiltImmediately();
      }
      // If toggled back from reduced to normal, hasFinishedState prevents replaying or starting deferred assembly
    },

    setFinePointer(fine: boolean) {
      if (isDestroyedState) return;
      isFinePointerState = fine;
      if (!fine) {
        clearTiltImmediately();
      }
    },

    handleMouseMove(clientX: number, clientY: number) {
      if (isDestroyedState || isReducedMotionState || !isFinePointerState) return;

      const container = config.getContainer();
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const { rotateX, rotateY } = computeTilt(clientX, clientY, rect, MOTION.TILT_MAX_DEG);

      container.style.transition = "";
      container.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(
        2
      )}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    },

    handleMouseLeave() {
      if (isDestroyedState) return;

      const container = config.getContainer();
      if (!container) return;

      if (isReducedMotionState || !isFinePointerState) {
        container.style.transition = "none";
        container.style.transform = "none";
      } else {
        container.style.transition = `transform ${MOTION.TILT_SETTLE_MS}ms ${MOTION.EASE_CONSIDERED}`;
        container.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
      }
    },

    destroy() {
      isDestroyedState = true;
      if (activeAnimation) {
        activeAnimation.onfinish = null;
        activeAnimation.cancel();
        activeAnimation = null;
      }
      settleSheetImmediately();
      clearTiltImmediately();
    },

    getStatus() {
      return {
        isDocumentVisible: isDocumentVisibleState,
        isElementIntersecting: isElementIntersectingState,
        isReducedMotion: isReducedMotionState,
        isFinePointer: isFinePointerState,
        hasStarted: hasStartedState,
        hasFinished: hasFinishedState,
        isPlaying: activeAnimation?.playState === "running",
        isDestroyed: isDestroyedState,
      };
    },
  };
}

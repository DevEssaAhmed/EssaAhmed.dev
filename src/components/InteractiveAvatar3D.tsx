"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { cn } from "@/lib/utils";

export interface InteractiveAvatar3DProps {
  name?: string;
  variant?: "showcase" | "card" | "badge";
  className?: string;
}

function ShowcaseAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const haloLayerRef = useRef<HTMLDivElement>(null);
  const figureLayerRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    hovering: false,
    targetRx: 0,
    targetRy: 0,
    currentRx: 0,
    currentRy: 0,
    targetFloatY: 0,
    currentFloatY: 0,
    impulse: 0,
    reducedMotion: false,
  });

  const triggerBounce = useCallback(() => {
    if (!stateRef.current.reducedMotion) {
      stateRef.current.impulse = 14;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reducedMotion = mq.matches;

    const handleChange = () => {
      stateRef.current.reducedMotion = mq.matches;
      if (mq.matches) {
        if (haloLayerRef.current) {
          haloLayerRef.current.style.transform = "translate3d(0px, 0px, 0)";
        }
        if (figureLayerRef.current) {
          figureLayerRef.current.style.transform = "translateZ(0px)";
        }
      }
    };

    mq.addEventListener("change", handleChange);

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const s = stateRef.current;
      if (!document.hidden && !s.reducedMotion) {
        const t = (now - startTime) * 0.001;
        if (!s.hovering) {
          s.targetRy = Math.sin(t * 0.85) * 3.5;
          s.targetRx = Math.cos(t * 0.65) * 2.2;
          s.targetFloatY = Math.sin(t * 1.4) * 3;
        } else {
          s.targetFloatY = -2;
        }

        s.impulse *= 0.86;
        if (Math.abs(s.impulse) < 0.05) s.impulse = 0;

        const targetRyWithImpulse = s.targetRy + s.impulse;
        s.currentRx += (s.targetRx - s.currentRx) * 0.12;
        s.currentRy += (targetRyWithImpulse - s.currentRy) * 0.12;
        s.currentFloatY += (s.targetFloatY - s.currentFloatY) * 0.1;

        if (haloLayerRef.current) {
          haloLayerRef.current.style.transform = `translate3d(${(
            -s.currentRy * 0.8
          ).toFixed(2)}px, ${(s.currentRx * 0.6).toFixed(2)}px, 0)`;
        }
        if (figureLayerRef.current) {
          figureLayerRef.current.style.transform = `translate3d(0, ${(
            s.currentFloatY -
            Math.abs(s.impulse) * 0.25
          ).toFixed(2)}px, 0) rotateX(${s.currentRx.toFixed(
            2
          )}deg) rotateY(${s.currentRy.toFixed(2)}deg)`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      mq.removeEventListener("change", handleChange);
    };
  }, []);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (stateRef.current.reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    stateRef.current.hovering = true;
    stateRef.current.targetRy = nx * 10;
    stateRef.current.targetRx = -ny * 7;
  };

  const handlePointerLeave = () => {
    stateRef.current.hovering = false;
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerBounce();
    }
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={name}
      onClick={triggerBounce}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: "950px" }}
      className={cn(
        "relative w-full max-w-[300px] sm:max-w-[330px] mx-auto aspect-square select-none cursor-pointer flex items-end justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full",
        className
      )}
    >
      {/* Unboxed Soft Ambient Halo */}
      <div
        ref={haloLayerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 rounded-full bg-gradient-to-tr from-primary/15 via-secondary/10 to-transparent dark:from-primary/20 dark:via-secondary/15 blur-3xl will-change-transform"
      />

      {/* Floating Transparent Character Figure */}
      <div
        ref={figureLayerRef}
        className="relative w-full h-full flex items-end justify-center will-change-transform"
      >
        <OptimizedImage
          src="/avatar-3d-persona.png"
          alt={name}
          width={768}
          height={768}
          priority
          sizes="(max-width: 1024px) 100vw, 340px"
          className="w-full h-full object-contain object-bottom drop-shadow-[0_18px_24px_rgba(15,23,42,0.16)] dark:drop-shadow-[0_22px_32px_rgba(0,0,0,0.48)] pointer-events-none"
        />
      </div>
    </div>
  );
}

function CardAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (
      !cardRef.current ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    cardRef.current.style.transform = `perspective(420px) rotateX(${(
      -ny * 10
    ).toFixed(1)}deg) rotateY(${(nx * 10).toFixed(1)}deg) scale(1.03)`;
  };

  const handlePointerLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(420px) rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-surface-container-low via-primary/10 to-secondary/10 border border-outline-variant/35 shrink-0 shadow-sm transition-transform duration-200 ease-out",
        className
      )}
    >
      <OptimizedImage
        src="/avatar-3d-persona.png"
        alt={name}
        width={128}
        height={128}
        sizes="64px"
        className="w-full h-full object-cover object-[50%_20%] pointer-events-none"
      />
    </div>
  );
}

function BadgeAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-surface-container to-primary/15 border border-outline-variant/40 shrink-0",
        className
      )}
    >
      <OptimizedImage
        src="/avatar-3d-persona.png"
        alt={name}
        width={56}
        height={56}
        sizes="28px"
        className="w-full h-full object-cover object-[50%_20%] transition-transform duration-200 hover:scale-105"
      />
    </div>
  );
}

export function InteractiveAvatar3D({
  name = "Essa Ahmed",
  variant = "showcase",
  className,
}: InteractiveAvatar3DProps) {
  if (variant === "card") {
    return <CardAvatar name={name} className={className} />;
  }
  if (variant === "badge") {
    return <BadgeAvatar name={name} className={className} />;
  }
  return <ShowcaseAvatar name={name} className={className} />;
}

export default InteractiveAvatar3D;

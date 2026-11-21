"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { cn } from "@/lib/utils";

export interface InteractiveAvatar3DProps {
  name?: string;
  variant?: "showcase" | "card" | "badge";
  className?: string;
}

const PERSONA_MODES = [
  {
    id: "automation",
    label: "Workflow Automation",
    detail: "Python · Airflow · Webhooks",
    dotClass: "bg-primary",
    ringClass: "border-primary/35",
  },
  {
    id: "sop",
    label: "Supply Chain S&OP",
    detail: "Stochastic Safety Stock & ROP",
    dotClass: "bg-secondary",
    ringClass: "border-secondary/35",
  },
  {
    id: "analytics",
    label: "Decision Analytics",
    detail: "Star Schemas · Power BI DAX",
    dotClass: "bg-tertiary",
    ringClass: "border-tertiary/35",
  },
] as const;

function formatSignedDeg(deg: number): string {
  const rounded = Math.round(deg);
  const abs = Math.abs(rounded).toString().padStart(2, "0");
  return `${rounded < 0 ? "-" : "+"}${abs}°`;
}

function ShowcaseAvatar3D({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const [modeIndex, setModeIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropLayerRef = useRef<HTMLDivElement>(null);
  const modelLayerRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLSpanElement>(null);

  const stateRef = useRef({
    hovering: false,
    targetRx: 0,
    targetRy: 0,
    currentRx: 0,
    currentRy: 0,
    targetGx: 50,
    targetGy: 35,
    currentGx: 50,
    currentGy: 35,
    impulse: 0,
    reducedMotion: false,
  });

  const cycleMode = useCallback(() => {
    setModeIndex((prev) => (prev + 1) % PERSONA_MODES.length);
    if (!stateRef.current.reducedMotion) {
      stateRef.current.impulse = 18;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reducedMotion = mq.matches;

    const handleChange = () => {
      stateRef.current.reducedMotion = mq.matches;
      if (mq.matches) {
        if (backdropLayerRef.current) {
          backdropLayerRef.current.style.transform = "translateZ(-24px)";
        }
        if (modelLayerRef.current) {
          modelLayerRef.current.style.transform = "translateZ(8px)";
        }
        if (telemetryRef.current) {
          telemetryRef.current.textContent = "Y +00° · P +00°";
        }
      }
    };

    mq.addEventListener("change", handleChange);

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const s = stateRef.current;
      if (!document.hidden && !s.reducedMotion) {
        if (!s.hovering) {
          const t = (now - startTime) * 0.001;
          s.targetRy = Math.sin(t * 0.9) * 4;
          s.targetRx = Math.cos(t * 0.7) * 2.5;
          s.targetGx = 50 + Math.sin(t * 0.9) * 14;
          s.targetGy = 35 + Math.cos(t * 0.7) * 10;
        }

        s.impulse *= 0.86;
        if (Math.abs(s.impulse) < 0.05) s.impulse = 0;

        const targetRyWithImpulse = s.targetRy + s.impulse;
        s.currentRx += (s.targetRx - s.currentRx) * 0.12;
        s.currentRy += (targetRyWithImpulse - s.currentRy) * 0.12;
        s.currentGx += (s.targetGx - s.currentGx) * 0.12;
        s.currentGy += (s.targetGy - s.currentGy) * 0.12;

        if (backdropLayerRef.current) {
          backdropLayerRef.current.style.transform = `translateZ(-24px) translate3d(${(
            -s.currentRy * 0.55
          ).toFixed(2)}px, ${(s.currentRx * 0.55).toFixed(2)}px, 0) scale(1.06)`;
        }
        if (modelLayerRef.current) {
          modelLayerRef.current.style.transform = `translateZ(8px) rotateX(${s.currentRx.toFixed(
            2
          )}deg) rotateY(${s.currentRy.toFixed(2)}deg)`;
        }
        if (sheenRef.current) {
          sheenRef.current.style.background = `radial-gradient(circle at ${s.currentGx.toFixed(
            1
          )}% ${s.currentGy.toFixed(
            1
          )}%, rgba(255,255,255,0.22), rgba(96,165,250,0.08) 38%, transparent 70%)`;
        }
        if (telemetryRef.current) {
          telemetryRef.current.textContent = `Y ${formatSignedDeg(
            s.currentRy
          )} · P ${formatSignedDeg(s.currentRx)}`;
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
    stateRef.current.targetRy = nx * 14;
    stateRef.current.targetRx = -ny * 10;
    stateRef.current.targetGx = 50 + nx * 32;
    stateRef.current.targetGy = 40 + ny * 28;
  };

  const handlePointerLeave = () => {
    stateRef.current.hovering = false;
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cycleMode();
    }
  };

  const activeMode = PERSONA_MODES[modeIndex];

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={`Interactive 3D persona for ${name}. Focus: ${activeMode.label}. Click or press Enter to cycle focus.`}
      onClick={cycleMode}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: "950px" }}
      className={cn(
        "relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-[#0D1117] border border-outline-variant/45 dark:border-outline-variant/35 select-none cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        className
      )}
    >
      <div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Layer 0: Spatial Architectural Grid & Studio Rim Glow */}
        <div
          ref={backdropLayerRef}
          aria-hidden="true"
          style={{ transform: "translateZ(-24px) scale(1.06)" }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0 opacity-75 [background-size:32px_32px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)]" />
          <div className="absolute -left-10 top-1/4 w-44 h-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-10 bottom-1/4 w-44 h-44 rounded-full bg-secondary/15 blur-3xl" />
        </div>

        {/* Layer 1: 3D Persona Bust + Cursor Specular Sheen */}
        <div
          ref={modelLayerRef}
          style={{ transform: "translateZ(8px)" }}
          className="pointer-events-none absolute inset-0 flex items-end justify-center will-change-transform"
        >
          <div className="h-full aspect-square max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <OptimizedImage
              src="/avatar-3d-persona.png"
              alt={`${name} 3D persona`}
              width={768}
              height={768}
              priority
              sizes="(max-width: 1024px) 100vw, 420px"
              className="w-full h-full object-contain object-bottom scale-[1.03] drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]"
            />
          </div>
          <div
            ref={sheenRef}
            aria-hidden="true"
            className="absolute inset-0 mix-blend-soft-light opacity-85"
          />
        </div>

        {/* Bottom Scrim for HUD Legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0D1117]/95 via-[#0D1117]/55 to-transparent"
        />

        {/* Layer 2: Floating HUD Chips & Mode Bar */}
        <div
          style={{ transform: "translateZ(28px)" }}
          className="pointer-events-none absolute inset-0 p-3 sm:p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#0D1117]/75 border border-white/15 backdrop-blur-md font-code text-[10px] uppercase tracking-[0.12em] text-slate-200">
              3D PERSONA
            </span>
            <span
              ref={telemetryRef}
              className="px-2 py-0.5 rounded-md bg-[#0D1117]/75 border border-white/15 backdrop-blur-md font-code text-[10px] text-slate-300 tabular-nums"
            >
              Y +00° · P +00°
            </span>
          </div>

          <div
            className={cn(
              "rounded-xl bg-[#0D1117]/80 backdrop-blur-md border px-3 py-2 flex items-center justify-between gap-3 shadow-sm",
              activeMode.ringClass
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn("w-2 h-2 rounded-full shrink-0", activeMode.dotClass)}
              />
              <div className="min-w-0">
                <div className="font-display text-xs font-semibold text-white truncate">
                  {activeMode.label}
                </div>
                <div className="font-code text-[10px] text-slate-300 truncate">
                  {activeMode.detail}
                </div>
              </div>
            </div>
            <span className="font-code text-[10px] text-slate-400 shrink-0 hidden sm:inline">
              Click to cycle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardAvatar3D({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

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
      -ny * 12
    ).toFixed(1)}deg) rotateY(${(nx * 12).toFixed(1)}deg) scale(1.03)`;
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "1";
      sheenRef.current.style.background = `radial-gradient(circle at ${(
        50 +
        nx * 35
      ).toFixed(0)}% ${(50 + ny * 35).toFixed(
        0
      )}%, rgba(255,255,255,0.28), transparent 65%)`;
    }
  };

  const handlePointerLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(420px) rotateX(0deg) rotateY(0deg)";
    }
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative w-16 h-16 rounded-2xl overflow-hidden bg-[#0D1117] border border-outline-variant/45 dark:border-outline-variant/35 shrink-0 shadow-sm transition-transform duration-200 ease-out",
        className
      )}
    >
      <OptimizedImage
        src="/avatar-3d-persona.png"
        alt={`${name} 3D persona`}
        width={128}
        height={128}
        sizes="64px"
        className="w-full h-full object-cover object-[50%_18%] pointer-events-none"
      />
      <div
        ref={sheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-200"
      />
    </div>
  );
}

function BadgeAvatar3D({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-7 h-7 rounded-full overflow-hidden bg-[#0D1117] border border-outline-variant/50 shrink-0 shadow-sm",
        className
      )}
    >
      <OptimizedImage
        src="/avatar-3d-persona.png"
        alt={`${name} 3D persona`}
        width={56}
        height={56}
        sizes="28px"
        className="w-full h-full object-cover object-[50%_18%] transition-transform duration-200 hover:scale-105"
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
    return <CardAvatar3D name={name} className={className} />;
  }
  if (variant === "badge") {
    return <BadgeAvatar3D name={name} className={className} />;
  }
  return <ShowcaseAvatar3D name={name} className={className} />;
}

export default InteractiveAvatar3D;

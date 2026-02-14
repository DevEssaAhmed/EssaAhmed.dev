import React, { useEffect, useMemo, useState } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * HeroRightDashboard
 * Purpose: a polished, animated, layered right-side dashboard to sit beside the hero.
 *
 * Drop-in notes:
 * - Needs `framer-motion`, `react-parallax-tilt`, `react-countup`.
 * - Keep same ChartContainer / chart tooltip components you already have for styling.
 * - Adjust `max-w-[420px]` to match the exact width you want next to your hero.
 */

const palette = {
  primary: "hsl(222 89% 60%)",
  violet: "hsl(258 89% 66%)",
  teal: "hsl(173 77% 45%)",
  amber: "hsl(38 92% 50%)",
};

function makeTrend(days = 14) {
  const now = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      visitors: Math.round(100 + Math.random() * 120),
    };
  });
}

function makeCategories() {
  return [
    { name: "Design", value: 420 },
    { name: "Engineering", value: 310 },
    { name: "Growth", value: 220 },
    { name: "Ops", value: 150 },
  ];
}

function makeTopProducts() {
  return [
    { name: "A", sales: 420 },
    { name: "B", sales: 370 },
    { name: "C", sales: 300 },
    { name: "D", sales: 240 },
    { name: "E", sales: 190 },
  ];
}

/* Animation variants for staggered entrance */
const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
};
const fromTop = { hidden: { y: -28, opacity: 0 }, show: { y: 0, opacity: 1 } };
const fromBottom = { hidden: { y: 28, opacity: 0 }, show: { y: 0, opacity: 1 } };
const fromLeft = { hidden: { x: -28, opacity: 0 }, show: { x: 0, opacity: 1 } };
const fromRight = { hidden: { x: 28, opacity: 0 }, show: { x: 0, opacity: 1 } };

const KPI = ({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) => {
  return (
    <Tilt
      glareEnable={false}
      tiltMaxAngleX={6}
      tiltMaxAngleY={6}
      perspective={800}
      transitionSpeed={500}
      scale={1.015}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="rounded-lg border border-border bg-card/80 px-4 py-3 shadow-softback backdrop-blur-sm"
      >
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-extrabold" style={{ color }}>
            <CountUp end={value} duration={1.4} separator="," />
            {label.toLowerCase().includes("sales") ? "k" : ""}
          </div>
          {sub && <div className="text-sm text-muted-foreground/80">{sub}</div>}
        </div>
      </motion.div>
    </Tilt>
  );
};

const FloatingBadge: React.FC<{ text: string; color?: string; style?: React.CSSProperties }> = ({ text, color, style }) => (
  <div
    style={style}
    className="absolute -top-5 left-3 px-3 py-1 rounded-full text-xs font-medium shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
  >
    <span
      style={{
        background: `linear-gradient(90deg, ${color ?? palette.violet}, ${palette.primary})`,
        color: "white",
        padding: "4px 8px",
        borderRadius: 999,
        boxShadow: "0 6px 18px rgba(34,35,58,0.32)",
        fontSize: 12,
      }}
    >
      {text}
    </span>
  </div>
);

// Inline skeleton component for faster FCP/LCP
const DashboardSkeleton = () => (
  <div className="relative h-fit w-full max-w-[470px] md:max-w-[520px] lg:max-w-[560px] select-none">
    <div 
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02), 0 40px 80px rgba(25,17,50,0.55)",
        borderRadius: 18,
      }} 
    />
    <div className="relative z-10">
      <div 
        className="absolute right-0 top-6 w-[86%] h-[76%] rounded-2xl border border-border/50 bg-card/60"
        style={{ transform: "rotate(-1.2deg)" }}
      />
      <div className="absolute right-0 top-0 w-full h-[92%] rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/4 to-blue-500/4" />
      <div 
        className="relative rounded-2xl overflow-hidden border border-border bg-card/90 p-4"
        style={{ minHeight: 420 }}
      >
        <Skeleton className="absolute -top-3 left-4 h-6 w-28 rounded-full" />
        <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
          <div className="rounded-lg border border-border bg-card/80 px-4 py-3">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-20" />
          </div>
          <div className="rounded-lg border border-border bg-card/80 px-4 py-3">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/85 p-3 mb-4">
          <div className="h-44 flex flex-col justify-end">
            <div className="flex items-end justify-between gap-1 h-32 px-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="flex-1 rounded-t-sm"
                  style={{ height: `${30 + Math.sin(i * 0.5) * 25 + 15}%` }} 
                />
              ))}
            </div>
            <Skeleton className="h-px w-full mt-2" />
          </div>
          <Skeleton className="absolute right-7 top-[168px] h-6 w-12 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card/80 p-3 flex items-center justify-center" style={{ minHeight: 120 }}>
            <div className="relative w-[108px] h-[108px]">
              <Skeleton className="absolute inset-0 rounded-full" />
              <div className="absolute inset-[34px] rounded-full bg-card" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/80 p-3" style={{ minHeight: 120 }}>
            <div className="flex items-end justify-between gap-2 h-[100px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="flex-1 rounded-t-md"
                  style={{ height: `${85 - i * 12}%` }} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="w-2 h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HeroRightDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const [isReady, setIsReady] = useState(false);
  const [trend, setTrend] = useState(() => makeTrend());
  const categories = useMemo(() => makeCategories(), []);
  const [topProds, setTopProds] = useState(() => makeTopProducts());

  useEffect(() => {
    // Mark as ready after a microtask to allow skeleton to paint first
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const id = window.setInterval(() => {
      setTrend(makeTrend());
      setTopProds(makeTopProducts());
    }, 11_000);
    return () => clearInterval(id);
  }, [isReady]);

  if (!isReady) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={cn(
        "relative h-fit w-full max-w-[470px] md:max-w-[520px] lg:max-w-[560px] select-none",
        className
      )}
    >
      {/* Background blurred halo + soft border to ensure it reads on both themes */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
           style={{
             boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02), 0 40px 80px rgba(25,17,50,0.55)",
             borderRadius: 18,
           }} />

      {/* Layered Windows (3 overlapping cards) */}
      <div className="relative z-10">

        {/* BACK LAYER (faint, angled) */}
        <motion.div
          initial={{ x: 28, y: 20, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="absolute right-0 top-6 w-[86%] h-[76%] rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md"
          style={{
            transform: "rotate(-1.2deg)",
            boxShadow: "0 40px 90px rgba(12,8,24,0.6)",
            overflow: "hidden",
          }}
        />

        {/* MID LAYER (slightly above back, bigger glow) */}
        <motion.div
          initial={{ x: 14, y: 6, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="absolute right-0 top-0 w-full h-[92%] rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/4 to-blue-500/4 backdrop-blur-sm"
          style={{
            boxShadow: "0 30px 60px rgba(10,10,30,0.6)",
            overflow: "hidden",
          }}
        />

        {/* FRONT CARD (main interactive area) */}
        <Tilt
          glareEnable={true}
          glareMaxOpacity={0.10}
          tiltMaxAngleX={4}
          tiltMaxAngleY={6}
          perspective={900}
          scale={1.02}
          transitionSpeed={900}
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="relative rounded-2xl overflow-hidden border border-border bg-card/90 p-4"
            style={{
              minHeight: 420,
              // neon border highlight (double outline)
              boxShadow:
                "0 12px 30px rgba(3,6,30,0.6), 0 0 40px rgba(66,43,255,0.06)",
            }}
          >
            {/* Decorative floating badge */}
            <FloatingBadge text="Analytics · 2025" color={palette.violet} style={{ left: 16, top: -18 }} />

            {/* KPI Row (staggered: top-left slides from top, top-right slides from top but opposite) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 mb-4"
            >
              <motion.div variants={fromTop}>
                <KPI label="Sales (M)" value={24_300} sub="MoM +8%" color={palette.primary} />
              </motion.div>

              <motion.div variants={fromTop}>
                <KPI label="Active Users" value={1_204} sub="Daily Peak 1,498" color={palette.violet} />
              </motion.div>
            </motion.div>

            {/* Main Trend chart — center card with subtle glow */}
            <motion.div
              variants={fromBottom}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.7 }}
              className="rounded-xl border border-border bg-card/85 p-3 mb-4"
              style={{ boxShadow: "inset 0 -4px 20px rgba(10,10,30,0.45)" }}
            >
              <ChartContainer className="h-44" config={{ visitors: { label: "Visitors", color: palette.primary } }}>
                <AreaChart data={trend} margin={{ left: 6, right: 6, top: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={palette.primary} stopOpacity={0.36} />
                      <stop offset="90%" stopColor={palette.primary} stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="heroStroke" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor={palette.primary} stopOpacity={1} />
                      <stop offset="100%" stopColor={palette.violet} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <RechartsTooltip content={<ChartTooltipContent />} cursor={false} />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="url(#heroStroke)"
                    strokeWidth={2.5}
                    fill="url(#heroFill)"
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={900}
                  />
                </AreaChart>
              </ChartContainer>

              {/* tiny floating CTA inside chart */}
              <div className="absolute right-4 top-6">
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `linear-gradient(90deg, ${palette.violet}, ${palette.primary})`,
                    color: "white",
                    boxShadow: "0 8px 30px rgba(66,43,255,0.12)",
                  }}
                >
                  Live
                </div>
              </div>
            </motion.div>

            {/* Bottom row: two tiles (donut + bar) with independent tilt/entrance */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div variants={fromLeft} initial="hidden" animate="show">
                <Tilt
                  tiltMaxAngleX={6}
                  tiltMaxAngleY={4}
                  perspective={700}
                  scale={1.02}
                  glareEnable={false}
                  transitionSpeed={700}
                >
                  <div className="rounded-lg border border-border bg-card/80 p-3 flex items-center justify-center" style={{ minHeight: 120 }}>
                    <PieChart width={120} height={120}>
                      <Pie data={categories} innerRadius={34} outerRadius={54} dataKey="value" paddingAngle={6}>
                        {categories.map((_, idx) => (
                          <Cell key={idx} fill={[palette.violet, palette.teal, palette.amber, palette.primary][idx % 4]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </div>
                </Tilt>
              </motion.div>

              <motion.div variants={fromRight} initial="hidden" animate="show">
                <Tilt
                  tiltMaxAngleX={6}
                  tiltMaxAngleY={4}
                  perspective={700}
                  scale={1.02}
                  glareEnable={false}
                  transitionSpeed={700}
                >
                  <div className="rounded-lg border border-border bg-card/80 p-3" style={{ minHeight: 120 }}>
                    <BarChart width={160} height={100} data={topProds}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <RechartsTooltip />
                      <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill={palette.teal} />
                    </BarChart>
                  </div>
                </Tilt>
              </motion.div>
            </div>

            {/* Bottom decorative control row */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Updated 2m ago</div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: `linear-gradient(90deg, ${palette.primary}, ${palette.violet})`,
                    color: "white",
                    boxShadow: "0 8px 18px rgba(66,43,255,0.14)",
                  }}
                >
                  View report
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: palette.primary }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: palette.violet, opacity: 0.9 }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: palette.teal, opacity: 0.9 }} />
                </div>
              </div>
            </div>
          </motion.div>
        </Tilt>
      </div>
    </div>
  );
};

export default HeroRightDashboard;

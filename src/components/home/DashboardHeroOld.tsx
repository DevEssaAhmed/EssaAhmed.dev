// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Area,
//   AreaChart,
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Line,
//   LineChart,
//   PolarAngleAxis,
//   RadialBar,
//   RadialBarChart,
//   Tooltip as RechartsTooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import {
//   ChartContainer,
//   ChartLegend,
//   ChartLegendContent,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { cn } from "@/lib/utils";

// const primary = "hsl(222 89% 60%)"; // Tailwind-ish primary
// const violet = "hsl(258 89% 66%)";
// const teal = "hsl(173 77% 45%)";
// const amber = "hsl(38 92% 50%)";

// function makeSeries(days = 14, base = 120, variance = 35) {
//   const now = new Date();
//   return Array.from({ length: days }).map((_, i) => {
//     const d = new Date(now);
//     d.setDate(d.getDate() - (days - 1 - i));
//     const v = Math.max(0, Math.round(base + (Math.random() - 0.5) * variance * 2));
//     const e = Math.max(0, Math.round(v * (0.4 + Math.random() * 0.4)));
//     return {
//       day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
//       visitors: v,
//       reads: e,
//     };
//   });
// }

// function useAutoRotate(count: number, interval = 5000) {
//   const [index, setIndex] = useState(0);
//   useEffect(() => {
//     if (count <= 1) return;
//     const id = window.setInterval(() => setIndex((p) => (p + 1) % count), interval);
//     return () => window.clearInterval(id);
//   }, [count, interval]);
//   return [index, setIndex] as const;
// }

// const DashboardHero: React.FC<{ className?: string }> = ({ className }) => {
//   const [dataset, setDataset] = useState(() => makeSeries());
//   const [active, setActive] = useAutoRotate(4, 6000);
//   const wrapRef = useRef<HTMLDivElement | null>(null);

//   // Soft parallax on hover
//   useEffect(() => {
//     const el = wrapRef.current;
//     if (!el) return;
//     let raf = 0;
//     const onMove = (e: MouseEvent) => {
//       const rect = el.getBoundingClientRect();
//       const px = (e.clientX - rect.left) / rect.width - 0.5;
//       const py = (e.clientY - rect.top) / rect.height - 0.5;
//       cancelAnimationFrame(raf);
//       raf = requestAnimationFrame(() => {
//         el.style.setProperty("--tx", `${px * 8}px`);
//         el.style.setProperty("--ty", `${py * 6}px`);
//       });
//     };
//     el.addEventListener("mousemove", onMove);
//     return () => {
//       el.removeEventListener("mousemove", onMove);
//       cancelAnimationFrame(raf);
//     };
//   }, []);

//   // Periodically regenerate data for subtle motion
//   useEffect(() => {
//     const id = window.setInterval(() => setDataset(makeSeries()), 12000);
//     return () => window.clearInterval(id);
//   }, []);

//   // Cards config
//   const cards = useMemo(
//     () => [
//       { key: "area", title: "Visitors", color: primary },
//       { key: "bar", title: "Reads", color: violet },
//       { key: "radial", title: "Conversion", color: teal },
//       { key: "line", title: "Active", color: amber },
//     ],
//     []
//   );

//   return (
//     <div
//       ref={wrapRef}
//       className={cn(
//         "relative w-full h-full p-4 sm:p-5",
//         "[transform:translate3d(var(--tx,0),var(--ty,0),0)]",
//         className
//       )}
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10" />
//       <div className="grid grid-cols-2 gap-3 h-full relative">
//         {cards.map((c, i) => (
//           <div
//             key={c.key}
//             className={cn(
//               "rounded-xl border bg-card/90 shadow-glow backdrop-blur-xs overflow-hidden",
//               "transition-all duration-500",
//               active === i ? "ring-2 ring-primary/30" : "ring-0"
//             )}
//           >
//             {c.key === "area" && (
//               <ChartContainer className="h-44" config={{ visitors: { label: "Visitors", color: c.color } }}>
//                 <AreaChart data={dataset} margin={{ left: 6, right: 6, top: 12, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="fillArea" x1="0" x2="0" y1="0" y2="1">
//                       <stop offset="5%" stopColor={c.color} stopOpacity={0.35} />
//                       <stop offset="95%" stopColor={c.color} stopOpacity={0.04} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="day" hide />
//                   <YAxis hide />
//                   <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
//                   <Area type="monotone" dataKey="visitors" stroke={c.color} fill="url(#fillArea)" strokeWidth={2} />
//                 </AreaChart>
//               </ChartContainer>
//             )}

//             {c.key === "bar" && (
//               <ChartContainer className="h-44" config={{ reads: { label: "Reads", color: c.color } }}>
//                 <BarChart data={dataset} margin={{ left: 6, right: 6, top: 12, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                   <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
//                   <YAxis hide />
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                   <Bar dataKey="reads" radius={[6, 6, 0, 0]} fill={c.color} />
//                 </BarChart>
//               </ChartContainer>
//             )}

//             {c.key === "radial" && (
//               <ChartContainer className="h-44" config={{ conv: { label: "Conversion" } }}>
//                 {(() => {
//                   const conv = Math.round(3 + Math.random() * 7); // 3% - 10%
//                   const radialData = [{ name: "conv", value: conv }];
//                   return (
//                     <RadialBarChart
//                       innerRadius="60%"
//                       outerRadius="95%"
//                       data={radialData}
//                       startAngle={90}
//                       endAngle={90 + (conv / 100) * 360}
//                     >
//                       <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
//                       <RadialBar dataKey="value" cornerRadius={6} fill={c.color} />
//                       <ChartLegend content={<ChartLegendContent className="text-xs" />} verticalAlign="top" />
//                       <text
//                         x="50%"
//                         y="52%"
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                         className="fill-foreground text-lg font-semibold"
//                       >
//                         {conv}%
//                       </text>
//                     </RadialBarChart>
//                   );
//                 })()}
//               </ChartContainer>
//             )}

//             {c.key === "line" && (
//               <ChartContainer className="h-44" config={{ active: { label: "Active", color: c.color } }}>
//                 <LineChart data={dataset} margin={{ left: 6, right: 6, top: 12, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="2 4" />
//                   <XAxis dataKey="day" hide />
//                   <YAxis hide />
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                   <Line type="monotone" dataKey="visitors" stroke={c.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
//                 </LineChart>
//               </ChartContainer>
//             )}
//           </div>
//         ))}
//       </div>
//       {/* Tiny control dots */}
//       <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
//         {cards.map((_, i) => (
//           <button
//             key={i}
//             aria-label={`Go to card ${i + 1}`}
//             onClick={() => setActive(i)}
//             className={cn("w-2 h-2 rounded-full transition", active === i ? "bg-primary" : "bg-muted-foreground/40")}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// // export default DashboardHero;
// import React, { useEffect, useState } from "react";
// import {
//   AreaChart, Area,
//   BarChart, Bar,
//   PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
// } from "recharts";
// import { cn } from "@/lib/utils";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// const colors = {
//   primary: "hsl(222 89% 60%)",
//   violet: "hsl(258 89% 66%)",
//   teal: "hsl(173 77% 45%)",
//   amber: "hsl(38 92% 50%)",
// };

// function generateTrendData(days = 14) {
//   const now = new Date();
//   return Array.from({ length: days }).map((_, i) => {
//     const d = new Date(now);
//     d.setDate(d.getDate() - (days - 1 - i));
//     return {
//       day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
//       value: Math.floor(100 + Math.random() * 100),
//     };
//   });
// }

// function generateCategoryData() {
//   return [
//     { name: "Category A", value: 400 },
//     { name: "Category B", value: 300 },
//     { name: "Category C", value: 200 },
//     { name: "Category D", value: 100 },
//   ];
// }

// function generateBarData() {
//   return [
//     { name: "Product 1", sales: 240 },
//     { name: "Product 2", sales: 221 },
//     { name: "Product 3", sales: 229 },
//     { name: "Product 4", sales: 200 },
//     { name: "Product 5", sales: 218 },
//   ];
// }

// const KPI = ({ label, value, color }: { label: string; value: string; color: string }) => (
//   <div
//     className={cn(
//       "flex flex-col p-3 rounded-lg border shadow-md backdrop-blur-sm",
//       "bg-card/80 border-border"
//     )}
//   >
//     <span className="text-sm text-muted-foreground">{label}</span>
//     <span className="text-2xl font-bold" style={{ color }}>{value}</span>
//   </div>
// );

// const RightAnalyticsPanel: React.FC<{ className?: string }> = ({ className }) => {
//   const [trendData, setTrendData] = useState(() => generateTrendData());
//   const [categoryData, setCategoryData] = useState(() => generateCategoryData());
//   const [barData, setBarData] = useState(() => generateBarData());

//   // Refresh data periodically for subtle animation
//   useEffect(() => {
//     const id = setInterval(() => {
//       setTrendData(generateTrendData());
//       setCategoryData(generateCategoryData());
//       setBarData(generateBarData());
//     }, 12000);
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div
//       className={cn(
//         "w-full max-w-sm p-4 rounded-xl border shadow-lg backdrop-blur-sm",
//         "bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5",
//         className
//       )}
//     >
//       {/* KPI Row */}
//       <div className="grid grid-cols-2 gap-3 mb-4">
//         <KPI label="Sales (M)" value="$24.3k" color={colors.primary} />
//         <KPI label="Active Users" value="1,204" color={colors.violet} />
//       </div>

//       {/* Trend Chart */}
//       <div className="mb-4 rounded-lg border bg-card/80 shadow-md p-2">
//         <ChartContainer className="h-40" config={{ value: { label: "Visitors", color: colors.primary } }}>
//           <AreaChart data={trendData} margin={{ left: 6, right: 6, top: 12, bottom: 0 }}>
//             <defs>
//               <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
//                 <stop offset="5%" stopColor={colors.primary} stopOpacity={0.35} />
//                 <stop offset="95%" stopColor={colors.primary} stopOpacity={0.04} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="day" hide />
//             <YAxis hide />
//             <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
//             <Area type="monotone" dataKey="value" stroke={colors.primary} fill="url(#trendFill)" strokeWidth={2} />
//           </AreaChart>
//         </ChartContainer>
//       </div>

//       {/* Bottom Row */}
//       <div className="grid grid-cols-2 gap-3">
//         {/* Donut Chart */}
//         <div className="rounded-lg border bg-card/80 shadow-md p-2 flex items-center justify-center">
//           <PieChart width={150} height={150}>
//             <Pie
//               data={categoryData}
//               innerRadius={40}
//               outerRadius={60}
//               paddingAngle={3}
//               dataKey="value"
//             >
//               {categoryData.map((_, idx) => (
//                 <Cell key={idx} fill={[colors.violet, colors.teal, colors.amber, colors.primary][idx % 4]} />
//               ))}
//             </Pie>
//             <RechartsTooltip />
//           </PieChart>
//         </div>

//         {/* Bar Chart */}
//         <div className="rounded-lg border bg-card/80 shadow-md p-2">
//           <BarChart width={150} height={150} data={barData}>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//             <XAxis dataKey="name" hide />
//             <YAxis hide />
//             <RechartsTooltip />
//             <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill={colors.teal} />
//           </BarChart>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default RightAnalyticsPanel;
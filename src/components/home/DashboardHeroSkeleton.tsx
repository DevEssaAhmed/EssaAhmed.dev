import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton UI for DashboardHero component
 * Matches the layout structure for smooth loading transition
 */
const DashboardHeroSkeleton = () => {
  return (
    <div className="relative h-fit w-full max-w-[470px] md:max-w-[520px] lg:max-w-[560px] select-none">
      {/* Background shadow effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02), 0 40px 80px rgba(25,17,50,0.55)",
          borderRadius: 18,
        }} 
      />

      {/* Main card skeleton */}
      <div className="relative z-10">
        {/* Back layer */}
        <div 
          className="absolute right-0 top-6 w-[86%] h-[76%] rounded-2xl border border-border/50 bg-card/60"
          style={{ transform: "rotate(-1.2deg)" }}
        />
        
        {/* Mid layer */}
        <div className="absolute right-0 top-0 w-full h-[92%] rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/4 to-blue-500/4" />

        {/* Front card */}
        <div 
          className="relative rounded-2xl overflow-hidden border border-border bg-card/90 p-4"
          style={{ minHeight: 420 }}
        >
          {/* Floating badge skeleton */}
          <Skeleton className="absolute -top-3 left-4 h-6 w-28 rounded-full" />

          {/* KPI Row */}
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

          {/* Main chart area */}
          <div className="rounded-xl border border-border bg-card/85 p-3 mb-4">
            <div className="h-44 flex flex-col justify-end">
              {/* Simulated chart bars/area */}
              <div className="flex items-end justify-between gap-1 h-32 px-2">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="flex-1 rounded-t-sm"
                    style={{ 
                      height: `${30 + Math.sin(i * 0.5) * 25 + Math.random() * 20}%`,
                      animationDelay: `${i * 50}ms`
                    }} 
                  />
                ))}
              </div>
              <Skeleton className="h-px w-full mt-2" />
            </div>
            {/* Live badge skeleton */}
            <Skeleton className="absolute right-7 top-[168px] h-6 w-12 rounded-full" />
          </div>

          {/* Bottom row: two tiles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Pie chart skeleton */}
            <div className="rounded-lg border border-border bg-card/80 p-3 flex items-center justify-center" style={{ minHeight: 120 }}>
              <div className="relative w-[108px] h-[108px]">
                <Skeleton className="absolute inset-0 rounded-full" />
                <div className="absolute inset-[34px] rounded-full bg-card" />
              </div>
            </div>

            {/* Bar chart skeleton */}
            <div className="rounded-lg border border-border bg-card/80 p-3" style={{ minHeight: 120 }}>
              <div className="flex items-end justify-between gap-2 h-[100px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="flex-1 rounded-t-md"
                    style={{ 
                      height: `${85 - i * 12}%`,
                      animationDelay: `${i * 100}ms`
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom control row */}
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
};

export default DashboardHeroSkeleton;

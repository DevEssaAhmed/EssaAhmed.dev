import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface PerformanceSkeletonProps {
  className?: string;
  variant?: 'card' | 'list' | 'editor' | 'sidebar';
  count?: number;
}

export const PerformanceSkeleton: React.FC<PerformanceSkeletonProps> = ({
  className = '',
  variant = 'card',
  count = 1
}) => {
  const renderCardSkeleton = () => (
    <div className="space-y-4 animate-fade-up">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-10" />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3 animate-fade-up">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );

  const renderEditorSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up w-full">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow p-6 space-y-6">
          <Skeleton className="h-12 w-3/4 rounded-md" /> {/* Title Input */}

          <div className="space-y-2">
            <Skeleton className="h-4 w-12" /> {/* Slug/Desc Label */}
            <Skeleton className="h-9 w-1/2" /> {/* Slug/Desc Input */}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Content Label */}
            <div className="border rounded-lg pt-6 pb-12 px-4 shadow-sm bg-background/50">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pl-8 pr-4"><Skeleton className="h-9 w-3/4 rounded-md" /></div>
                <div className="flex items-center gap-3 pl-8 pr-4"><Skeleton className="h-5 w-full rounded-md" /></div>
                <div className="flex items-center gap-3 pl-8 pr-4"><Skeleton className="h-5 w-[85%] rounded-md" /></div>
                <div className="flex items-center gap-3 pl-8 pr-4"><Skeleton className="h-5 w-[90%] rounded-md" /></div>
                <div className="h-2"></div>
                <div className="flex items-center gap-3 pl-8 pr-4"><Skeleton className="h-6 w-1/3 rounded-md" /></div>
                <div className="flex items-center gap-3 pl-8 pr-4"><Skeleton className="h-5 w-[95%] rounded-md" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Right side cards */}
        <div className="rounded-xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow p-6 space-y-4">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <div className="flex justify-between items-center"><Skeleton className="h-4 w-16" /><Skeleton className="h-6 w-20 rounded-full" /></div>
          <div className="flex justify-between items-center"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" /></div>
        </div>

        <div className="rounded-xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow p-6 space-y-6">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><div className="flex gap-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-10" /></div></div>
          <div className="space-y-2"><Skeleton className="h-4 w-32" /><div className="flex gap-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-10" /></div></div>
        </div>

        <div className="rounded-xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow p-6 space-y-4">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />
        </div>
      </div>
    </div>
  );

  const renderSidebarSkeleton = () => (
    <div className="space-y-3 animate-fade-up">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'editor':
        return renderEditorSkeleton();
      case 'sidebar':
        return renderSidebarSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={{ animationDelay: `${index * 100}ms` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};
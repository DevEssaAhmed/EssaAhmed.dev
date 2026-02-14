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
    <div className="space-y-6 animate-fade-up">
      <Skeleton className="h-12 w-2/3" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
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
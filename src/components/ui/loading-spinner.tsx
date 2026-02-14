import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'gradient' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 border-2';
      case 'md':
        return 'w-6 h-6 border-2';
      case 'lg':
        return 'w-8 h-8 border-2';
      case 'xl':
        return 'w-12 h-12 border-4';
      default:
        return 'w-6 h-6 border-2';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'border-transparent border-t-primary border-r-primary/50';
      case 'pulse':
        return 'border-primary/20 border-t-primary animate-pulse-glow';
      default:
        return 'border-muted-foreground/20 border-t-primary';
    }
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        getSizeClasses(),
        getVariantClasses(),
        className
      )}
    />
  );
};
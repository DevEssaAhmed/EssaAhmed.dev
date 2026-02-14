import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'hero' | 'subtle' | 'vibrant' | 'dark' | 'custom';
  animated?: boolean;
}

const GradientBackground = React.forwardRef<HTMLDivElement, GradientBackgroundProps>(
  ({ className, variant = 'subtle', animated = false, children, ...props }, ref) => {
    const variants = {
      hero: 'bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20',
      subtle: 'bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50 dark:from-gray-900/50 dark:via-gray-900 dark:to-gray-800/50',
      vibrant: 'bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 dark:from-violet-950/30 dark:via-pink-950/20 dark:to-cyan-950/30',
      dark: 'bg-gradient-to-br from-gray-900 via-black to-gray-800',
      custom: ''
    };

    const animationClass = animated ? 'bg-gradient-animated' : '';

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          variants[variant],
          animationClass,
          className
        )}
        {...props}
      >
        {animated && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/30 to-violet-400/30 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float-delay" />
          </>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

GradientBackground.displayName = 'GradientBackground';

export { GradientBackground };
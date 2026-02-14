import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  hover?: boolean;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = 'default', hover = true, ...props }, ref) => {
    const variants = {
      default: 'bg-card/50 backdrop-blur-sm border border-border/50',
      glass: 'bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10',
      elevated: 'bg-card/80 backdrop-blur-md border border-border/30 shadow-xl',
      gradient: 'bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border border-border/30'
    };

    const hoverEffects = hover ? 'hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300' : '';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl overflow-hidden',
          variants[variant],
          hoverEffects,
          className
        )}
        {...props}
      />
    );
  }
);

ModernCard.displayName = 'ModernCard';

export { ModernCard };
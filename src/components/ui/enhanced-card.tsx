import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface EnhancedCardProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'glass' | 'glow' | 'gradient' | 'minimal';
  interactive?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  title,
  description,
  className = '',
  variant = 'default',
  interactive = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-card/80 backdrop-blur-md border border-border/50 shadow-card';
      case 'glow':
        return 'bg-card/90 backdrop-blur-sm border border-primary/20 shadow-glow hover:shadow-glow';
      case 'gradient':
        return 'bg-gradient-primary text-primary-foreground border-0 shadow-soft';
      case 'minimal':
        return 'bg-transparent border border-border/30 shadow-none hover:border-border/60';
      default:
        return 'bg-card border border-border shadow-card';
    }
  };

  const interactiveClasses = interactive
    ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-glow cursor-pointer'
    : 'transition-all duration-200';

  return (
    <Card className={cn(getVariantClasses(), interactiveClasses, className)}>
      {(title || description) && (
        <CardHeader className="animate-fade-up">
          {title && (
            <CardTitle className={cn(
              'font-bold',
              variant === 'gradient' ? 'text-primary-foreground' : 'text-foreground'
            )}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              variant === 'gradient' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent className="animate-fade-up delay-100">
          {children}
        </CardContent>
      )}
    </Card>
  );
};
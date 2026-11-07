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
        return 'bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/30 shadow-card';
      case 'glow':
        return 'bg-surface-container-low border border-outline-variant/30 shadow-lg hover:border-primary/40';
      case 'gradient':
        return 'bg-surface-container-low border border-outline-variant/30 shadow-lg';
      case 'minimal':
        return 'bg-transparent border border-outline-variant/30 shadow-none hover:border-outline-variant/60';
      default:
        return 'bg-surface-container-low border border-outline-variant/30 shadow-card';
    }
  };

  const interactiveClasses = interactive
    ? 'transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg cursor-pointer'
    : 'transition-all duration-200';

  return (
    <Card className={cn(getVariantClasses(), interactiveClasses, className)}>
      {(title || description) && (
        <CardHeader className="animate-fade-up">
          {title && (
            <CardTitle className="font-bold text-on-surface">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-on-surface-variant">
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

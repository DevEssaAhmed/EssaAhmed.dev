import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'saving' | 'saved' | 'error' | 'syncing';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showText = true,
  size = 'md',
  className
}) => {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: 'Online',
      variant: 'default' as const,
      pulse: false
    },
    offline: {
      color: 'bg-gray-400',
      text: 'Offline',
      variant: 'secondary' as const,
      pulse: false
    },
    saving: {
      color: 'bg-yellow-500',
      text: 'Saving...',
      variant: 'secondary' as const,
      pulse: true
    },
    saved: {
      color: 'bg-green-500',
      text: 'Saved',
      variant: 'default' as const,
      pulse: false
    },
    error: {
      color: 'bg-red-500',
      text: 'Error',
      variant: 'destructive' as const,
      pulse: false
    },
    syncing: {
      color: 'bg-blue-500',
      text: 'Syncing...',
      variant: 'default' as const,
      pulse: true
    }
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const config = statusConfig[status];

  if (!showText) {
    return (
      <div className={cn('flex items-center', className)}>
        <div 
          className={cn(
            'rounded-full',
            sizes[size],
            config.color,
            config.pulse ? 'animate-pulse' : ''
          )} 
        />
      </div>
    );
  }

  return (
    <Badge variant={config.variant} className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'rounded-full',
          sizes[size],
          config.color,
          config.pulse ? 'animate-pulse' : ''
        )} 
      />
      {config.text}
    </Badge>
  );
};

export { StatusIndicator };
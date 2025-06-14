import React from 'react';
import { Loader2 } from 'lucide-react';
import type { BaseComponentProps } from '../../types/Component';

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  center?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  gray: 'text-gray-400'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  center = false,
  className = '',
  testId,
  ...props
}) => {
  const spinnerClasses = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    animate-spin
    ${className}
  `;

  const containerClasses = `
    ${center ? 'flex items-center justify-center' : 'inline-flex items-center'}
    ${text ? 'space-x-2' : ''}
  `;

  return (
    <div 
      className={containerClasses}
      data-testid={testId}
      {...props}
    >
      <Loader2 className={spinnerClasses} />
      {text && (
        <span className={`${colorClasses[color]} ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Full page loading overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  blur = true
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`
          absolute inset-0 bg-white bg-opacity-75 
          ${blur ? 'backdrop-blur-sm' : ''}
        `} 
      />
      
      {/* Spinner */}
      <div className="relative">
        <LoadingSpinner
          size="xl"
          text={text}
          center
        />
      </div>
    </div>
  );
};

// Card loading state
interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  className = ''
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex space-x-4">
        {showAvatar && (
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={`
                h-4 bg-gray-300 rounded 
                ${i === lines - 1 ? 'w-3/4' : 'w-full'}
              `}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for specific components
export const DeviceCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-card animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      <div className="h-6 w-12 bg-gray-300 rounded-full"></div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      <div className="h-8 bg-gray-300 rounded w-full"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-card animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-300 rounded"></div>
  </div>
);

export default LoadingSpinner;
import React from 'react';
import { Loader2 } from 'lucide-react';
import type { BaseComponentProps } from '../../types/Component';

interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const baseClasses = `
  inline-flex items-center justify-center rounded-lg font-medium 
  transition-all duration-200 focus:outline-none focus:ring-2 
  focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
`;

const variantClasses = {
  primary: `
    bg-primary-600 text-white hover:bg-primary-700 
    focus:ring-primary-500 shadow-sm
  `,
  secondary: `
    bg-gray-100 text-gray-900 hover:bg-gray-200 
    focus:ring-gray-500 border border-gray-300
  `,
  danger: `
    bg-danger-600 text-white hover:bg-danger-700 
    focus:ring-danger-500 shadow-sm
  `,
  ghost: `
    text-gray-700 hover:bg-gray-100 hover:text-gray-900 
    focus:ring-gray-500
  `,
  outline: `
    border border-gray-300 text-gray-700 bg-white 
    hover:bg-gray-50 focus:ring-primary-500
  `
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-sm h-10',
  lg: 'px-6 py-3 text-base h-12'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  testId,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      data-testid={testId}
      {...props}
    >
      {/* Left icon or loading spinner */}
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon */}
      {rightIcon && !loading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
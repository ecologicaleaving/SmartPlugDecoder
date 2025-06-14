import React from 'react';

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface BaseComponentProps extends ComponentProps {
  id?: string;
  testId?: string;
} 
import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'text' | 'circle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant='rect', size='md', height }) => {
  const sizeMap: Record<string,string> = {
    xs: 'w-8',
    sm: 'w-16',
    md: 'w-32',
    lg: 'w-48',
    xl: 'w-64',
    full: 'w-full'
  };
  const heightMap: Record<string,string> = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-10',
    xl: 'h-40'
  };
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-200 dark:bg-slate-700 relative overflow-hidden',
        sizeMap[size],
        height ? heightMap[height] : (variant==='text' && 'h-4'),
        variant==='circle' && 'rounded-full',
        variant!=='circle' && variant!=='text' && 'rounded-md',
        className
      )}
    />
  );
};

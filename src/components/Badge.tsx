import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'black' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-2 py-0.5 font-mono text-xs font-semibold tracking-wider uppercase';
  
  const variants = {
    yellow: 'bg-secondary text-primary',
    black: 'bg-primary text-white',
    gray: 'bg-gray-light text-gray-medium',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

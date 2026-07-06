import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'px-6 py-3 font-sans font-semibold tracking-wide text-sm uppercase transition-all duration-300 ease-out focus:outline-none cursor-pointer';
  
  const variants = {
    primary: 'bg-secondary text-primary hover:bg-black hover:text-secondary border border-transparent active:scale-[0.98]',
    secondary: 'bg-primary text-white hover:bg-secondary hover:text-primary border border-transparent active:scale-[0.98]',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white active:scale-[0.98]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

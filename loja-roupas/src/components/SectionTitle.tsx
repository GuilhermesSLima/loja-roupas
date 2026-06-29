import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  underline?: boolean;
  rightElement?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  className = '',
  underline = false,
  rightElement,
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-end md:justify-between mb-8 ${className}`}>
      <div className="flex flex-col">
        {subtitle && (
          <span className="font-mono text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
            // {subtitle}
          </span>
        )}
        <h2 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight text-primary uppercase relative">
          {title}
          {underline && (
            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-secondary"></span>
          )}
        </h2>
      </div>
      {rightElement && <div className="mt-4 md:mt-0">{rightElement}</div>}
    </div>
  );
};

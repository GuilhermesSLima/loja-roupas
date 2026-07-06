import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  image: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  className?: string;
  aspectClass?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  image,
  title,
  subtitle,
  actionText = 'Comprar Coleção',
  className = '',
  aspectClass = 'aspect-[3/4]',
}) => {
  return (
    <div className={`relative overflow-hidden group ${aspectClass} ${className} cursor-pointer`}>
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300"></div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          {subtitle && (
            <span className="block font-mono text-[10px] font-semibold tracking-wider text-secondary uppercase mb-1">
              {subtitle}
            </span>
          )}
          <h3 className="font-sans text-xl md:text-2xl font-black uppercase tracking-tight mb-3">
            {title}
          </h3>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-mono text-xs font-semibold tracking-wide text-secondary uppercase">
              {actionText}
            </span>
            <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

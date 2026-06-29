import React from 'react';

interface ProductCardProps {
  id: string | number;
  name: string;
  category: string;
  price: string;
  image: string;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  category,
  price,
  image,
  onAddToCart,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-light overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Product Image Wrapper */}
      <div className="relative aspect-square overflow-hidden bg-gray-light">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Hover overlay/quick view badge (minimalist) */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category (JetBrains Mono) */}
        <span className="font-mono text-[10px] font-semibold tracking-wider text-gray-medium uppercase mb-1">
          {category}
        </span>

        {/* Title */}
        <h3 className="font-sans text-sm font-bold text-primary tracking-tight mb-2 uppercase line-clamp-1">
          {name}
        </h3>

        {/* Value / Price (JetBrains Mono) */}
        <span className="font-mono text-sm font-bold text-primary mb-5 mt-auto">
          {price}
        </span>

        {/* Add to Cart Actions */}
        <div className="flex items-stretch gap-2">
          {/* Main button */}
          <button
            onClick={onAddToCart}
            className="flex-grow bg-primary hover:bg-secondary text-white hover:text-primary py-2.5 px-4 font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Adicionar ao Carrinho
          </button>
          
          {/* Icon Placeholder beside button */}
          <div 
            title="Futuro Ícone"
            className="w-10 flex items-center justify-center border border-gray-light bg-gray-light/30 text-gray-medium text-[9px] font-mono select-none"
          >
            [+]
          </div>
        </div>
      </div>
    </div>
  );
};

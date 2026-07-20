import React from 'react';
import { useStore } from '../context/StoreContext';

export const Hero: React.FC = () => {
  const { storeInfo } = useStore();

  if (!storeInfo) return null;

  return (
    <section className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden py-16 md:py-24 border-b border-gray-light">
      <div className="w-full max-w-3xl mx-auto px-6 flex items-center justify-center animate-fade-in">
        {storeInfo.banner ? (
          <img
            src={storeInfo.banner}
            alt={storeInfo.nome}
            className="w-full h-auto object-contain select-none"
            draggable={false}
          />
        ) : (
          // Default fallback banner
          <img
            src="/sem-imagem.png"
            alt={storeInfo.nome}
            className="w-full h-auto object-contain select-none"
            draggable={false}
          />
        )}
      </div>
    </section>
  );
};

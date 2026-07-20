import React from 'react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { storeInfo } = useStore();

  if (!storeInfo) return null;

  return (
    <footer className="flex-row items-center justify-between bg-white border-t border-gray-light pt-16 pb-8 px-4 sm:px-6 lg:px-8 flex flex-col text-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 gap-12 mb-16">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center">
              {storeInfo.logo ? (
                <img src={storeInfo.logo} alt={storeInfo.nome} className="h-28 w-auto object-contain" />
              ) : (
                <span className="font-sans font-black text-2xl tracking-tight text-primary uppercase">
                  {storeInfo.nome}
                </span>
              )}
            </div>
            <p className="font-mono text-xs font-semibold tracking-[0.35em] text-secondary uppercase animate-fade-in-down">
              Bem-vindo à {storeInfo.nome}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-light pt-8 flex flex-col items-center justify-center text-center font-mono text-[10px] text-gray-medium uppercase tracking-wider gap-4">
          <p>© {new Date().getFullYear()} {storeInfo.nome}. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </div>
    </footer>
  );
};

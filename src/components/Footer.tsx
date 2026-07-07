import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="flex-row items-center justify-between allign-center bg-white border-t border-gray-light pt-16 pb-8 px-4 sm:px-6 lg:px-8 flex-col">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-12 mb-16">

          {/* Column 1: Brand details & Social Icons */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center">
              <img src="/logo-black.png" alt="Canhoto Surf Outlet" className="h-50 w-auto object-contain" />
            </div>
            <p className="font-mono text-xs font-semibold tracking-[0.35em] text-yellow-400 uppercase animate-fade-in-down">
              Bem-vindo a Canhoto Surf Outlet
            </p>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="border-t border-gray-light pt-8 flex flex-col items-center justify-center text-center font-mono text-[10px] text-gray-medium uppercase tracking-wider gap-4">
          <p>© {new Date().getFullYear()} CANHOTO SURF OUTLET. TODOS OS DIREITOS RESERVADOS.</p>
        </div>

      </div>
    </footer>
  );
};

import React from 'react';
import { Badge } from './Badge';

interface NavbarProps {
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount = 0 }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className="font-sans text-xl font-black tracking-widest text-primary uppercase">
              VOGUE <span className="text-secondary font-normal">&</span> BEYOND
            </a>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8 font-sans font-medium text-sm uppercase tracking-wider">
            <a href="#" className="text-primary hover:text-secondary border-b-2 border-secondary pb-1 transition-all duration-200">
              Home
            </a>
            <a href="#" className="text-gray-medium hover:text-primary transition-all duration-200">
              Produtos
            </a>
            <a href="#" className="text-gray-medium hover:text-primary transition-all duration-200">
              Categorias
            </a>
            <a href="#" className="text-gray-medium hover:text-primary transition-all duration-200">
              Contato
            </a>
          </nav>

          {/* Action Icons & Search Placeholder */}
          <div className="flex items-center space-x-6">
            
            {/* Search Bar Placeholder */}
            <div className="relative hidden lg:flex items-center">
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                disabled 
                className="w-48 bg-gray-light text-xs font-mono px-4 py-2 border border-transparent rounded-none focus:outline-none cursor-not-allowed opacity-75 placeholder:text-gray-medium"
              />
              <span className="absolute right-3 w-4 h-4 flex items-center justify-center border border-dashed border-gray-medium/50 rounded-sm text-[8px] font-mono text-gray-medium cursor-not-allowed select-none">
                SRC
              </span>
            </div>

            {/* Icons placeholders */}
            <div className="flex items-center space-x-4">
              {/* User profile placeholder */}
              <button 
                title="Perfil" 
                disabled 
                className="w-8 h-8 flex flex-col items-center justify-center border border-dashed border-gray-medium/50 hover:border-primary rounded-sm cursor-not-allowed opacity-75 group transition-colors duration-200"
              >
                <span className="text-[9px] font-mono text-gray-medium group-hover:text-primary select-none">USR</span>
              </button>

              {/* Cart Button Placeholder */}
              <button 
                title="Carrinho" 
                className="relative w-8 h-8 flex flex-col items-center justify-center border border-primary bg-primary hover:bg-secondary hover:border-secondary transition-all duration-300 group cursor-pointer"
              >
                <span className="text-[9px] font-mono text-white group-hover:text-primary select-none">CRT</span>
                {cartCount > 0 && (
                  <Badge 
                    variant="yellow" 
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full border border-primary text-[10px]"
                  >
                    {cartCount}
                  </Badge>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

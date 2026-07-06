import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, User, ShoppingBag } from 'lucide-react';
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
            <Link to="/" className="font-sans text-xl font-black tracking-widest text-primary uppercase">
              VOGUE <span className="text-secondary font-normal">&</span> BEYOND
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8 font-sans font-medium text-sm uppercase tracking-wider items-center">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "text-primary border-b-2 border-secondary pb-1 transition-all duration-200" 
                  : "text-gray-medium hover:text-primary transition-all duration-200"
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/produtos" 
              className={({ isActive }) => 
                isActive 
                  ? "text-primary border-b-2 border-secondary pb-1 transition-all duration-200" 
                  : "text-gray-medium hover:text-primary transition-all duration-200"
              }
            >
              Produtos
            </NavLink>
            
            <NavLink 
              to="/contato" 
              className={({ isActive }) => 
                isActive 
                  ? "text-primary border-b-2 border-secondary pb-1 transition-all duration-200" 
                  : "text-gray-medium hover:text-primary transition-all duration-200"
              }
            >
              Contato
            </NavLink>
          </nav>

          {/* Action Icons & Search Placeholder */}
          <div className="flex items-center space-x-6">
            
            {/* Search Bar Placeholder */}
             <div className="relative hidden lg:flex items-center">
               <input 
                 type="text" 
                 placeholder="Pesquisar..." 
                 disabled 
                 className="w-48 bg-gray-light text-xs font-mono pl-4 pr-10 py-2 border border-transparent rounded-none focus:outline-none cursor-not-allowed opacity-75 placeholder:text-gray-medium"
               />
               <Search className="absolute right-3 w-4 h-4 text-gray-medium" />
             </div>

            {/* Icons placeholders */}
            <div className="flex items-center space-x-4">
               {/* User profile */}
               <button 
                 title="Perfil" 
                 disabled 
                 className="w-8 h-8 flex flex-col items-center justify-center border border-gray-light hover:border-primary rounded-sm cursor-not-allowed opacity-75 group transition-colors duration-200"
               >
                 <User className="w-4 h-4 text-gray-medium group-hover:text-primary" />
               </button>
 
               {/* Cart Button */}
               <button 
                 title="Carrinho" 
                 className="relative w-8 h-8 flex flex-col items-center justify-center border border-primary bg-primary hover:bg-secondary hover:border-secondary transition-all duration-300 group cursor-pointer"
               >
                 <ShoppingBag className="w-4 h-4 text-white group-hover:text-primary" />
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

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Badge } from './Badge';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo-black.png" alt="Canhoto Surf Outlet" className="h-14 w-auto object-contain" />
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8 font-sans font-medium text-sm uppercase tracking-wider items-center">
            <NavLink 
              to="/" 
              end
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

          {/* Cart Icon */}
          <div className="flex items-center">
            <Link
              to="/carrinho"
              title="Carrinho"
              className="relative w-9 h-9 flex items-center justify-center border border-primary bg-primary hover:bg-secondary hover:border-secondary transition-all duration-300 group"
            >
              <ShoppingBag className="w-4 h-4 text-white group-hover:text-primary" />
              {totalItems > 0 && (
                <Badge
                  variant="yellow"
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full border border-primary text-[10px] flex items-center justify-center"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </Badge>
              )}
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};


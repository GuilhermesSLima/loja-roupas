import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Badge } from './Badge';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const { storeInfo } = useStore();

  if (!storeInfo) return null;

  const baseRoute = `/loja/${storeInfo.slug}`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex-shrink-0 flex items-center">
            <Link to={baseRoute} className="flex items-center">
              {storeInfo.logo ? (
                <img src={storeInfo.logo} alt={storeInfo.nome} className="h-14 w-auto object-contain" />
              ) : (
                <span className="font-sans font-black text-xl tracking-tight text-primary uppercase">
                  {storeInfo.nome}
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8 font-sans font-medium text-sm uppercase tracking-wider items-center">
            <NavLink 
              to={baseRoute} 
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
              to={`${baseRoute}/produtos`} 
              className={({ isActive }) => 
                isActive 
                  ? "text-primary border-b-2 border-secondary pb-1 transition-all duration-200" 
                  : "text-gray-medium hover:text-primary transition-all duration-200"
              }
            >
              Produtos
            </NavLink>
            <NavLink 
              to={`${baseRoute}/contato`} 
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
              to={`${baseRoute}/carrinho`}
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

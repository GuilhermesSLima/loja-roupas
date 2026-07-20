import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shirt } from 'lucide-react';

export const SaaSLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-yellow-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0A0A]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-yellow-500/10 group-hover:scale-105 transition-transform">
              <Shirt className="h-5 w-5 text-black stroke-[2.5]" />
            </div>
            <span className="font-sans font-extrabold text-xl tracking-tight text-white group-hover:text-yellow-400 transition-colors">
              sualoj<span className="text-yellow-400">4</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <button
              onClick={() => navigate('/admin/login')}
              className="px-5 py-2.5 rounded-xl border border-white/[0.15] text-sm font-medium hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              Acessar Painel
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050505] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
              <Shirt className="h-4 w-4 text-black stroke-[2.5]" />
            </div>
            <span className="font-sans font-bold text-base tracking-tight text-white">
              sualoj<span className="text-yellow-400">4</span>
            </span>
          </div>
          
          <p className="text-white/40 text-xs font-mono">
            &copy; {new Date().getFullYear()} sualoj4. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

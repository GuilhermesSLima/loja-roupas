import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.');
      setLoading(false);
      return;
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* Conteúdo centralizado */}
      <div className="flex-grow flex flex-col items-center justify-center px-4">

        {/* Cabeçalho da marca */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo-black.png" alt="Canhoto Surf Outlet" className="h-28 w-auto object-contain mb-4" />
          <p className="font-mono text-[11px] tracking-[0.35em] text-gray-medium uppercase">
            ADMINISTRAÇÃO INTERNA
          </p>
        </div>

        {/* Card de login */}
        <div className="w-full max-w-sm border border-gray-light rounded-sm bg-white shadow-sm p-10">

          <div className="mb-8">
            <h2 className="font-sans text-2xl font-bold text-primary tracking-tight">
              Acesso Admin
            </h2>
            <p className="mt-1.5 font-sans text-sm text-gray-medium">
              Insira suas credenciais de acesso ao painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-medium"
              >
                E-MAIL
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                placeholder="admin@loja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-light/60 border border-transparent focus:border-primary focus:bg-white focus:outline-none px-4 py-3 font-mono text-sm text-primary placeholder:text-gray-medium/60 transition-all rounded-sm"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-medium"
              >
                CHAVE DE ACESSO
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-light/60 border border-transparent focus:border-primary focus:bg-white focus:outline-none px-4 py-3 pr-11 font-mono text-sm text-primary placeholder:text-gray-medium/60 transition-all rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-medium hover:text-primary transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-sm">
                <p className="font-mono text-[10px] text-red-600 uppercase tracking-wide">
                  ⚠ {error}
                </p>
              </div>
            )}

            {/* Botão de envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-primary text-primary hover:text-white font-mono text-sm font-bold tracking-[0.15em] uppercase py-4 flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Autorizando...
                </span>
              ) : (
                <>
                  Autorizar Acesso
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Voltar para a loja */}
        <Link
          to="/"
          className="mt-10 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] text-gray-medium hover:text-primary uppercase transition-colors group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          VOLTAR PARA A LOJA
        </Link>
      </div>

      {/* Marca d'água inferior direita */}
      <div className="flex justify-end px-8 pb-6">
        <div className="text-right border-l-2 border-gray-light pl-4">
          <p className="font-mono text-[9px] font-bold tracking-[0.25em] text-gray-medium uppercase">
            TERMINAL SEGURO
          </p>
          <p className="font-mono text-[9px] text-gray-medium/60 tracking-wider">
            v.4.0.2
          </p>
        </div>
      </div>

    </div>
  );
};

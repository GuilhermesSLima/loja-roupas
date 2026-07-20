import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Palette, Smartphone, ArrowRight, Check } from 'lucide-react';

export const SaaSHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] font-sans pb-20">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono text-xs text-yellow-400 font-semibold uppercase tracking-wider">
            Plataforma SaaS para Lojas de Roupas
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Crie a loja online da sua marca em <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">poucos minutos</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-sans">
          A plataforma mais elegante e intuitiva para você gerenciar o estoque, personalizar as cores e vender suas peças diretamente pelo WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-yellow-400 text-black font-semibold text-base hover:bg-yellow-350 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-yellow-400/25 cursor-pointer"
          >
            Acessar Painel Admin
            <ArrowRight className="h-4 w-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a
            href="#recursos"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/[0.1] text-white font-medium hover:bg-white/5 transition-all text-center"
          >
            Ver Recursos
          </a>
        </div>
      </section>

      {/* Mockup Preview Section */}
      <section className="max-w-5xl mx-auto px-6 mb-32 relative z-10">
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#111]/60 p-2 md:p-4 backdrop-blur-sm shadow-2xl shadow-yellow-500/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
          <img
            src="/hero_fashion_1782738993770.jpg"
            alt="Preview do Catálogo"
            className="w-full h-auto rounded-xl object-cover opacity-75 border border-white/[0.05]"
            style={{ maxHeight: '420px' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              Interface Otimizada para Celular e Computador
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="max-w-7xl mx-auto px-6 mb-32 relative z-10 scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
            Tudo o que sua loja de roupas precisa
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto">
            Recursos projetados especificamente para a estética e dinâmica do varejo de moda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#121212]/80 border border-white/[0.06] rounded-2xl p-8 space-y-6 hover:border-yellow-500/20 transition-all hover:translate-y-[-4px]">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Catálogo de Alta Performance</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Páginas públicas elegantes e rápidas com filtros de categorias, fotos de alta qualidade e carregamento instantâneo.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121212]/80 border border-white/[0.06] rounded-2xl p-8 space-y-6 hover:border-yellow-500/20 transition-all hover:translate-y-[-4px]">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
              <Palette className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Identidade Visual Flexível</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Altere o logotipo, o banner principal e a paleta de cores primária, secundária e de fundo diretamente pelo painel administrativo.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121212]/80 border border-white/[0.06] rounded-2xl p-8 space-y-6 hover:border-yellow-500/20 transition-all hover:translate-y-[-4px]">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Vendas via WhatsApp</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Checkout dinâmico que envia o carrinho detalhado formatado com tamanhos e quantidades diretamente para o WhatsApp do lojista.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plan */}
      <section className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="bg-gradient-to-b from-[#161616] to-[#111] border border-white/[0.08] rounded-3xl p-10 md:p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-yellow-400 uppercase tracking-widest bg-yellow-400/15 px-3 py-1 rounded-full">
              Plano Único
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Comece a vender online hoje
            </h2>
          </div>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-white/60 text-sm font-medium">R$</span>
            <span className="text-white text-5xl font-black tracking-tight">89</span>
            <span className="text-white/60 text-sm font-medium">/mês</span>
          </div>

          <ul className="text-left max-w-sm mx-auto space-y-3.5 text-white/70 text-sm">
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-yellow-400 stroke-[3]" />
              <span>Produtos e fotos ilimitados</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-yellow-400 stroke-[3]" />
              <span>Domínio exclusivo `/loja/suamarca`</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-yellow-400 stroke-[3]" />
              <span>Painel de controle de estoque</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-yellow-400 stroke-[3]" />
              <span>Customização completa de paleta de cores</span>
            </li>
          </ul>

          <button
            onClick={() => navigate('/admin/login')}
            className="w-full py-4 rounded-xl bg-white text-black font-bold text-base hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer"
          >
            Criar Minha Conta
          </button>
        </div>
      </section>
    </div>
  );
};

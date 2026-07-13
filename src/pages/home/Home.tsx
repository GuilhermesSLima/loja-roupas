import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Hero } from '../../components/Hero';
import { supabase } from '../../lib/supabase';



// ─── Types ────────────────────────────────────────────────────────────────────
interface Destaque {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  descricao: string;
}

interface HomeProps {
  onAddToCart: () => void;
}

// ─── Carousel Card ────────────────────────────────────────────────────────────
const FeaturedCard: React.FC<{ produto: Destaque }> = ({ produto }) => (
  <Link
    to={`/produtos/${produto.id}`}
    className="group flex-shrink-0 w-[260px] sm:w-[300px] md:w-[340px] flex flex-col"
  >
    {/* Image */}
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-light rounded-sm">
      <img
        src={produto.imagem || 'https://placehold.co/340x453/f5f5f5/999?text=Sem+Imagem'}
        alt={produto.nome}
        className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        loading="lazy"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
        <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-white bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          Ver Produto →
        </span>
      </div>
      {/* Destaque badge */}
      <div className="absolute top-3 left-3 bg-secondary text-primary font-mono text-[8px] font-black tracking-widest uppercase px-2 py-1">
        ✦ DESTAQUE
      </div>
    </div>

    {/* Info */}
    <div className="mt-3.5 space-y-1">
      <h3 className="font-sans text-sm font-bold text-primary uppercase tracking-tight truncate group-hover:text-secondary transition-colors duration-200">
        {produto.nome}
      </h3>
      {produto.descricao && (
        <p className="font-sans text-[11px] text-gray-medium leading-snug line-clamp-2">
          {produto.descricao}
        </p>
      )}
      <p className="font-mono text-sm font-bold text-primary pt-1">
        R$ {produto.preco.toFixed(2).replace('.', ',')}
      </p>
    </div>
  </Link>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const Home: React.FC<HomeProps> = () => {
  const [destaques, setDestaques] = useState<Destaque[]>([]);
  const [loadingDestaques, setLoadingDestaques] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomProducts, setRandomProducts] = useState<Destaque[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // ── Fetch random products for "Nossos produtos" grid ────────────────────────────────────────
  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        // PostgREST não suporta ORDER BY random() — buscamos tudo e embaralhamos no cliente
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, preco, imagem, descricao')
          .eq('ativo', true);
        if (error) throw error;
        const all = data || [];
        // Fisher-Yates shuffle
        for (let i = all.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [all[i], all[j]] = [all[j], all[i]];
        }
        setRandomProducts(all.slice(0, 4));
      } catch (err) {
        console.error('Erro ao carregar produtos aleatórios:', err);
      }
    };
    fetchRandomProducts();
  }, []);

useEffect(() => {
  const fetchDestaques = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, preco, imagem, descricao')
        .eq('destaque', true)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestaques(data || []);
    } catch (err) {
      console.error('Erro ao carregar destaques:', err);
    } finally {
      setLoadingDestaques(false);
    }
  };

  fetchDestaques();
}, []);

  // ── Carousel: visible cards count ────────────────────────────────────────
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  useEffect(() => {
    const onResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const maxIndex = Math.max(0, destaques.length - visibleCount);

  // ── Auto-play ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (destaques.length <= visibleCount) return;
    autoRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [destaques.length, visibleCount, maxIndex]);

  const pauseAuto = () => { if (autoRef.current) clearInterval(autoRef.current); };

  const prev = () => {
    pauseAuto();
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    pauseAuto();
    setCurrentIndex((i) => Math.min(maxIndex, i + 1));
  };

  // ── Card width calc (must match CSS) ─────────────────────────────────────
  // card width + gap: sm=300+24, md=340+24, default=260+16
  const getCardWidthPx = () => {
    if (typeof window === 'undefined') return 324;
    if (window.innerWidth >= 768) return 364; // 340 + 24
    if (window.innerWidth >= 640) return 324; // 300 + 24
    return 276; // 260 + 16
  };

  const translateX = currentIndex * getCardWidthPx();

  return (
    <main className="flex-grow">

      {/* 1. Hero Banner */}
      <Hero />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. DESTAQUES CAROUSEL                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-secondary uppercase block mb-2">
                // PRODUTOS EM DESTAQUE
              </span>
              <h2 className="font-sans text-3xl md:text-4xl font-black text-primary uppercase tracking-tight">
                Mais Procurados
              </h2>
              <div className="w-10 h-[3px] bg-secondary mt-3" />
            </div>

            <div className="flex items-center gap-3">
              {/* Prev / Next buttons */}
              {destaques.length > visibleCount && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    disabled={currentIndex === 0}
                    className="w-9 h-9 flex items-center justify-center border border-gray-light hover:border-primary text-gray-medium hover:text-primary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed rounded-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={next}
                    disabled={currentIndex >= maxIndex}
                    className="w-9 h-9 flex items-center justify-center border border-gray-light hover:border-primary text-gray-medium hover:text-primary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed rounded-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              <Link
                to="/produtos"
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-gray-medium hover:text-primary transition-colors uppercase tracking-widest group"
              >
                Ver todos
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Carousel Track */}
          {loadingDestaques ? (
            <div className="flex items-center justify-center h-56 gap-3">
              <RefreshCw size={22} className="animate-spin text-gray-medium" />
              <span className="font-mono text-[10px] text-gray-medium uppercase tracking-widest">
                Carregando destaques...
              </span>
            </div>
          ) : destaques.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-light rounded-sm">
              <p className="font-mono text-xs text-gray-medium uppercase tracking-widest">
                Nenhum produto em destaque cadastrado.
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${translateX}px)` }}
              >
                {destaques.map((p) => (
                  <FeaturedCard key={p.id} produto={p} />
                ))}
              </div>

              {/* Dot indicators */}
              {destaques.length > visibleCount && (
                <div className="flex items-center justify-center gap-1.5 mt-8">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { pauseAuto(); setCurrentIndex(i); }}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        i === currentIndex
                          ? 'w-6 h-1.5 bg-primary'
                          : 'w-1.5 h-1.5 bg-gray-light hover:bg-gray-medium/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. Nossos Produtos Grid                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl font-black text-primary tracking-tight">
              Nossos produtos
            </h2>
            <div className="w-8 h-[3px] bg-primary mt-2" />
          </div>
          <Link
            to="/produtos"
            className="font-mono text-[10px] font-bold tracking-[0.2em] text-secondary hover:text-primary uppercase transition-colors flex items-center gap-1 group"
          >
            Ver todos os produtos
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: large card (first random product) */}
          {randomProducts.length > 0 && (
            <div className="relative overflow-hidden rounded-xl group cursor-pointer h-[480px] lg:h-[600px]">
              <img
                src={randomProducts[0].imagem}
                alt={randomProducts[0].nome}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 space-y-3">
                <span className="block font-mono text-[9px] font-bold tracking-[0.3em] text-secondary uppercase">
                  {randomProducts[0].nome}
                </span>
                <Link to={`/produtos/${randomProducts[0].id}`}>
                  <button className="bg-white text-primary font-mono text-xs font-bold px-5 py-2.5 rounded hover:bg-secondary transition-colors tracking-wide cursor-pointer">
                    Ver produto
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Right: stacked smaller cards (next three random products) */}
          <div className="flex flex-col gap-4">
            {/* Top right: wide card */}
            {randomProducts[1] && (
              <div className="relative overflow-hidden rounded-xl group cursor-pointer h-[200px] lg:h-[240px]">
                <img
                  src={randomProducts[1].imagem}
                  alt={randomProducts[1].nome}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <span className="block font-mono text-[9px] font-bold text-white uppercase">
                    {randomProducts[1].nome}
                  </span>
                </div>
              </div>
            )}
            {/* Bottom right: two side-by-side cards */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {randomProducts[2] && (
                <div className="relative overflow-hidden rounded-xl group cursor-pointer h-[180px] lg:h-[220px]">
                  <img
                    src={randomProducts[2].imagem}
                    alt={randomProducts[2].nome}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-2">
                    <span className="block font-mono text-[8px] font-bold text-white uppercase">
                      {randomProducts[2].nome}
                    </span>
                  </div>
                </div>
              )}
              {randomProducts[3] && (
                <div className="relative overflow-hidden rounded-xl group cursor-pointer h-[180px] lg:h-[220px]">
                  <img
                    src={randomProducts[3].imagem}
                    alt={randomProducts[3].nome}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-2">
                    <span className="block font-mono text-[8px] font-bold text-white uppercase">
                      {randomProducts[3].nome}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

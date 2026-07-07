import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/Badge';
import { RefreshCw, Filter, X, Check, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
  sizes: string[];
  color: string;
  dateAdded: number;
}

// ─── Deductions helpers for schema limitations ──────────────────────────────
const getCategoryFromName = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('camisa') || n.includes('camiseta') || n.includes('t-shirt') || n.includes('blusa') || n.includes('polo')) return 'Camisa';
  if (n.includes('casaco') || n.includes('jaqueta') || n.includes('blazer') || n.includes('sobretudo') || n.includes('coat') || n.includes('trench')) return 'Casaco';
  if (n.includes('short') || n.includes('bermuda') || n.includes('shorts')) return 'Short';
  if (n.includes('Calça') || n.includes('calça') || n.includes('Calça')) return 'Calça';
  if (n.includes('tenis') || n.includes('tênis') || n.includes('sapato') || n.includes('boot') || n.includes('bota') || n.includes('sandalia') || n.includes('sandália')) return 'Tênis';
  if (n.includes('regata')) return 'Regata';
  return 'Outros';
};

const getColorFromNameOrDesc = (name: string, desc: string | null): string => {
  const text = `${name} ${desc || ''}`.toLowerCase();
  if (text.includes('preto') || text.includes('preta') || text.includes('black') || text.includes('dark')) return 'Preto';
  if (text.includes('branco') || text.includes('branca') || text.includes('white')) return 'Branco';
  if (text.includes('azul') || text.includes('navy') || text.includes('blue')) return 'Azul';
  if (text.includes('amarelo') || text.includes('amarela') || text.includes('yellow') || text.includes('mostarda') || text.includes('mustard')) return 'Amarelo';
  if (text.includes('salmão') || text.includes('salmon')) return 'Salmão';
  if (text.includes('cinza') || text.includes('grey') || text.includes('gray')) return 'Cinza';
  if (text.includes('bege') || text.includes('beige')) return 'Bege';
  return 'Outros';
};

export const Catalog: React.FC = () => {
  // ── States ────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('Mais recentes');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // ── Filters lists ──────────────────────────────────────────────────────────
  const categoriesList = ['Camisa', 'Regata', 'Casaco', 'Short', 'Calça', 'Tênis'];
  const sizesList = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único'];
  const colorsList = [
    { name: 'Preto', class: 'bg-black border-black text-white' },
    { name: 'Branco', class: 'bg-white border-gray-medium/30 text-primary' },
    { name: 'Azul', class: 'bg-blue-900 border-blue-900 text-white' },
    { name: 'Amarelo', class: 'bg-yellow-500 border-yellow-500 text-primary' },
    { name: 'Salmão', class: 'bg-[#E07A5F] border-[#E07A5F] text-white' },
    { name: 'Cinza', class: 'bg-gray-500 border-gray-500 text-white' },
    { name: 'Bege', class: 'bg-[#F5F5DC] border-gray-medium/20 text-primary' },
  ];

  // ── Fetch dynamic catalog data ────────────────────────────────────────────
  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active products
      const { data: prodData, error: prodError } = await supabase
        .from('produtos')
        .select('id, nome, descricao, preco, imagem, destaque, created_at')
        .eq('ativo', true);

      if (prodError) throw prodError;

      // 2. Fetch inventory entries for sizes
      const { data: estData, error: estError } = await supabase
        .from('estoque')
        .select('produto_id, tamanho, quantidade');

      if (estError) throw estError;

      // Map sizes per product
      const sizesMap: Record<string, string[]> = {};
      (estData || []).forEach((row) => {
        if (row.quantidade > 0) {
          if (!sizesMap[row.produto_id]) sizesMap[row.produto_id] = [];
          if (!sizesMap[row.produto_id].includes(row.tamanho)) {
            sizesMap[row.produto_id].push(row.tamanho);
          }
        }
      });

      // 3. Convert to frontend format
      const formatted: Product[] = (prodData || []).map((p) => {
        const name = p.nome || '';
        const desc = p.descricao || '';
        return {
          id: p.id,
          name,
          category: getCategoryFromName(name),
          price: parseFloat(p.preco) || 0,
          image: p.imagem || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&h=800&q=80',
          tag: p.destaque ? 'DESTAQUE' : undefined,
          sizes: sizesMap[p.id] || [],
          color: getColorFromNameOrDesc(name, desc),
          dateAdded: new Date(p.created_at).getTime(),
        };
      });

      setProducts(formatted);
    } catch (err) {
      console.error('Erro ao buscar dados do catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  // ── Filters & Sorter Logic ────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by size
    if (selectedSize) {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    // Filter by color
    if (selectedColor) {
      result = result.filter((p) => p.color === selectedColor);
    }

    // Sorting
    if (sortBy === 'Mais recentes') {
      result.sort((a, b) => b.dateAdded - a.dateAdded);
    } else if (sortBy === 'Menor preço') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Maior preço') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, selectedCategories, selectedSize, selectedColor, sortBy]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSize(null);
    setSelectedColor(null);
    setSortBy('Mais recentes');
    setSearchQuery('');
    setVisibleCount(6);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, filteredProducts.length));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-light pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-sans text-3xl sm:text-4xl font-black uppercase tracking-tight text-primary mb-2">
            Coleção Completa
          </h1>
          <p className="font-sans text-xs text-gray-medium max-w-xl">
            Explore nossa seleção exclusiva de roupas e acessórios. Modelagens modernas e caimento refinado pensados para o seu estilo contemporâneo.
          </p>
        </div>

        {/* Sort and mobile filter button */}
        <div className="flex items-center justify-between md:justify-end gap-4 font-mono text-[11px]">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-primary px-4 py-2 uppercase font-bold text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
          >
            <Filter size={12} />
            Filtrar
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-gray-medium uppercase tracking-wider">ORDENAR POR</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-b border-primary bg-transparent py-1 font-bold text-primary focus:outline-none cursor-pointer uppercase"
            >
              <option value="Mais recentes">Mais recentes</option>
              <option value="Menor preço">Menor preço</option>
              <option value="Maior preço">Maior preço</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">

        {/* ── Sidebar Filters (Desktop) ── */}
        <aside className="hidden lg:block space-y-8">
          {/* Categoria */}
          <div>
            <h4 className="font-mono text-xs font-bold tracking-widest text-primary uppercase border-b border-gray-light pb-2.5 mb-3.5">
              Categoria
            </h4>
            <div className="space-y-2.5 font-mono text-xs">
              {categoriesList.map((cat) => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-primary group-hover:text-secondary transition-colors ${selectedCategories.includes(cat) ? 'font-bold' : ''}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tamanho */}
          <div>
            <h4 className="font-mono text-xs font-bold tracking-widest text-primary uppercase border-b border-gray-light pb-2.5 mb-3.5">
              Tamanho
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {sizesList.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                  className={`w-10 py-1.5 border font-mono text-[10px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                    selectedSize === size
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-primary border-gray-light hover:border-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div>
            <h4 className="font-mono text-xs font-bold tracking-widest text-primary uppercase border-b border-gray-light pb-2.5 mb-3.5">
              Cor
            </h4>
            <div className="flex flex-wrap gap-2">
              {colorsList.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(isSelected ? null : color.name)}
                    title={color.name}
                    className={`w-6 h-6 rounded-full border border-gray-medium/30 transition-transform duration-200 cursor-pointer relative flex items-center justify-center ${color.class} ${
                      isSelected ? 'scale-110 ring-2 ring-secondary' : 'hover:scale-105'
                    }`}
                  >
                    {isSelected && <Check size={10} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Limpar Filtros */}
          <button
            onClick={handleClearFilters}
            className="w-full bg-primary hover:bg-secondary text-white hover:text-primary py-2.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            Limpar Filtros
          </button>
        </aside>

        {/* ── Products Grid Panel ── */}
        <div className="space-y-6">
          {/* Campo de Pesquisa */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Pesquise por nome do produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-light/60 border border-transparent focus:border-primary focus:bg-white focus:outline-none px-4 py-3 pr-10 font-sans text-sm text-primary placeholder:text-gray-medium/50 transition-all rounded-sm"
            />
            <Search className="absolute right-4 text-gray-medium w-4 h-4" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <RefreshCw size={24} className="animate-spin text-gray-medium" />
              <p className="font-mono text-[10px] text-gray-medium uppercase tracking-widest">
                Carregando catálogo...
              </p>
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProducts.map((p) => (
                <div key={p.id} className="group flex flex-col h-full bg-white relative overflow-hidden">
                  {/* Card Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-light border border-gray-light/35 rounded-sm">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    />

                    {/* Tag badge */}
                    {p.tag && (
                      <Badge
                        variant="yellow"
                        className="absolute top-3 left-3 text-[8px] px-1.5 py-0.5 font-mono font-bold tracking-wider rounded-none"
                      >
                        {p.tag}
                      </Badge>
                    )}
                  </div>

                  {/* Details Block */}
                  <div className="flex flex-col mt-3.5 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-sans text-xs sm:text-sm font-bold text-primary tracking-tight uppercase truncate flex-grow">
                        {p.name}
                      </h3>
                      <span className="font-mono text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                        R$ {p.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-medium uppercase">
                      <span>{p.category}</span>
                      {p.sizes.length > 0 && (
                        <span>Tamanhos: {p.sizes.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-light rounded-sm">
              <span className="font-mono text-xs text-gray-medium uppercase tracking-widest mb-1">
                // Nenhum produto encontrado
              </span>
              <p className="font-sans text-xs text-gray-medium max-w-xs px-4">
                Tente ajustar os filtros selecionados para encontrar os itens que procura.
              </p>
            </div>
          )}

          {/* Load More Block */}
          {!loading && filteredProducts.length > 0 && (
            <div className="mt-14 border-t border-gray-light pt-6 flex flex-col items-center">
              <span className="font-mono text-[9px] font-bold text-gray-medium uppercase tracking-widest mb-3">
                Exibindo {displayedProducts.length} de {filteredProducts.length} itens
              </span>

              {/* Progress Line */}
              <div className="w-48 h-[2px] bg-gray-light relative mb-5 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                  style={{ width: `${(displayedProducts.length / filteredProducts.length) * 100}%` }}
                />
              </div>

              {/* Load More Button */}
              {displayedProducts.length < filteredProducts.length && (
                <button
                  onClick={handleLoadMore}
                  className="border border-primary bg-white hover:bg-primary text-primary hover:text-white transition-all duration-300 font-mono text-[10px] font-bold tracking-widest uppercase py-2.5 px-8 cursor-pointer"
                >
                  Carregar Mais Produtos
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filters Drawer/Modal ── */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-[280px] bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-light pb-3">
                <span className="font-sans text-sm font-black uppercase tracking-wider text-primary">Filtros</span>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="text-gray-medium hover:text-primary cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h5 className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Categoria</h5>
                <div className="space-y-2 font-mono text-xs">
                  {categoriesList.map((cat) => (
                    <label key={cat} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-primary ${selectedCategories.includes(cat) ? 'font-bold' : ''}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h5 className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Tamanho</h5>
                <div className="flex flex-wrap gap-1.5">
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(selectedSize === size ? null : size);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`w-9 py-1.5 border font-mono text-[9px] font-bold tracking-wider cursor-pointer ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-primary border-gray-light hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h5 className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase mb-2">Cor</h5>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((color) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(isSelected ? null : color.name);
                          setIsMobileFiltersOpen(false);
                        }}
                        title={color.name}
                        className={`w-6 h-6 rounded-full border border-gray-medium/30 cursor-pointer relative flex items-center justify-center ${color.class} ${
                          isSelected ? 'scale-110 ring-2 ring-secondary' : ''
                        }`}
                      >
                        {isSelected && <Check size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => {
                  handleClearFilters();
                  setIsMobileFiltersOpen(false);
                }}
                className="w-full bg-gray-light hover:bg-gray-medium/40 text-primary py-2.5 font-mono text-[9px] font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                Limpar Filtros
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-primary hover:bg-secondary text-white hover:text-primary py-2.5 font-mono text-[9px] font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                Ver Resultados ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EstoqueItem {
  tamanho: string;
  quantidade: number;
}

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  destaque: boolean;
  ativo: boolean;
  created_at: string;
  estoque: EstoqueItem[];
}

// ─── Helper: deduct category label from product name ─────────────────────────
const getCategoryLabel = (nome: string): string => {
  const n = nome.toLowerCase();
  if (n.includes('camisa') || n.includes('camiseta') || n.includes('blusa') || n.includes('polo')) return 'Camisa';
  if (n.includes('casaco') || n.includes('jaqueta') || n.includes('blazer') || n.includes('coat') || n.includes('trench')) return 'Casaco';
  if (n.includes('short') || n.includes('bermuda')) return 'Short';
  if (n.includes('calça') || n.includes('calca')) return 'Calça';
  if (n.includes('tenis') || n.includes('tênis') || n.includes('sapato') || n.includes('sandalia')) return 'Calçados';
  if (n.includes('regata')) return 'Regata';
  return 'Vestuário';
};

// ─── Size Order ───────────────────────────────────────────────────────────────
const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'Único'];
const sortSizes = (sizes: EstoqueItem[]) =>
  [...sizes].sort(
    (a, b) => SIZE_ORDER.indexOf(a.tamanho) - SIZE_ORDER.indexOf(b.tamanho)
  );

// ─── Related Product Card ─────────────────────────────────────────────────────
interface RelatedCardProps {
  produto: Produto;
}
const RelatedCard: React.FC<RelatedCardProps & { baseRoute: string }> = ({ produto, baseRoute }) => (
  <Link
    to={`${baseRoute}/produtos/${produto.id}`}
    className="group flex flex-col"
  >
    <div className="aspect-[3/4] overflow-hidden bg-gray-light rounded-sm relative">
      <img
        src={produto.imagem || '/sem-imagem.png'}
        alt={produto.nome}
        className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        loading="lazy"
      />
      {produto.destaque && (
        <Badge variant="yellow" className="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 font-mono font-bold tracking-wider rounded-none">
          DESTAQUE
        </Badge>
      )}
    </div>
    <div className="mt-3 space-y-0.5">
      <p className="font-mono text-[10px] text-gray-medium uppercase tracking-widest">
        {getCategoryLabel(produto.nome)}
      </p>
      <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-tight truncate">
        {produto.nome}
      </h4>
      <p className="font-mono text-sm font-bold text-primary">
        R$ {produto.preco.toFixed(2).replace('.', ',')}
      </p>
    </div>
  </Link>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const ProductDetail: React.FC = () => {
  const { lojaId, storeInfo } = useStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [related, setRelated] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Reset quantity when size changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  // ── Fetch product + estoque ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchProduto = async () => {
      setLoading(true);
      setSelectedSize(null);
      setSelectedImageIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        // Product
        const { data: prod, error: prodErr } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', id)
          .eq('ativo', true)
          .single();

        if (prodErr || !prod) throw prodErr || new Error('Produto não encontrado');

        // Stock
        const { data: est, error: estErr } = await supabase
          .from('estoque')
          .select('tamanho, quantidade')
          .eq('produto_id', id);

        if (estErr) throw estErr;

        const sortedStock = sortSizes(
          (est || []).filter((e) => e.quantidade > 0)
        );

        setProduto({ ...prod, estoque: sortedStock });

        // Fetch additional images for the product
        const { data: imgData, error: imgErr } = await supabase
          .from('produto_imagens')
          .select('url')
          .eq('produto_id', id);
        if (!imgErr && imgData) {
          const urls = imgData.map((r: any) => r.url).filter(Boolean);
          setAdditionalImages(urls);
        }

        // Set store whatsapp from context
        if (storeInfo) {
          setStoreWhatsapp(storeInfo.whatsapp || '');
        }

        // Related products (same category heuristic, exclude current)
        const { data: allProds } = await supabase
          .from('produtos')
          .select('id, nome, descricao, preco, imagem, destaque, ativo, created_at')
          .eq('ativo', true)
          .eq('loja_id', lojaId)
          .neq('id', id)
          .limit(12);

        const relatedMapped: Produto[] = (allProds || []).map((p) => ({
          ...p,
          estoque: [],
        }));

        // Prefer same category
        const cat = getCategoryLabel(prod.nome);
        const sameCat = relatedMapped.filter((p) => getCategoryLabel(p.nome) === cat);
        const others = relatedMapped.filter((p) => getCategoryLabel(p.nome) !== cat);
        const sorted = [...sameCat, ...others].slice(0, 4);

        setRelated(sorted);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id, lojaId]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!produto || !selectedSize) return;
    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem || '',
      tamanho: selectedSize,
      estoqueDisponivel: stockForSelected || 0,
      quantidade: quantity,
    });
    navigate(`/loja/${storeInfo?.slug || ''}/carrinho`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silently fail */
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const images = produto 
    ? ( [produto.imagem, ...additionalImages].filter(Boolean).length > 0 
        ? [produto.imagem, ...additionalImages].filter(Boolean) as string[]
        : ['/sem-imagem.png'] )
    : ['/sem-imagem.png'];
  const selectedStockItem = produto?.estoque.find((e) => e.tamanho === selectedSize);
  const stockForSelected = selectedStockItem?.quantidade ?? null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 gap-4">
        <RefreshCw size={28} className="animate-spin text-gray-medium" />
        <p className="font-mono text-[10px] text-gray-medium uppercase tracking-widest">
          Carregando produto...
        </p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <p className="font-sans text-4xl font-black text-primary uppercase">404</p>
        <p className="font-mono text-xs text-gray-medium uppercase tracking-widest">
          Produto não encontrado ou indisponível.
        </p>
        <button
          onClick={() => navigate(`/loja/${storeInfo?.slug || ''}/produtos`)}
          className="mt-4 border border-primary px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const category = getCategoryLabel(produto.nome);
  const totalStock = produto.estoque.reduce((s, e) => s + e.quantidade, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-medium uppercase tracking-widest mb-8">
        <Link to={`/loja/${storeInfo?.slug || ''}`} className="hover:text-primary transition-colors">Início</Link>
        <span>/</span>
        <Link to={`/loja/${storeInfo?.slug || ''}/produtos`} className="hover:text-primary transition-colors">Produtos</Link>
        <span>/</span>
        <span className="text-primary font-bold truncate max-w-[160px]">{produto.nome}</span>
      </nav>

      {/* ── Main Product Layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">

        {/* ── Left: Image Gallery ──────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-light rounded-sm">
            {images.length > 0 ? (
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={produto.nome}
                className="w-full h-full object-cover object-center transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-medium font-mono text-xs">
                Sem imagem
              </div>
            )}

            {/* Destaque badge */}
            {produto.destaque && (
              <Badge variant="yellow" className="absolute top-4 left-4 text-[9px] px-2 py-1 font-mono font-bold tracking-wider rounded-none">
                ✦ DESTAQUE
              </Badge>
            )}

            {/* Navigation arrows (for future multi-image support) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => Math.max(0, prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer rounded-full shadow"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => Math.min(images.length - 1, prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer rounded-full shadow"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-20 overflow-hidden rounded-sm border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-medium/40'
                  }`}
                >
                  <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Product Info ──────────────────────────────────────────── */}
        <div className="flex flex-col space-y-6">

          {/* Category tag + share */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-secondary uppercase">
              // {category}
            </span>
            <button
              onClick={handleShare}
              title="Copiar link do produto"
              className="flex items-center gap-1.5 font-mono text-[9px] text-gray-medium hover:text-primary transition-colors uppercase tracking-widest cursor-pointer"
            >
              <Share2 size={13} />
              {copied ? 'Link copiado!' : 'Compartilhar'}
            </button>
          </div>

          {/* Name */}
          <h1 className="font-sans text-2xl sm:text-3xl xl:text-4xl font-black text-primary uppercase tracking-tight leading-tight">
            {produto.nome}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-3xl font-bold text-primary">
              R$ {produto.preco.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="w-full h-px bg-gray-light" />

          {/* Description */}
          {produto.descricao && (
            <div>
              <p className="font-sans text-sm text-gray-medium leading-relaxed">
                {produto.descricao}
              </p>
            </div>
          )}

          <div className="w-full h-px bg-gray-light" />

          {/* Size Selector */}
          {produto.estoque.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                    Selecione o Tamanho
                  </h3>
                  {selectedSize && stockForSelected !== null && (
                    <span className={`font-mono text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                      stockForSelected <= 3
                        ? 'bg-red-50 text-red-500 border border-red-100'
                        : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {stockForSelected <= 3 ? `Apenas ${stockForSelected} unid.` : `${stockForSelected} disponíveis`}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {produto.estoque.map((item) => {
                    const isSelected = selectedSize === item.tamanho;
                    const outOfStock = item.quantidade === 0;
                    return (
                      <button
                        key={item.tamanho}
                        disabled={outOfStock}
                        onClick={() => setSelectedSize(isSelected ? null : item.tamanho)}
                        className={`min-w-[48px] h-11 px-3 border font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                          outOfStock
                            ? 'bg-gray-light/50 border-gray-light text-gray-medium line-through cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-primary border-primary text-white shadow-md scale-[1.04]'
                            : 'bg-white border-gray-light text-primary hover:border-primary hover:bg-gray-light/30'
                        }`}
                      >
                        {item.tamanho}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              {selectedSize && stockForSelected !== null && stockForSelected > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                    Quantidade
                  </h3>
                  <div className="flex items-center border border-gray-light rounded-sm overflow-hidden w-28">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-9 h-9 flex items-center justify-center text-gray-medium hover:bg-gray-light hover:text-primary transition-all cursor-pointer font-mono font-bold text-sm"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-mono text-xs font-bold text-primary">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(stockForSelected || 1, prev + 1))}
                      disabled={quantity >= (stockForSelected || 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-medium hover:bg-gray-light hover:text-primary transition-all cursor-pointer font-mono font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 px-4 bg-red-50 border border-red-100 rounded-sm">
              <p className="font-mono text-[10px] text-red-500 uppercase font-bold tracking-wider">
                ⚠ Produto temporariamente indisponível
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full py-4 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                !selectedSize
                  ? 'bg-gray-light text-gray-medium cursor-not-allowed'
                  : 'bg-primary hover:bg-secondary text-white hover:text-primary cursor-pointer active:scale-[0.99] shadow-md font-bold'
              }`}
            >
              Adicionar ao Carrinho
            </button>

            <a
              href={`https://wa.me/${storeWhatsapp ? storeWhatsapp.replace(/\D/g, '') : '5511999999999'}?text=${encodeURIComponent(
                `Olá! Tenho interesse no produto: *${produto.nome}*${selectedSize ? ` - Tamanho: *${selectedSize}*${quantity > 1 ? ` | Qtd: *${quantity}*` : ''}` : ''}\n\nVeja aqui: ${window.location.href}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2.5 py-4 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                !selectedSize && produto.estoque.length > 0
                  ? 'bg-gray-light text-gray-medium cursor-not-allowed pointer-events-none'
                  : 'bg-[#25D366] hover:bg-[#1ebe5d] text-white cursor-pointer active:scale-[0.99]'
              }`}
              onClick={(e) => {
                if (!selectedSize && produto.estoque.length > 0) e.preventDefault();
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {!selectedSize && produto.estoque.length > 0
                ? 'Selecione um tamanho'
                : 'Solicitar via WhatsApp'}
            </a>

            <Link
              to="/produtos"
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-light hover:border-primary text-gray-medium hover:text-primary font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200"
            >
              <ArrowLeft size={13} />
              Continuar Navegando
            </Link>
          </div>

          {/* Stock & Info Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-light">
            <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${
              totalStock === 0
                ? 'bg-red-50 border-red-100 text-red-500'
                : totalStock <= 5
                ? 'bg-yellow-50 border-yellow-100 text-yellow-600'
                : 'bg-green-50 border-green-100 text-green-600'
            }`}>
              {totalStock === 0 ? '⊘ Sem Estoque' : totalStock <= 5 ? `⚠ Últimas ${totalStock} peças` : '✓ Em Estoque'}
            </span>
            <span className="font-mono text-[9px] text-gray-medium uppercase tracking-wider">
              Cod: <span className="text-primary font-bold">{produto.id.slice(0, 8).toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Complete the Look ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-24 border-t border-gray-light pt-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-secondary uppercase block mb-2">
                // VOCÊ TAMBÉM PODE GOSTAR
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
                Complete o Look
              </h2>
            </div>
            <Link
              to="/produtos"
              className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] font-bold text-gray-medium hover:text-primary uppercase tracking-widest transition-colors"
            >
              Ver todos
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((rel) => (
              <RelatedCard key={rel.id} produto={rel} baseRoute={`/loja/${storeInfo?.slug || ''}`} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

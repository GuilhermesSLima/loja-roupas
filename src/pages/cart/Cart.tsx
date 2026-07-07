import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Cart: React.FC = () => {
  const { items, totalItems, removeItem, updateQuantity, clearCart } = useCart();
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [storeWhatsapp, setStoreWhatsapp] = useState('');

  // Fetch store configs for whatsapp number
  useEffect(() => {
    const fetchLojaInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('loja')
          .select('whatsapp')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setStoreWhatsapp(data[0].whatsapp || '');
        }
      } catch (err) {
        console.error('Erro ao buscar whatsapp da loja no carrinho:', err);
      }
    };
    fetchLojaInfo();
  }, []);

  // ── Calculations ─────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  // ── WhatsApp Checkout ────────────────────────────────────────────────────
  const handleCheckout = () => {
    if (items.length === 0) return;

    const lines = items
      .map(
        (i) =>
          `• *${i.nome}* — Tam: ${i.tamanho} | Qtd: ${i.quantidade} | ${formatBRL(i.preco * i.quantidade)}`
      )
      .join('\n');

    const message = `Olá! Gostaria de finalizar meu pedido:\n\n${lines}\n\n*Total: ${formatBRL(subtotal)}*`;

    const cleanNum = storeWhatsapp ? cleanNumber(storeWhatsapp) : '5511999999999';

    window.open(
      `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
    setWhatsappSent(true);
  };

  // ── Empty State ───────────────────────────────────────────────────────────
  if (totalItems === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow flex flex-col items-center justify-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-light flex items-center justify-center">
          <ShoppingBag size={32} className="text-gray-medium" />
        </div>
        <div>
          <h1 className="font-sans text-2xl font-black text-primary uppercase tracking-tight">
            Seu carrinho está vazio
          </h1>
          <p className="font-sans text-sm text-gray-medium mt-2">
            Adicione produtos para continuar.
          </p>
        </div>
        <Link
          to="/produtos"
          className="mt-2 bg-primary hover:bg-secondary text-white hover:text-primary font-mono text-[10px] font-bold tracking-widest uppercase py-3.5 px-10 transition-all duration-300"
        >
          Explorar Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex-grow">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-secondary uppercase block mb-2">
          // MINHA SELEÇÃO
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">
          Carrinho de Compras
        </h1>
        <p className="font-sans text-sm text-gray-medium mt-1">
          Você tem <span className="font-bold text-primary">{totalItems}</span> {totalItems === 1 ? 'item' : 'itens'} no carrinho.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Items List ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.tamanho}`}
              className="flex gap-4 sm:gap-6 bg-white border border-gray-light p-4 sm:p-6 rounded-sm hover:shadow-sm transition-shadow duration-200"
            >
              {/* Image */}
              <Link to={`/produtos/${item.id}`} className="flex-shrink-0">
                <div className="w-20 h-24 sm:w-24 sm:h-28 overflow-hidden bg-gray-light rounded-sm">
                  <img
                    src={item.imagem || 'https://placehold.co/96x112/f5f5f5/999?text=Sem+foto'}
                    alt={item.nome}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-grow min-w-0 gap-1">
                <Link
                  to={`/produtos/${item.id}`}
                  className="font-sans text-sm sm:text-base font-bold text-primary uppercase tracking-tight hover:text-secondary transition-colors truncate"
                >
                  {item.nome}
                </Link>
                <span className="font-mono text-[10px] text-gray-medium uppercase tracking-widest">
                  Tamanho: <span className="font-bold text-primary">{item.tamanho}</span>
                </span>
                <span className="font-mono text-xs font-bold text-primary mt-0.5">
                  {formatBRL(item.preco)} / unid.
                </span>

                {/* Quantity + Remove (mobile: stacked) */}
                <div className="flex items-center justify-between mt-auto pt-3 flex-wrap gap-3">
                  {/* Quantity control */}
                  <div className="flex items-center border border-gray-light rounded-sm overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.tamanho, -1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-medium hover:bg-gray-light hover:text-primary transition-all cursor-pointer font-mono font-bold text-sm"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-mono text-xs font-bold text-primary">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.tamanho, +1)}
                      disabled={item.quantidade >= item.estoqueDisponivel}
                      className="w-8 h-8 flex items-center justify-center text-gray-medium hover:bg-gray-light hover:text-primary transition-all cursor-pointer font-mono font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="font-mono text-sm font-bold text-primary">
                    {formatBRL(item.preco * item.quantidade)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id, item.tamanho)}
                    className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-gray-medium hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={11} />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Clear cart */}
          <div className="flex justify-end pt-2">
            <button
              onClick={clearCart}
              className="font-mono text-[9px] font-bold uppercase tracking-widest text-gray-medium hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={10} />
              Limpar carrinho
            </button>
          </div>

          {/* Keep shopping */}
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-bold text-gray-medium hover:text-primary uppercase tracking-widest transition-colors mt-2"
          >
            <ArrowLeft size={12} />
            Continuar Comprando
          </Link>
        </div>

        {/* ── Summary Panel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-light rounded-sm p-6 sm:p-8 sticky top-28 space-y-6">
            <h2 className="font-sans text-xl font-black text-primary uppercase tracking-tight border-b border-gray-light pb-4">
              Resumo do Pedido
            </h2>

            {/* Lines */}
            <div className="space-y-3 font-mono text-xs">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.tamanho}-sum`}
                  className="flex justify-between items-start gap-2"
                >
                  <span className="text-gray-medium leading-snug flex-1">
                    {item.nome}{' '}
                    <span className="text-primary font-bold">×{item.quantidade}</span>
                    <br />
                    <span className="text-[9px] uppercase tracking-wider">Tam: {item.tamanho}</span>
                  </span>
                  <span className="font-bold text-primary whitespace-nowrap">
                    {formatBRL(item.preco * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-light pt-4 space-y-2">
              <div className="flex justify-between font-mono text-xs text-gray-medium">
                <span>Subtotal</span>
                <span className="text-primary font-bold">{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-gray-medium">
                <span>Frete</span>
                <span>A combinar</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t border-gray-light pt-4">
              <span className="font-sans text-sm font-bold text-primary uppercase tracking-tight">Total</span>
              <span className="font-mono text-xl font-black text-primary">{formatBRL(subtotal)}</span>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-mono text-[10px] font-bold tracking-widest uppercase py-4 transition-all duration-300 cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Finalizar via WhatsApp
            </button>

            {whatsappSent && (
              <p className="text-center font-mono text-[9px] text-green-600 uppercase tracking-wider animate-pulse">
                ✓ Mensagem enviada ao WhatsApp!
              </p>
            )}

            {/* Guarantees */}
            <div className="space-y-3 border-t border-gray-light pt-4">
              <div className="flex items-start gap-3 font-mono text-[9px] text-gray-medium uppercase tracking-wider">
                <span className="text-primary mt-0.5">✓</span>
                <span>Atendimento personalizado via WhatsApp</span>
              </div>
              <div className="flex items-start gap-3 font-mono text-[9px] text-gray-medium uppercase tracking-wider">
                <span className="text-primary mt-0.5">✓</span>
                <span>Confirmação imediata do pedido</span>
              </div>
              <Link
                to="/contato"
                className="flex items-center gap-1 font-mono text-[9px] text-secondary hover:text-primary transition-colors uppercase tracking-wider"
              >
                Ver todos os canais de contato <ChevronRight size={10} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

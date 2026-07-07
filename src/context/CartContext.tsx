import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;          // produto id
  nome: string;
  preco: number;
  imagem: string;
  tamanho: string;
  quantidade: number;
  estoqueDisponivel: number; // max qty available
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  addItem: (item: Omit<CartItem, 'quantidade'> & { quantidade?: number }) => void;
  removeItem: (id: string, tamanho: string) => void;
  updateQuantity: (id: string, tamanho: string, delta: number) => void;
  clearCart: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (incoming: Omit<CartItem, 'quantidade'> & { quantidade?: number }) => {
      const qty = incoming.quantidade ?? 1;
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.id === incoming.id && i.tamanho === incoming.tamanho
        );
        if (existing) {
          return prev.map((i) =>
            i.id === incoming.id && i.tamanho === incoming.tamanho
              ? {
                  ...i,
                  quantidade: Math.min(
                    i.quantidade + qty,
                    i.estoqueDisponivel
                  ),
                }
              : i
          );
        }
        return [...prev, { ...incoming, quantidade: qty }];
      });
    },
    []
  );

  const removeItem = useCallback((id: string, tamanho: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.tamanho === tamanho)));
  }, []);

  const updateQuantity = useCallback(
    (id: string, tamanho: string, delta: number) => {
      setItems((prev) =>
        prev
          .map((i) => {
            if (i.id === id && i.tamanho === tamanho) {
              const next = Math.max(0, Math.min(i.quantidade + delta, i.estoqueDisponivel));
              return { ...i, quantidade: next };
            }
            return i;
          })
          .filter((i) => i.quantidade > 0)
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, totalItems, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export interface StoreInfo {
  id: string;
  nome: string;
  slug: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  endereco: string;
  logo: string | null;
  banner: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  cor_bg: string;
  plano?: string;
  ativo?: boolean;
}

interface StoreContextType {
  lojaId: string | null;
  storeInfo: StoreInfo | null;
  loading: boolean;
  error: string | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      if (!storeSlug) {
        setLoading(false);
        setError('Slug da loja não fornecido.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('loja')
          .select('*')
          .eq('slug', storeSlug.toLowerCase())
          .limit(1);

        if (err) throw err;

        if (data && data.length > 0) {
          const store = data[0] as StoreInfo;
          
          if (store.ativo === false) {
            setError('Esta loja está temporariamente desativada.');
            setStoreInfo(null);
            return;
          }

          setStoreInfo(store);

          // Inject custom colors dynamically into document root
          const root = document.documentElement;
          root.style.setProperty('--store-primary', store.cor_primaria || '#111111');
          root.style.setProperty('--store-secondary', store.cor_secundaria || '#F5C518');
          root.style.setProperty('--store-bg', store.cor_bg || '#FFFFFF');
        } else {
          setError('Loja não encontrada.');
          setStoreInfo(null);
        }
      } catch (e: any) {
        console.error('Erro ao carregar configurações da loja:', e);
        setError('Erro ao conectar com o servidor da loja.');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeSlug]);

  // Clean style properties when unmounting provider
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--store-primary');
      root.style.removeProperty('--store-secondary');
      root.style.removeProperty('--store-bg');
    };
  }, []);

  const value = {
    lojaId: storeInfo?.id || null,
    storeInfo,
    loading,
    error,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-light border-t-primary rounded-full animate-spin"></div>
          <p className="font-mono text-xs uppercase tracking-widest text-gray-medium">
            Carregando loja...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-light px-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-xl border border-gray-light shadow-sm space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold">!</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-primary font-sans">Ops! Ocorreu um problema</h1>
            <p className="text-gray-medium text-sm leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
};

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  ArrowLeft,
  ImagePlus,
  X,
  Menu,
  CheckCircle,
  AlertCircle,
  Trash2,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadToCloudinary, deleteFromCloudinary } from '../../lib/cloudinary';

// ─── Constants ────────────────────────────────────────────────────────────────
const AVAILABLE_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface EstoqueEntry {
  tamanho: string;
  quantidade: number;
}

// ─── Shared Sidebar ───────────────────────────────────────────────────────────
const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void; activeTab: string }> = ({ isOpen, onClose, activeTab }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-light bg-white
      flex flex-col justify-between p-6
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="space-y-8">
        {/* Brand */}
        <div>
          <div className="flex flex-col items-start gap-2">
            <img src="/logo-black.png" alt="Canhoto Surf" className="h-10 w-auto object-contain" />
            <span className="font-mono text-[9px] text-gray-medium uppercase tracking-wider">Painel Administrativo</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <Link
            to="/admin?tab=dashboard"
            onClick={onClose}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-gray-light text-primary border-l-4 border-secondary'
                : 'text-gray-medium hover:bg-gray-light/50 hover:text-primary border-l-4 border-transparent'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Painel</span>
          </Link>

          <Link
            to="/admin?tab=estoque"
            onClick={onClose}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'estoque'
                ? 'bg-gray-light text-primary border-l-4 border-secondary'
                : 'text-gray-medium hover:bg-gray-light/50 hover:text-primary border-l-4 border-transparent'
            }`}
          >
            <Package size={16} />
            <span>Controle de Estoque</span>
          </Link>

          <Link
            to="/admin?tab=configuracoes"
            onClick={onClose}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'configuracoes'
                ? 'bg-gray-light text-primary border-l-4 border-secondary'
                : 'text-gray-medium hover:bg-gray-light/50 hover:text-primary border-l-4 border-transparent'
            }`}
          >
            <Settings size={16} />
            <span>Configurações</span>
          </Link>
        </nav>
      </div>

      {/* Bottom: profile + logout */}
      <div className="space-y-4 pt-6 border-t border-gray-light">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-primary text-xs">
            AP
          </div>
          <div>
            <p className="text-xs font-bold text-primary font-mono uppercase tracking-wide">
              Perfil Admin
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              <span className="text-[9px] text-gray-medium font-mono uppercase">Ativo Agora</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 py-2 text-xs font-mono font-bold uppercase tracking-widest text-gray-medium hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}> = ({ checked, onChange, label, description, icon }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-full flex items-center justify-between p-4 border rounded-sm transition-all duration-200 cursor-pointer ${
      checked
        ? 'border-primary bg-primary/5'
        : 'border-gray-light bg-white hover:border-gray-medium'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`transition-colors ${checked ? 'text-primary' : 'text-gray-medium'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`font-mono text-xs font-bold uppercase tracking-wide ${checked ? 'text-primary' : 'text-gray-medium'}`}>
          {label}
        </p>
        {description && (
          <p className="font-mono text-[9px] text-gray-medium mt-0.5">{description}</p>
        )}
      </div>
    </div>
    {/* Switch track */}
    <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-gray-light'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const fromTab = location.state?.from || 'dashboard';

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state (matches `produtos` table) ─────────────────────────────────
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [destaque, setDestaque] = useState(false);
  const [ativo, setAtivo] = useState(true);

  // ── Estoque state (matches `estoque` table: produto_id, tamanho, quantidade)
  const [estoqueEntries, setEstoqueEntries] = useState<EstoqueEntry[]>([]);

  // ── Image state ────────────────────────────────────────────────────────────
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Load Product Data for Editing ─────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
      try {
        const { data: prodData, error: prodError } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', id)
          .single();

        if (prodError) throw prodError;

        if (prodData) {
          setNome(prodData.nome || '');
          setDescricao(prodData.descricao || '');
          setPreco(prodData.preco?.toString() || '');
          setDestaque(!!prodData.destaque);
          setAtivo(!!prodData.ativo);
          if (prodData.imagem) {
            setPreviewUrl(prodData.imagem);
            setOriginalImageUrl(prodData.imagem);
          }
        }

        const { data: estData, error: estError } = await supabase
          .from('estoque')
          .select('tamanho, quantidade')
          .eq('produto_id', id);

        if (estError) throw estError;

        if (estData) {
          setEstoqueEntries(
            estData.map((item) => ({
              tamanho: item.tamanho,
              quantidade: item.quantidade,
            }))
          );
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados do produto:', err);
        setToast({ type: 'error', message: 'Erro ao carregar dados do produto para edição.' });
      }
    };

    fetchProductData();
  }, [id]);

  // ── Estoque helpers ───────────────────────────────────────────────────────
  const addTamanho = (tamanho: string) => {
    if (estoqueEntries.find((e) => e.tamanho === tamanho)) return;
    setEstoqueEntries((prev) => [...prev, { tamanho, quantidade: 0 }]);
  };

  const updateQuantidade = (tamanho: string, quantidade: number) => {
    setEstoqueEntries((prev) =>
      prev.map((e) => (e.tamanho === tamanho ? { ...e, quantidade: Math.max(0, quantidade) } : e))
    );
  };

  const removeTamanho = (tamanho: string) => {
    setEstoqueEntries((prev) => prev.filter((e) => e.tamanho !== tamanho));
  };

  // ── Image helpers ─────────────────────────────────────────────────────────
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      setToast({ type: 'error', message: 'O nome do produto é obrigatório.' });
      return;
    }

    setSaving(true);
    setToast(null);

    try {
      // 1. Upload/Replace image (optional)
      let imagemUrl: string | null = previewUrl; // Mantém a imagem atual por padrão
      if (imageFile) {
        // Se já existia uma imagem antiga cadastrada, exclui ela do Cloudinary
        if (originalImageUrl) {
          try {
            await deleteFromCloudinary(originalImageUrl);
          } catch (delErr) {
            console.error('Erro ao deletar imagem antiga do Cloudinary:', delErr);
          }
        }
        // Faz o upload da nova imagem
        imagemUrl = await uploadToCloudinary(imageFile);
      }

      if (id) {
        // 2. Update `produtos`
        const { error: produtoError } = await supabase
          .from('produtos')
          .update({
            nome: nome.trim(),
            descricao: descricao.trim() || null,
            preco: parseFloat(preco) || 0,
            imagem: imagemUrl,
            destaque,
            ativo,
          })
          .eq('id', id);

        if (produtoError) throw produtoError;

        // 3. Update `estoque`: Delete existing and insert new
        const { error: deleteEstoqueError } = await supabase
          .from('estoque')
          .delete()
          .eq('produto_id', id);

        if (deleteEstoqueError) throw deleteEstoqueError;

        if (estoqueEntries.length > 0) {
          const rows = estoqueEntries.map((entry) => ({
            produto_id: id,
            tamanho: entry.tamanho,
            quantidade: entry.quantidade,
          }));

          const { error: estoqueError } = await supabase.from('estoque').insert(rows);
          if (estoqueError) throw estoqueError;
        }

        setToast({ type: 'success', message: 'Produto atualizado com sucesso!' });
      } else {
        // 2. Insert into `produtos`
        const { data: produto, error: produtoError } = await supabase
          .from('produtos')
          .insert({
            nome: nome.trim(),
            descricao: descricao.trim() || null,
            preco: parseFloat(preco) || 0,
            imagem: imagemUrl,
            destaque,
            ativo,
          })
          .select('id')
          .single();

        if (produtoError) throw produtoError;

        // 3. Insert each tamanho into `estoque`
        if (estoqueEntries.length > 0 && produto?.id) {
          const rows = estoqueEntries.map((entry) => ({
            produto_id: produto.id,
            tamanho: entry.tamanho,
            quantidade: entry.quantidade,
          }));

          const { error: estoqueError } = await supabase.from('estoque').insert(rows);
          if (estoqueError) throw estoqueError;
        }

        setToast({ type: 'success', message: 'Produto cadastrado com sucesso!' });
      }

      setTimeout(() => navigate(`/admin?tab=${fromTab}`), 1600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar produto.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const totalEstoque = estoqueEntries.reduce((s, e) => s + e.quantidade, 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-gray-light/20 font-sans relative">

      {/* Mobile toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md shadow-md cursor-pointer"
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeTab={fromTab} />

      {/* ── MAIN ── */}
      <main className="flex-grow flex flex-col overflow-y-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-light px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin?tab=${fromTab}`)}
              className="text-gray-medium hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-sans text-lg sm:text-xl font-bold text-primary tracking-tight">
              {id ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin?tab=${fromTab}`)}
              className="hidden sm:block px-4 py-2.5 border border-gray-light text-[10px] font-mono font-bold uppercase tracking-widest text-gray-medium hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              {id ? 'Cancelar' : 'Descartar Rascunho'}
            </button>
            <button
              type="submit"
              form="add-product-form"
              disabled={saving}
              className="px-5 py-2.5 bg-secondary hover:bg-primary text-primary hover:text-white text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Salvando...
                </>
              ) : id ? 'Atualizar Produto' : 'Salvar Produto'}
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-6 sm:mx-8 mt-4 flex items-center gap-3 px-4 py-3 border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {toast.message}
          </div>
        )}

        {/* Form grid */}
        <form
          id="add-product-form"
          onSubmit={handleSave}
          className="flex-grow grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 p-6 sm:p-8"
        >
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* General Information */}
            <section className="bg-white border border-gray-light rounded-sm p-6 sm:p-8 shadow-sm">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-medium mb-6">
                Informações Gerais
              </p>

              <div className="space-y-5">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label htmlFor="prod-nome" className="block font-sans text-sm font-semibold text-primary">
                    Nome do Produto
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="prod-nome"
                    type="text"
                    required
                    placeholder="Ex: Casaco Sobretudo de Lã Cashmere"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-gray-light/60 border border-transparent focus:border-primary focus:bg-white focus:outline-none px-4 py-3 font-sans text-sm text-primary placeholder:text-gray-medium/50 transition-all rounded-sm"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <label htmlFor="prod-desc" className="block font-sans text-sm font-semibold text-primary">
                    Descrição
                  </label>
                  <textarea
                    id="prod-desc"
                    rows={4}
                    placeholder="Descreva o material, caimento e detalhes de estilo..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full bg-gray-light/60 border border-transparent focus:border-primary focus:bg-white focus:outline-none px-4 py-3 font-sans text-sm text-primary placeholder:text-gray-medium/50 transition-all rounded-sm resize-y"
                  />
                </div>

                {/* Preço */}
                <div className="space-y-1.5">
                  <label htmlFor="prod-preco" className="block font-sans text-sm font-semibold text-primary">
                    Preço (BRL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-gray-medium font-bold pointer-events-none">
                      R$
                    </span>
                    <input
                      id="prod-preco"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      className="w-full bg-gray-light/60 border border-transparent focus:border-primary focus:bg-white focus:outline-none pl-10 pr-4 py-3 font-mono text-sm text-primary placeholder:text-gray-medium/50 transition-all rounded-sm"
                    />
                  </div>
                </div>

                {/* Destaque + Ativo toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Toggle
                    checked={destaque}
                    onChange={setDestaque}
                    label="Destaque"
                    description="Exibir na vitrine principal"
                    icon={<Star size={16} />}
                  />
                  <Toggle
                    checked={ativo}
                    onChange={setAtivo}
                    label="Ativo"
                    description="Visível para clientes"
                    icon={ativo ? <Eye size={16} /> : <EyeOff size={16} />}
                  />
                </div>
              </div>
            </section>

            {/* Estoque e Variantes */}
            <section className="bg-white border border-gray-light rounded-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-medium">
                  Estoque e Variantes
                </p>
                {estoqueEntries.length > 0 && (
                  <span className="font-mono text-[10px] text-primary font-bold">
                    Total: {totalEstoque} unidades
                  </span>
                )}
              </div>
              <p className="font-mono text-[9px] text-gray-medium uppercase mb-5">
                Cada tamanho gera uma entrada na tabela <span className="text-primary font-bold">estoque</span>
              </p>

              {/* Size selector buttons */}
              <div className="space-y-3">
                <p className="font-sans text-sm font-semibold text-primary">Tamanhos Disponíveis</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((size) => {
                    const isAdded = estoqueEntries.some((e) => e.tamanho === size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addTamanho(size)}
                        disabled={isAdded}
                        className={`px-4 py-2.5 font-mono text-xs font-bold uppercase border transition-all duration-200 cursor-pointer disabled:cursor-default ${
                          isAdded
                            ? 'bg-primary text-white border-primary opacity-70'
                            : 'bg-white text-primary border-gray-light hover:border-primary hover:bg-gray-light/30'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estoque entries table */}
              {estoqueEntries.length > 0 && (
                <div className="mt-5 border border-gray-light rounded-sm overflow-hidden">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-gray-light/40 border-b border-gray-light">
                        <th className="px-4 py-2.5 text-[10px] text-gray-medium uppercase tracking-wider font-bold">
                          Tamanho
                        </th>
                        <th className="px-4 py-2.5 text-[10px] text-gray-medium uppercase tracking-wider font-bold">
                          Quantidade
                        </th>
                        <th className="px-4 py-2.5 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-light">
                      {estoqueEntries.map((entry) => (
                        <tr key={entry.tamanho} className="bg-white hover:bg-gray-light/20 transition-colors">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center justify-center w-10 h-7 bg-primary text-white font-bold text-[10px] rounded-sm">
                              {entry.tamanho}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={entry.quantidade}
                              onChange={(e) => updateQuantidade(entry.tamanho, parseInt(e.target.value) || 0)}
                              className="w-24 bg-gray-light/60 border border-transparent focus:border-primary focus:bg-white focus:outline-none px-3 py-1.5 font-mono text-sm text-primary transition-all rounded-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeTamanho(entry.tamanho)}
                              className="text-gray-medium hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {estoqueEntries.length === 0 && (
                <p className="mt-4 font-mono text-[10px] text-gray-medium uppercase text-center py-4 border border-dashed border-gray-light rounded-sm">
                  Clique nos tamanhos acima para adicionar ao estoque
                </p>
              )}
            </section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">

            {/* Mídia do Produto */}
            <section className="bg-white border border-gray-light rounded-sm p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-medium">
                  Mídia do Produto
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary underline underline-offset-2 cursor-pointer hover:text-secondary transition-colors"
                >
                  Upload em Lote
                </button>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`w-full aspect-[3/4] border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 overflow-hidden ${
                  isDragging
                    ? 'border-secondary bg-secondary/5'
                    : 'border-gray-light hover:border-gray-medium bg-gray-light/20'
                }`}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-sm bg-gray-light flex items-center justify-center text-gray-medium">
                      <ImagePlus size={24} />
                    </div>
                    <div className="text-center px-4">
                      <p className="font-mono text-[11px] font-bold text-primary uppercase">
                        Arraste as imagens do produto aqui
                      </p>
                      <p className="font-mono text-[9px] text-gray-medium mt-1 leading-relaxed">
                        Recomendado: 1280 × 1600px (Proporção 3:4)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {previewUrl && (
                <button
                  type="button"
                  onClick={() => { setPreviewUrl(null); setImageFile(null); }}
                  className="mt-2 w-full flex items-center justify-center gap-2 font-mono text-[10px] text-gray-medium hover:text-red-500 uppercase tracking-wider transition-colors cursor-pointer py-1"
                >
                  <X size={12} /> Remover imagem
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              <p className="mt-3 font-mono text-[9px] text-gray-medium leading-relaxed">
                A URL da imagem será salva no campo <span className="text-primary font-bold">imagem</span> da tabela produtos.
              </p>
            </section>

            {/* Visualização em Tempo Real */}
            <section className="bg-white border border-gray-light rounded-sm p-6 shadow-sm">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-medium mb-4">
                Visualização em Tempo Real
              </p>

              <div className="border border-gray-light rounded-sm overflow-hidden">
                {/* Image */}
                <div className="aspect-[3/4] bg-gray-light/40 relative">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Live preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus size={32} className="text-gray-medium/40" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {destaque && (
                      <span className="bg-secondary text-primary font-mono text-[8px] font-bold px-2 py-0.5 uppercase">
                        Destaque
                      </span>
                    )}
                    {!ativo && (
                      <span className="bg-gray-medium text-white font-mono text-[8px] font-bold px-2 py-0.5 uppercase">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                {/* Info strip */}
                <div className="p-3 space-y-1 border-t border-gray-light">
                  <p className="font-sans text-xs font-bold text-primary uppercase tracking-tight truncate">
                    {nome || 'Nome do Produto'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-gray-medium">
                      {totalEstoque} un. em estoque
                    </span>
                    <span className="font-mono text-[10px] font-bold text-primary">
                      {preco ? `R$ ${parseFloat(preco).toFixed(2)}` : 'R$ 0,00'}
                    </span>
                  </div>
                  {estoqueEntries.length > 0 && (
                    <div className="flex gap-1 flex-wrap pt-1">
                      {estoqueEntries.map((e) => (
                        <span key={e.tamanho} className="px-1.5 py-0.5 bg-gray-light text-[9px] font-mono font-bold rounded-sm">
                          {e.tamanho}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
};

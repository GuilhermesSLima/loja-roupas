import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadImage, deleteImage, extractPublicIdFromUrl } from '../../services/media';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  Settings,
  Plus,
  LogOut,
  TrendingUp,
  Search,
  Shirt,
  AlertTriangle,
  Star,
  Edit3,
  Trash2,
  Menu,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  ImageIcon,
  Trash,
} from 'lucide-react';

// ─── Types (matching Supabase schema) ────────────────────────────────────────
interface EstoqueItem {
  tamanho: string;
  quantidade: number;
}

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem: string | null;
  imagem_public_id: string | null;
  destaque: boolean;
  ativo: boolean;
  created_at: string | null;
  estoque: EstoqueItem[];   // joined from `estoque` table
  totalEstoque: number;     // computed sum
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lojaId: adminLojaId } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'estoque' | 'configuracoes'>(
    (searchParams.get('tab') as 'dashboard' | 'estoque' | 'configuracoes') || 'dashboard'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Store Config States ──
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#111111');
  const [corSecundaria, setCorSecundaria] = useState('#F5C518');
  const [corBg, setCorBg] = useState('#FFFFFF');
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [configToast, setConfigToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Logo & Banner States ──
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadToast, setUploadToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync tab to URL so navigation back restores correct tab
  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setIsSidebarOpen(false);
  };

  // ── Load products and store configurations from Supabase ────────────────────
  const loadProdutos = useCallback(async () => {
    if (!adminLojaId) return;
    setLoading(true);
    try {
      // Fetch products filtered by loja_id (multi-tenant isolation)
      const { data: prodData, error: prodError } = await supabase
        .from('produtos')
        .select('id, nome, descricao, preco, imagem, imagem_public_id, destaque, ativo, created_at')
        .eq('loja_id', adminLojaId)
        .order('created_at', { ascending: false, nullsFirst: false });

      if (prodError) throw prodError;

      // Fetch estoque for this loja's products only
      const prodIds = (prodData || []).map((p) => p.id);
      const estoqueMap: Record<string, EstoqueItem[]> = {};

      if (prodIds.length > 0) {
        const { data: estoqueData, error: estoqueError } = await supabase
          .from('estoque')
          .select('produto_id, tamanho, quantidade')
          .in('produto_id', prodIds);

        if (estoqueError) throw estoqueError;

        (estoqueData || []).forEach((row) => {
          if (!estoqueMap[row.produto_id]) estoqueMap[row.produto_id] = [];
          estoqueMap[row.produto_id].push({ tamanho: row.tamanho, quantidade: row.quantidade });
        });
      }

      // Merge
      const merged: Produto[] = (prodData || []).map((p) => {
        const estoque = estoqueMap[p.id] || [];
        const totalEstoque = estoque.reduce((s, e) => s + e.quantidade, 0);
        return { ...p, estoque, totalEstoque };
      });

      setProdutos(merged);

      // Fetch store configurations filtered by loja_id
      const { data: configData, error: configError } = await supabase
        .from('loja')
        .select('*')
        .eq('id', adminLojaId)
        .limit(1);

      if (configError) throw configError;

      if (configData && configData.length > 0) {
        const c = configData[0];
        setTelefone(c.telefone || '');
        setWhatsapp(c.whatsapp || '');
        setInstagram(c.instagram || '');
        setEmail(c.email || '');
        setEndereco(c.endereco || '');
        setNome(c.nome || '');
        setSlug(c.slug || '');
        setCorPrimaria(c.cor_primaria || '#111111');
        setCorSecundaria(c.cor_secundaria || '#F5C518');
        setCorBg(c.cor_bg || '#FFFFFF');
        setLogoUrl(c.logo || null);
        setBannerUrl(c.banner || null);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos/configurações:', err);
    } finally {
      setLoading(false);
    }
  }, [adminLojaId]);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // ── Delete product ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este produto? Esta ação não pode ser desfeita.')) return;
    setDeletingId(id);
    try {
      const productToDelete = produtos.find((p) => p.id === id);
      
      // 1. Excluir imagens secundárias do Cloudinary e do banco
      const { data: secImages, error: secError } = await supabase
        .from('produto_imagens')
        .select('id, url')
        .eq('produto_id', id);
      
      if (!secError && secImages && secImages.length > 0) {
        for (const img of secImages) {
          const pubId = extractPublicIdFromUrl(img.url);
          if (pubId) {
            try {
              await deleteImage(pubId);
            } catch (mediaErr) {
              console.error(`Erro ao deletar imagem secundária ${pubId} do Cloudinary:`, mediaErr);
            }
          }
        }
        // Exclui os registros de produto_imagens
        await supabase.from('produto_imagens').delete().eq('produto_id', id);
      }

      // 2. Excluir a imagem principal do Cloudinary
      if (productToDelete) {
        const mainPubId = productToDelete.imagem_public_id || (productToDelete.imagem ? extractPublicIdFromUrl(productToDelete.imagem) : null);
        if (mainPubId) {
          try {
            await deleteImage(mainPubId);
          } catch (mediaErr) {
            console.error(`Erro ao deletar imagem principal ${mainPubId} do Cloudinary:`, mediaErr);
          }
        }
      }

      // 3. Delete estoque entries first (FK constraint)
      await supabase.from('estoque').delete().eq('produto_id', id);
      
      // 4. Delete product from database
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Não foi possível remover o produto.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Save store configurations ──────────────────────────────────────────────
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLojaId) return;
    setSalvandoConfig(true);
    setConfigToast(null);

    const payload = {
      nome: nome.trim(),
      slug: slug.trim().toLowerCase(),
      telefone: telefone.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      email: email.trim(),
      endereco: endereco.trim(),
      cor_primaria: corPrimaria,
      cor_secundaria: corSecundaria,
      cor_bg: corBg,
    };

    try {
      // Update the loja record for this tenant directly by id
      const { error: updateErr } = await supabase
        .from('loja')
        .update(payload)
        .eq('id', adminLojaId);

      if (updateErr) throw updateErr;

      setConfigToast({ type: 'success', message: 'Configurações da loja atualizadas com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao salvar configurações da loja:', err);
      setConfigToast({ type: 'error', message: 'Erro ao salvar as configurações da loja.' });
    } finally {
      setSalvandoConfig(false);
    }
  };

  // ── Upload Logo ────────────────────────────────────────────────────────────
  const handleUploadLogo = async () => {
    if (!logoFile || !adminLojaId) return;
    setUploadingLogo(true);
    setUploadToast(null);
    try {
      // Delete old logo from Cloudinary if exists
      if (logoUrl) {
        const oldPubId = extractPublicIdFromUrl(logoUrl);
        if (oldPubId) await deleteImage(oldPubId);
      }
      const result = await uploadImage(logoFile, adminLojaId);
      // Save new logo URL to Supabase
      const { error: updateErr } = await supabase
        .from('loja')
        .update({ logo: result.url })
        .eq('id', adminLojaId);
      if (updateErr) throw updateErr;
      setLogoUrl(result.url);
      setLogoFile(null);
      setLogoPreview(null);
      setUploadToast({ type: 'success', message: 'Logo atualizada com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao fazer upload da logo:', err);
      setUploadToast({ type: 'error', message: 'Erro ao enviar a logo. Tente novamente.' });
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Upload Banner ──────────────────────────────────────────────────────────
  const handleUploadBanner = async () => {
    if (!bannerFile || !adminLojaId) return;
    setUploadingBanner(true);
    setUploadToast(null);
    try {
      // Delete old banner from Cloudinary if exists
      if (bannerUrl) {
        const oldPubId = extractPublicIdFromUrl(bannerUrl);
        if (oldPubId) await deleteImage(oldPubId);
      }
      const result = await uploadImage(bannerFile, adminLojaId);
      const { error: updateErr } = await supabase
        .from('loja')
        .update({ banner: result.url })
        .eq('id', adminLojaId);
      if (updateErr) throw updateErr;
      setBannerUrl(result.url);
      setBannerFile(null);
      setBannerPreview(null);
      setUploadToast({ type: 'success', message: 'Banner atualizado com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao fazer upload do banner:', err);
      setUploadToast({ type: 'error', message: 'Erro ao enviar o banner. Tente novamente.' });
    } finally {
      setUploadingBanner(false);
    }
  };

  // ── Remove Logo ────────────────────────────────────────────────────────────
  const handleRemoveLogo = async () => {
    if (!adminLojaId || !logoUrl) return;
    if (!confirm('Deseja remover a logo atual?')) return;
    try {
      const pubId = extractPublicIdFromUrl(logoUrl);
      if (pubId) await deleteImage(pubId);
      await supabase.from('loja').update({ logo: null }).eq('id', adminLojaId);
      setLogoUrl(null);
      setLogoFile(null);
      setLogoPreview(null);
      setUploadToast({ type: 'success', message: 'Logo removida.' });
    } catch (err) {
      console.error('Erro ao remover logo:', err);
      setUploadToast({ type: 'error', message: 'Erro ao remover a logo.' });
    }
  };

  // ── Remove Banner ──────────────────────────────────────────────────────────
  const handleRemoveBanner = async () => {
    if (!adminLojaId || !bannerUrl) return;
    if (!confirm('Deseja remover o banner atual?')) return;
    try {
      const pubId = extractPublicIdFromUrl(bannerUrl);
      if (pubId) await deleteImage(pubId);
      await supabase.from('loja').update({ banner: null }).eq('id', adminLojaId);
      setBannerUrl(null);
      setBannerFile(null);
      setBannerPreview(null);
      setUploadToast({ type: 'success', message: 'Banner removido.' });
    } catch (err) {
      console.error('Erro ao remover banner:', err);
      setUploadToast({ type: 'error', message: 'Erro ao remover o banner.' });
    }
  };

  // ── KPI metrics ────────────────────────────────────────────────────────────
  const kpi = useMemo(() => ({
    total: produtos.length,
    ativos: produtos.filter((p) => p.ativo).length,
    destaques: produtos.filter((p) => p.destaque).length,
    alertas: produtos.filter((p) => p.totalEstoque <= 5).length,
  }), [produtos]);

  // ── Filtered products for stock view ──────────────────────────────────────
  const produtosFiltrados = useMemo(() =>
    produtos.filter((p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [produtos, searchTerm]
  );

  // ── Weekly performance chart data ──────────────────────────────────────────
  const weeklyPerformance = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const daysMap = [
      { d: 'SEG', count: 0, dayOfWeek: 1 },
      { d: 'TER', count: 0, dayOfWeek: 2 },
      { d: 'QUA', count: 0, dayOfWeek: 3 },
      { d: 'QUI', count: 0, dayOfWeek: 4 },
      { d: 'SEX', count: 0, dayOfWeek: 5 },
      { d: 'SAB', count: 0, dayOfWeek: 6 },
      { d: 'DOM', count: 0, dayOfWeek: 0 },
    ];

    produtos.forEach((p) => {
      if (!p.created_at) return;
      const createdDate = new Date(p.created_at);
      if (createdDate >= startOfWeek && createdDate <= endOfWeek) {
        const pDay = createdDate.getDay();
        const found = daysMap.find((item) => item.dayOfWeek === pDay);
        if (found) {
          found.count += 1;
        }
      }
    });

    const maxCount = Math.max(...daysMap.map((item) => item.count), 1);
    
    return daysMap.map((item) => {
      const h = item.count === 0 ? 8 : (item.count / maxCount) * 120 + 15;
      const isToday = now.getDay() === item.dayOfWeek;
      return {
        ...item,
        h,
        active: isToday,
      };
    });
  }, [produtos]);

  // ── Alerts (low stock) ─────────────────────────────────────────────────────
  const alertasCriticos = useMemo(() =>
    produtos.filter((p) => p.totalEstoque <= 5).slice(0, 4),
    [produtos]
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (iso: string | null) => {
    if (!iso) return 'Sem data';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Sem data';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatPrice = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const statusLabel = (total: number) =>
    total === 0 ? 'SEM ESTOQUE' : total <= 5 ? 'ESTOQUE BAIXO' : 'EM ESTOQUE';

  const statusClass = (total: number) =>
    total === 0
      ? 'bg-red-50 text-red-600'
      : total <= 5
        ? 'bg-yellow-50 text-yellow-600'
        : 'bg-green-50 text-green-600';

  // ── Sidebar nav item ───────────────────────────────────────────────────────
  const NavItem = ({
    tab, icon, label,
  }: { tab: typeof activeTab; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => changeTab(tab)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
        activeTab === tab
          ? 'bg-gray-light text-primary border-l-4 border-secondary'
          : 'text-gray-medium hover:bg-gray-light/50 hover:text-primary border-l-4 border-transparent'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-gray-light/20 font-sans relative">

      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md shadow-md cursor-pointer"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── Mobile overlay ── */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR                                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-light bg-white
        flex flex-col justify-between p-6
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Brand */}
          <div>
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shadow-md">
                  <Shirt className="h-4 w-4 text-primary stroke-[2.5]" />
                </div>
                <span className="font-sans font-extrabold text-base tracking-tight text-primary">
                  sualoj<span className="text-secondary">4</span>
                </span>
              </div>
              <span className="font-mono text-[8px] text-gray-medium uppercase tracking-wider">Painel Administrativo</span>
            </div>
            <div className="flex items-center space-x-3 mt-5 border-b border-gray-light pb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-primary text-sm">
                <Shirt size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary font-mono tracking-wide uppercase">{nome || 'Minha Loja'}</p>
                <span className="text-[10px] text-gray-medium font-mono uppercase">Gerente da Loja</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem tab="dashboard" icon={<LayoutDashboard size={16} />} label="Painel" />
            <NavItem tab="estoque" icon={<Package size={16} />} label="Controle de Estoque" />
            <NavItem tab="configuracoes" icon={<Settings size={16} />} label="Configurações" />
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="space-y-3 pt-6 border-t border-gray-light">
          <button
            onClick={() => navigate('/admin/produtos/novo', { state: { from: activeTab } })}
            className="w-full bg-secondary hover:bg-primary hover:text-white text-primary font-mono text-xs font-bold tracking-widest uppercase py-3.5 flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Novo Produto</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-mono font-bold uppercase tracking-widest text-gray-medium hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <main className="flex-grow p-6 sm:p-8 lg:p-10 overflow-y-auto w-full">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-light pb-6 mb-8 mt-12 lg:mt-0 gap-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-secondary w-5 h-5" />
            <h1 className="font-sans text-sm font-black tracking-widest text-primary uppercase">
              {activeTab === 'dashboard' && 'Visão Geral'}
              {activeTab === 'estoque' && 'Controle de Estoque'}
              {activeTab === 'configuracoes' && 'Configurações'}
            </h1>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw size={24} className="animate-spin text-gray-medium" />
            <p className="font-mono text-[11px] text-gray-medium uppercase tracking-widest">
              Carregando dados...
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PAINEL (DASHBOARD)                                            */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

              <div className="bg-white p-5 sm:p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm">
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] font-bold text-gray-medium uppercase tracking-wider block">Total Produtos</span>
                  <span className="font-sans text-2xl font-black text-primary block leading-none">{kpi.total}</span>
                  <span className="font-mono text-[9px] text-gray-medium uppercase block">cadastrados</span>
                </div>
                <div className="p-2.5 bg-secondary/15 text-primary rounded-sm">
                  <Shirt size={16} />
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm">
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] font-bold text-gray-medium uppercase tracking-wider block">Ativos</span>
                  <span className="font-sans text-2xl font-black text-primary block leading-none">{kpi.ativos}</span>
                  <span className="font-mono text-[9px] text-secondary font-bold uppercase block">visíveis na loja</span>
                </div>
                <div className="p-2.5 bg-green-50 text-green-600 rounded-sm">
                  <Eye size={16} />
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm">
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] font-bold text-gray-medium uppercase tracking-wider block">Destaques</span>
                  <span className="font-sans text-2xl font-black text-primary block leading-none">{kpi.destaques}</span>
                  <span className="font-mono text-[9px] text-gray-medium uppercase block">na vitrine</span>
                </div>
                <div className="p-2.5 bg-secondary/15 text-primary rounded-sm">
                  <Star size={16} />
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm bg-primary">
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider block/70">Alertas Estoque</span>
                  <span className="font-sans text-2xl font-black block leading-none text-red-500">{kpi.alertas}</span>
                  <span className="font-mono text-[9px] uppercase block/60">abaixo do limite</span>
                </div>
                <div className="p-2.5 bg-white/10 rounded-sm">
                  <AlertTriangle size={16} />
                </div>
              </div>
            </div>

            {/* Chart + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Bar chart */}
              <div className="lg:col-span-2 bg-white p-6 border border-gray-light rounded-sm shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-light pb-4 mb-6">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase">Desempenho Semanal</h3>
                    <p className="text-[10px] text-gray-medium font-mono uppercase mt-1">Movimentação de estoque por dia</p>
                  </div>
                  <div className="flex space-x-1 font-mono text-[9px]">
                    <span className="px-2 py-1 bg-primary text-white uppercase rounded-sm font-bold">Semanal</span>
                  </div>
                </div>
                <div className="flex items-end justify-between h-44 px-2 border-b border-gray-light">
                  {weeklyPerformance.map((item) => (
                    <div key={item.d} className="flex flex-col items-center space-y-2 flex-1 relative group">
                      {/* Tooltip no hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none transition-all duration-200">
                        <div className="bg-primary text-white text-[9px] font-bold font-mono px-2.5 py-1 rounded-sm shadow-md whitespace-nowrap">
                          {item.count} {item.count === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                        </div>
                        <div className="w-1.5 h-1.5 bg-primary rotate-45 -mt-1" />
                      </div>

                      {/* Barra do gráfico */}
                      <div
                        className={`w-full max-w-[28px] rounded-sm transition-all duration-200 cursor-default ${
                          item.count > 0
                            ? item.active
                              ? 'bg-secondary hover:brightness-95'
                              : 'bg-primary hover:brightness-110'
                            : item.active
                              ? 'bg-secondary/35'
                              : 'bg-gray-light hover:bg-gray-medium/30'
                        }`}
                        style={{ height: `${item.h}px` }}
                      />
                      <span className={`font-mono text-[9px] ${item.active ? 'font-bold text-primary' : 'text-gray-medium'}`}>
                        {item.d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock alerts card */}
              <div className="bg-white p-6 border border-gray-light rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase border-b border-gray-light pb-4 mb-5">
                    Alertas de Estoque
                  </h3>

                  {alertasCriticos.length === 0 ? (
                    <p className="font-mono text-[10px] text-gray-medium uppercase text-center py-6">
                      Nenhum alerta crítico 🎉
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {alertasCriticos.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-gray-light/30 border border-gray-light rounded-sm">
                          <div className="flex items-center space-x-3">
                            {p.imagem ? (
                              <img src={p.imagem} alt={p.nome} className="w-8 h-8 object-cover rounded-sm" />
                            ) : (
                              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center text-white font-mono font-bold text-xs">
                                {p.nome[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-primary tracking-tight max-w-[110px] truncate">{p.nome}</p>
                              <span className="text-[9px] font-mono text-gray-medium uppercase">
                                {p.totalEstoque} un. restantes
                              </span>
                            </div>
                          </div>
                          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 uppercase rounded-sm ${
                            p.totalEstoque === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {p.totalEstoque === 0 ? 'Esgotado' : 'Baixo'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => changeTab('estoque')}
                  className="w-full border border-primary hover:bg-primary hover:text-white transition-all duration-300 py-3 mt-6 font-mono text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                >
                  Ver Estoque Completo
                </button>
              </div>
            </div>

            {/* Recent registrations */}
            <div className="bg-white border border-gray-light rounded-sm shadow-sm">
              <div className="p-6 border-b border-gray-light flex items-center justify-between">
                <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase">
                  Últimos Produtos Cadastrados
                </h3>
                <button
                  onClick={() => changeTab('estoque')}
                  className="font-mono text-[10px] font-bold text-primary hover:text-secondary uppercase tracking-widest cursor-pointer"
                >
                  Ver Todos
                </button>
              </div>

              {produtos.length === 0 ? (
                <div className="p-12 text-center">
                  <Package size={32} className="text-gray-medium/40 mx-auto mb-3" />
                  <p className="font-mono text-[11px] text-gray-medium uppercase tracking-widest">
                    Nenhum produto cadastrado ainda.
                  </p>
                  <button
                    onClick={() => navigate('/admin/produtos/novo')}
                    className="mt-4 px-6 py-2.5 bg-secondary text-primary font-mono text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-primary hover:text-white transition-all"
                  >
                    + Cadastrar Primeiro Produto
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="bg-gray-light/30 border-b border-gray-light text-gray-medium uppercase tracking-wider text-[10px]">
                        <th className="p-4 pl-6">Produto</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4 text-center">Estoque</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4">Cadastrado em</th>
                        <th className="p-4 text-right pr-6">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-light">
                      {produtos.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-gray-light/20 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              {p.imagem ? (
                                <img src={p.imagem} alt={p.nome} className="w-9 h-9 object-cover rounded-sm border border-gray-light" />
                              ) : (
                                <div className="w-9 h-9 rounded-sm bg-gray-light flex items-center justify-center text-gray-medium font-bold text-xs">
                                  {p.nome[0]?.toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-sans font-bold text-primary uppercase text-[11px]">{p.nome}</p>
                                <div className="flex gap-1 mt-0.5">
                                  {p.destaque && (
                                    <span className="font-mono text-[8px] bg-secondary/20 text-primary px-1.5 py-0.5 font-bold uppercase">Destaque</span>
                                  )}
                                  {!p.ativo && (
                                    <span className="font-mono text-[8px] bg-gray-light text-gray-medium px-1.5 py-0.5 font-bold uppercase">Inativo</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-primary">{formatPrice(p.preco)}</td>
                          <td className="p-4 text-center font-bold">{p.totalEstoque} un.</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-sm ${statusClass(p.totalEstoque)}`}>
                              {statusLabel(p.totalEstoque)}
                            </span>
                          </td>
                          <td className="p-4 text-gray-medium">{formatDate(p.created_at)}</td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex justify-end space-x-3 text-gray-medium">
                              <button
                                onClick={() => navigate(`/admin/produtos/editar/${p.id}`, { state: { from: activeTab } })}
                                className="hover:text-primary cursor-pointer" title="Editar"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                disabled={deletingId === p.id}
                                className="hover:text-red-600 cursor-pointer disabled:opacity-40" title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: CONTROLE DE ESTOQUE                                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {!loading && activeTab === 'estoque' && (
          <div className="bg-white border border-gray-light rounded-sm shadow-sm">
            <div className="p-6 border-b border-gray-light flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-grow min-w-0">
                <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase">
                  Diretório de Produtos
                </h3>
                <p className="text-[10px] text-gray-medium font-mono uppercase mt-1">
                  {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Campo de Busca */}
              <div className="relative w-full md:max-w-xs lg:max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-medium">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar produto por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none pl-9 pr-8 py-2.5 rounded-sm font-mono text-xs text-primary placeholder-gray-medium/70 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-medium hover:text-primary cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={() => navigate('/admin/produtos/novo', { state: { from: activeTab } })}
                className="bg-primary hover:bg-secondary text-white hover:text-primary font-mono text-xs font-bold tracking-widest uppercase px-6 py-3 flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer w-full md:w-auto shrink-0"
              >
                <Plus size={14} />
                <span>Novo Produto</span>
              </button>
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="p-16 text-center">
                <Package size={36} className="text-gray-medium/30 mx-auto mb-4" />
                <p className="font-mono text-[11px] text-gray-medium uppercase tracking-widest mb-1">
                  {searchTerm ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado ainda.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/admin/produtos/novo')}
                    className="mt-4 px-6 py-2.5 bg-secondary text-primary font-mono text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-primary hover:text-white transition-all"
                  >
                    + Cadastrar Primeiro Produto
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="bg-gray-light/30 border-b border-gray-light text-gray-medium uppercase tracking-wider text-[10px]">
                      <th className="p-4 pl-6">Produto</th>
                      <th className="p-4">Preço</th>
                      <th className="p-4">Tamanhos</th>
                      <th className="p-4 text-center">Estoque Total</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Destaque</th>
                      <th className="p-4 text-center">Ativo</th>
                      <th className="p-4 text-right pr-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-light">
                    {produtosFiltrados.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-light/20 transition-colors">
                        {/* Produto */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {p.imagem ? (
                              <img src={p.imagem} alt={p.nome} className="w-10 h-10 object-cover rounded-sm border border-gray-light flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-sm bg-gray-light flex items-center justify-center text-gray-medium font-bold flex-shrink-0">
                                {p.nome[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-sans font-bold text-primary uppercase text-[11px] truncate max-w-[140px]">{p.nome}</p>
                              {p.descricao && (
                                <p className="text-[9px] text-gray-medium truncate max-w-[140px]">{p.descricao}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Preço */}
                        <td className="p-4 font-bold text-primary whitespace-nowrap">
                          {formatPrice(p.preco)}
                        </td>

                        {/* Tamanhos */}
                        <td className="p-4">
                          {p.estoque.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {p.estoque.map((e) => (
                                <span
                                  key={e.tamanho}
                                  title={`${e.quantidade} un.`}
                                  className="px-1.5 py-0.5 bg-gray-light border border-gray-light/70 text-[9px] font-bold rounded-sm cursor-default"
                                >
                                  {e.tamanho}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-medium text-[10px]">—</span>
                          )}
                        </td>

                        {/* Estoque total */}
                        <td className="p-4 text-center font-bold">
                          {p.totalEstoque} un.
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-sm ${statusClass(p.totalEstoque)}`}>
                            {statusLabel(p.totalEstoque)}
                          </span>
                        </td>

                        {/* Destaque */}
                        <td className="p-4 text-center">
                          {p.destaque
                            ? <Star size={14} className="text-secondary mx-auto" fill="currentColor" />
                            : <span className="text-gray-light text-[10px]">—</span>
                          }
                        </td>

                        {/* Ativo */}
                        <td className="p-4 text-center">
                          {p.ativo
                            ? <Eye size={14} className="text-green-500 mx-auto" />
                            : <EyeOff size={14} className="text-gray-medium mx-auto" />
                          }
                        </td>

                        {/* Ações */}
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end space-x-3 text-gray-medium">
                            <button
                              onClick={() => navigate(`/admin/produtos/editar/${p.id}`, { state: { from: activeTab } })}
                              className="hover:text-primary cursor-pointer" title="Editar"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={deletingId === p.id}
                              className="hover:text-red-600 cursor-pointer disabled:opacity-40" title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: CONFIGURAÇÕES                                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {!loading && activeTab === 'configuracoes' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

            {/* ── COLUNA ESQUERDA: Dados da Loja ─────────────────────────── */}
            <div className="bg-white border border-gray-light rounded-sm shadow-sm p-6 sm:p-8">
              <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase border-b border-gray-light pb-4 mb-6">
                Configurações da Loja
              </h3>

              {configToast && (
                <div className={`mb-6 flex items-center gap-3 px-4 py-3 border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide ${
                  configToast.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  <span>{configToast.type === 'success' ? '✓' : '⚠'}</span>
                  {configToast.message}
                </div>
              )}

              <form onSubmit={handleSaveConfig} className="space-y-5 font-mono text-xs text-primary">
                {/* Nome da Loja */}
                <div className="space-y-1.5">
                  <label htmlFor="cfg-nome" className="block text-gray-medium uppercase font-bold">Nome da Loja</label>
                  <input
                    id="cfg-nome"
                    type="text"
                    placeholder="Minha Loja"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none px-4 py-2.5 rounded-sm"
                    required
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label htmlFor="cfg-slug" className="block text-gray-medium uppercase font-bold">Slug de Acesso (URL)</label>
                  <input
                    id="cfg-slug"
                    type="text"
                    placeholder="minha-loja"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none px-4 py-2.5 rounded-sm"
                    required
                  />
                  <p className="text-[10px] text-gray-medium mt-1">
                    Sua loja ficará acessível no endereço: <span className="font-bold text-primary">/loja/{slug || 'minha-loja'}</span>
                  </p>
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label htmlFor="cfg-telefone" className="block text-gray-medium uppercase font-bold">Telefone</label>
                  <input
                    id="cfg-telefone"
                    type="text"
                    placeholder="+55 (11) 90000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none px-4 py-2.5 rounded-sm"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <label htmlFor="cfg-whatsapp" className="block text-gray-medium uppercase font-bold">WhatsApp</label>
                  <input
                    id="cfg-whatsapp"
                    type="text"
                    placeholder="+55 (11) 90000-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none px-4 py-2.5 rounded-sm"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <label htmlFor="cfg-instagram" className="block text-gray-medium uppercase font-bold">Instagram</label>
                  <input
                    id="cfg-instagram"
                    type="text"
                    placeholder="@seu_instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none px-4 py-2.5 rounded-sm"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label htmlFor="cfg-email" className="block text-gray-medium uppercase font-bold">E-mail</label>
                  <input
                    id="cfg-email"
                    type="email"
                    placeholder="contato@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none px-4 py-2.5 rounded-sm"
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-1.5">
                  <label htmlFor="cfg-endereco" className="block text-gray-medium uppercase font-bold">Endereço</label>
                  <textarea
                    id="cfg-endereco"
                    rows={3}
                    placeholder="Rua, Número, Bairro - Cidade, Estado"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full bg-gray-light/40 border border-gray-light focus:border-primary focus:bg-white focus:outline-none px-4 py-2.5 rounded-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvandoConfig}
                  className="w-full bg-primary hover:bg-secondary text-white hover:text-primary font-mono text-[10px] font-bold tracking-widest uppercase py-3.5 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {salvandoConfig ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Salvando Configurações...
                    </>
                  ) : (
                    'Salvar Configurações'
                  )}
                </button>
              </form>
            </div>

            {/* ── COLUNA DIREITA: Cores + Identidade Visual ──────────────── */}
            <div className="flex flex-col gap-6">

              {/* Toast de upload */}
              {uploadToast && (
                <div className={`flex items-center gap-3 px-4 py-3 border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wide ${
                  uploadToast.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  <span>{uploadToast.type === 'success' ? '✓' : '⚠'}</span>
                  {uploadToast.message}
                </div>
              )}

              {/* Paleta de Cores */}
              <div className="bg-white border border-gray-light rounded-sm shadow-sm p-6 sm:p-8">
                <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase border-b border-gray-light pb-4 mb-6">
                  Paleta de Cores da Empresa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono text-xs">
                  {/* Cor Primária */}
                  <div className="space-y-2">
                    <label htmlFor="cfg-cor-primaria" className="block text-gray-medium uppercase font-bold text-[10px]">Cor Primária</label>
                    <div
                      className="w-full h-16 rounded-sm border border-gray-light cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: corPrimaria }}
                      onClick={() => document.getElementById('cfg-cor-primaria')?.click()}
                    >
                      <input
                        id="cfg-cor-primaria"
                        type="color"
                        value={corPrimaria}
                        onChange={(e) => setCorPrimaria(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="w-full bg-gray-light/40 border border-gray-light px-2 py-1.5 text-[10px] rounded-sm font-mono text-center"
                      maxLength={7}
                    />
                  </div>

                  {/* Cor Secundária */}
                  <div className="space-y-2">
                    <label htmlFor="cfg-cor-secundaria" className="block text-gray-medium uppercase font-bold text-[10px]">Cor Secundária</label>
                    <div
                      className="w-full h-16 rounded-sm border border-gray-light cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: corSecundaria }}
                      onClick={() => document.getElementById('cfg-cor-secundaria')?.click()}
                    >
                      <input
                        id="cfg-cor-secundaria"
                        type="color"
                        value={corSecundaria}
                        onChange={(e) => setCorSecundaria(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="w-full bg-gray-light/40 border border-gray-light px-2 py-1.5 text-[10px] rounded-sm font-mono text-center"
                      maxLength={7}
                    />
                  </div>

                  {/* Cor de Fundo */}
                  <div className="space-y-2">
                    <label htmlFor="cfg-cor-bg" className="block text-gray-medium uppercase font-bold text-[10px]">Cor de Fundo</label>
                    <div
                      className="w-full h-16 rounded-sm border border-gray-light cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: corBg }}
                      onClick={() => document.getElementById('cfg-cor-bg')?.click()}
                    >
                      <input
                        id="cfg-cor-bg"
                        type="color"
                        value={corBg}
                        onChange={(e) => setCorBg(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={corBg}
                      onChange={(e) => setCorBg(e.target.value)}
                      className="w-full bg-gray-light/40 border border-gray-light px-2 py-1.5 text-[10px] rounded-sm font-mono text-center"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Prévia das cores */}
                <div className="mt-5 p-4 rounded-sm border border-gray-light space-y-1" style={{ backgroundColor: corBg }}>
                  <p className="text-[9px] font-mono font-bold text-gray-medium uppercase tracking-widest mb-2">Prévia</p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 text-[10px] font-bold font-mono rounded-sm" style={{ backgroundColor: corPrimaria, color: '#fff' }}>Primária</span>
                    <span className="px-3 py-1.5 text-[10px] font-bold font-mono rounded-sm" style={{ backgroundColor: corSecundaria, color: corPrimaria }}>Secundária</span>
                    <span className="text-[10px] font-mono" style={{ color: corPrimaria }}>Texto de exemplo</span>
                  </div>
                </div>
              </div>

              {/* Identidade Visual (Logo + Banner) */}
              <div className="bg-white border border-gray-light rounded-sm shadow-sm p-6 sm:p-8 space-y-6">
                <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase border-b border-gray-light pb-4">
                  Identidade Visual
                </h3>

                {/* Logo */}
                <div className="space-y-3 font-mono text-xs">
                  <p className="text-[10px] font-mono font-bold text-gray-medium uppercase">Logo da Empresa</p>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-sm border border-gray-light bg-gray-light/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={logoPreview || logoUrl || '/sem-imagem.png'}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label
                        htmlFor="upload-logo"
                        className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-light hover:border-primary px-4 py-3 rounded-sm transition-colors text-[10px] font-mono font-bold text-gray-medium hover:text-primary uppercase tracking-wide"
                      >
                        <Upload size={14} />
                        {logoFile ? logoFile.name : 'Escolher imagem de logo'}
                      </label>
                      <input
                        id="upload-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUploadLogo}
                          disabled={!logoFile || uploadingLogo}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white font-mono text-[10px] font-bold uppercase tracking-wide py-2 rounded-sm hover:bg-secondary hover:text-primary transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {uploadingLogo ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Upload size={12} />}
                          Salvar Logo
                        </button>
                        {logoUrl && (
                          <button type="button" onClick={handleRemoveLogo}
                            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-mono text-[10px] font-bold uppercase tracking-wide rounded-sm transition-all cursor-pointer"
                          >
                            <Trash size={12} /> Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div className="space-y-3 font-mono text-xs border-t border-gray-light pt-5">
                  <p className="text-[10px] font-mono font-bold text-gray-medium uppercase">Banner da Página Inicial</p>
                  <div className="w-full h-36 rounded-sm border border-gray-light bg-gray-light/20 overflow-hidden">
                    <img
                      src={bannerPreview || bannerUrl || '/sem-imagem.png'}
                      alt="Banner"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <label
                    htmlFor="upload-banner"
                    className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-light hover:border-primary px-4 py-3 rounded-sm transition-colors text-[10px] font-mono font-bold text-gray-medium hover:text-primary uppercase tracking-wide"
                  >
                    <ImageIcon size={14} />
                    {bannerFile ? bannerFile.name : 'Escolher imagem de banner'}
                  </label>
                  <input
                    id="upload-banner"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setBannerFile(file); setBannerPreview(URL.createObjectURL(file)); }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUploadBanner}
                      disabled={!bannerFile || uploadingBanner}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white font-mono text-[10px] font-bold uppercase tracking-wide py-2 rounded-sm hover:bg-secondary hover:text-primary transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {uploadingBanner ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Upload size={12} />}
                      Salvar Banner
                    </button>
                    {bannerUrl && (
                      <button type="button" onClick={handleRemoveBanner}
                        className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-mono text-[10px] font-bold uppercase tracking-wide rounded-sm transition-all cursor-pointer"
                      >
                        <Trash size={12} /> Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
            {/* ── Fim Coluna Direita ──────────────────────────────────────── */}

          </div>
        )}

      </main>
    </div>
  );
};

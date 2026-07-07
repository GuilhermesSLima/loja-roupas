import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  Package,
  Settings,
  Plus,
  LogOut,
  TrendingUp,
  Search,
  Bell,
  HelpCircle,
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
  destaque: boolean;
  ativo: boolean;
  created_at: string;
  estoque: EstoqueItem[];   // joined from `estoque` table
  totalEstoque: number;     // computed sum
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [configToast, setConfigToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync tab to URL so navigation back restores correct tab
  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setIsSidebarOpen(false);
  };

  // ── Load products and store configurations from Supabase ────────────────────
  const loadProdutos = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: prodData, error: prodError } = await supabase
        .from('produtos')
        .select('id, nome, descricao, preco, imagem, destaque, ativo, created_at')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      // Fetch all estoque entries
      const { data: estoqueData, error: estoqueError } = await supabase
        .from('estoque')
        .select('produto_id, tamanho, quantidade');

      if (estoqueError) throw estoqueError;

      // Group estoque by produto_id
      const estoqueMap: Record<string, EstoqueItem[]> = {};
      (estoqueData || []).forEach((row) => {
        if (!estoqueMap[row.produto_id]) estoqueMap[row.produto_id] = [];
        estoqueMap[row.produto_id].push({ tamanho: row.tamanho, quantidade: row.quantidade });
      });

      // Merge
      const merged: Produto[] = (prodData || []).map((p) => {
        const estoque = estoqueMap[p.id] || [];
        const totalEstoque = estoque.reduce((s, e) => s + e.quantidade, 0);
        return { ...p, estoque, totalEstoque };
      });

      setProdutos(merged);

      // Fetch store configurations from table `loja`
      const { data: configData, error: configError } = await supabase
        .from('loja')
        .select('*')
        .limit(1);

      if (configError) throw configError;

      if (configData && configData.length > 0) {
        const c = configData[0];
        setTelefone(c.telefone || '');
        setWhatsapp(c.whatsapp || '');
        setInstagram(c.instagram || '');
        setEmail(c.email || '');
        setEndereco(c.endereco || '');
      }
    } catch (err) {
      console.error('Erro ao carregar produtos/configurações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // ── Delete product ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este produto? Esta ação não pode ser desfeita.')) return;
    setDeletingId(id);
    try {
      // Delete estoque entries first (FK constraint)
      await supabase.from('estoque').delete().eq('produto_id', id);
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
    setSalvandoConfig(true);
    setConfigToast(null);

    const payload = {
      telefone: telefone.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      email: email.trim(),
      endereco: endereco.trim(),
    };

    try {
      // Fetch existing record
      const { data: existing, error: fetchErr } = await supabase
        .from('loja')
        .select('*')
        .limit(1);

      if (fetchErr) throw fetchErr;

      if (existing && existing.length > 0) {
        // Se a tabela possui id ou outra PK, faz o update
        const firstRecord = existing[0];
        const identifierKey = firstRecord.id ? 'id' : Object.keys(firstRecord)[0];
        const identifierVal = firstRecord[identifierKey];

        const { error: updateErr } = await supabase
          .from('loja')
          .update(payload)
          .eq(identifierKey, identifierVal);

        if (updateErr) throw updateErr;
      } else {
        // Se a tabela estiver vazia, insere o registro
        const { error: insertErr } = await supabase
          .from('loja')
          .insert(payload);

        if (insertErr) throw insertErr;
      }

      setConfigToast({ type: 'success', message: 'Configurações da loja atualizadas com sucesso!' });
    } catch (err: any) {
      console.error('Erro ao salvar configurações da loja:', err);
      setConfigToast({ type: 'error', message: 'Erro ao salvar as configurações da loja.' });
    } finally {
      setSalvandoConfig(false);
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

  // ── Alerts (low stock) ─────────────────────────────────────────────────────
  const alertasCriticos = useMemo(() =>
    produtos.filter((p) => p.totalEstoque <= 5).slice(0, 4),
    [produtos]
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    const d = new Date(iso);
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
            <h2 className="font-sans text-base font-black tracking-widest text-primary uppercase">
              Boutique Admin
            </h2>
            <div className="flex items-center space-x-3 mt-5 border-b border-gray-light pb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-primary text-sm">
                AP
              </div>
              <div>
                <p className="text-xs font-bold text-primary font-mono tracking-wide uppercase">Perfil Admin</p>
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

          <div className="flex items-center space-x-3">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-44 sm:w-52 bg-white border border-gray-light text-xs font-mono px-4 py-2 pr-8 focus:outline-none focus:border-gray-medium"
              />
              <Search className="absolute right-3 w-4 h-4 text-gray-medium" />
            </div>

            <button
              onClick={loadProdutos}
              title="Atualizar"
              className="w-8 h-8 rounded-full border border-gray-light flex items-center justify-center text-primary bg-white cursor-pointer hover:bg-gray-light transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-light flex items-center justify-center text-primary bg-white cursor-pointer hover:bg-gray-light transition-colors">
              <Bell size={13} />
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-light flex items-center justify-center text-primary bg-white cursor-pointer hover:bg-gray-light transition-colors">
              <HelpCircle size={13} />
            </button>
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
                    <span className="px-2 py-1 bg-gray-light text-gray-medium uppercase rounded-sm">Diário</span>
                    <span className="px-2 py-1 bg-primary text-white uppercase rounded-sm font-bold">Semanal</span>
                  </div>
                </div>
                <div className="flex items-end justify-between h-44 px-2 border-b border-gray-light">
                  {[
                    { d: 'SEG', h: 70 }, { d: 'TER', h: 110 }, { d: 'QUA', h: 90, active: true },
                    { d: 'QUI', h: 130 }, { d: 'SEX', h: 80 }, { d: 'SAB', h: 150 }, { d: 'DOM', h: 115, yellow: true },
                  ].map(({ d, h, active, yellow }) => (
                    <div key={d} className="flex flex-col items-center space-y-2 flex-1">
                      <div
                        className={`w-full max-w-[28px] rounded-sm transition-all hover:opacity-80 ${yellow ? 'bg-secondary' : active ? 'bg-primary' : 'bg-gray-light hover:bg-gray-medium/40'}`}
                        style={{ height: `${h}px` }}
                      />
                      <span className={`font-mono text-[9px] ${active ? 'font-bold text-primary' : 'text-gray-medium'}`}>{d}</span>
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
            <div className="p-6 border-b border-gray-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase">
                  Diretório de Produtos
                </h3>
                <p className="text-[10px] text-gray-medium font-mono uppercase mt-1">
                  {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/produtos/novo', { state: { from: activeTab } })}
                className="bg-primary hover:bg-secondary text-white hover:text-primary font-mono text-xs font-bold tracking-widest uppercase px-6 py-3 flex items-center space-x-2 transition-all duration-300 cursor-pointer self-start sm:self-auto"
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
          <div className="bg-white border border-gray-light rounded-sm shadow-sm p-6 sm:p-8 max-w-2xl">
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
                  placeholder="@vogueandbeyond"
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
                  placeholder="contato@vogueandbeyond.com"
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
        )}

      </main>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Layers, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Menu,
  X
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  date: string;
  sizes: string[];
  color: string;
}

export const Admin: React.FC = () => {
  // 1. Local State for Registered Products (Non-monetary details)
  const [products, setProducts] = useState<ProductItem[]>([
    { 
      id: 'VV-9283', 
      name: 'Sculpted Wool Blazer', 
      category: 'Tailoring', 
      stock: 2, 
      status: 'LOW STOCK', 
      date: 'Oct 24, 2023',
      sizes: ['S', 'M'],
      color: 'Black'
    },
    { 
      id: 'VV-9284', 
      name: 'Leather Chelsea Boot', 
      category: 'Footwear', 
      stock: 0, 
      status: 'OUT OF STOCK', 
      date: 'Oct 24, 2023',
      sizes: ['M', 'L'],
      color: 'Black'
    },
    { 
      id: 'VV-9285', 
      name: 'Tailored Wool Coat', 
      category: 'Outerwear', 
      stock: 5, 
      status: 'LOW STOCK', 
      date: 'Oct 23, 2023',
      sizes: ['M', 'L', 'XL'],
      color: 'Black'
    },
    { 
      id: 'VV-9286', 
      name: 'Architectural Poplin Shirt', 
      category: 'Essentials', 
      stock: 45, 
      status: 'IN STOCK', 
      date: 'Oct 22, 2023',
      sizes: ['S', 'M'],
      color: 'White'
    },
    { 
      id: 'VV-9287', 
      name: 'Fluid Pleated Trouser', 
      category: 'Tailoring', 
      stock: 18, 
      status: 'IN STOCK', 
      date: 'Oct 20, 2023',
      sizes: ['M', 'L'],
      color: 'Black'
    },
  ]);

  const navigate = useNavigate();

  // UI Navigation States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stock' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Modal Form State
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Tailoring');
  const [newStock, setNewStock] = useState<number>(10);
  const [newColor, setNewColor] = useState<string>('Black');
  const [newSizes, setNewSizes] = useState<string[]>(['M']);

  // 2. Computed KPI Indicators
  const kpiMetrics = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const stockAlerts = products.filter(p => p.stock <= 5).length;
    const categoriesCount = new Set(products.map(p => p.category)).size;

    return {
      totalProducts,
      totalStock,
      stockAlerts,
      categoriesCount
    };
  }, [products]);

  // 3. Handle Add Product Submit (No Prices)
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const idNum = 9283 + products.length + Math.floor(Math.random() * 100);
    const newId = `VV-${idNum}`;

    let status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' = 'IN STOCK';
    if (newStock === 0) status = 'OUT OF STOCK';
    else if (newStock <= 5) status = 'LOW STOCK';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const newProduct: ProductItem = {
      id: newId,
      name: newName,
      category: newCategory,
      stock: newStock,
      status,
      date: formattedDate,
      sizes: newSizes,
      color: newColor
    };

    setProducts(prev => [newProduct, ...prev]);

    // Reset Form & Close
    setNewName('');
    setNewCategory('Tailoring');
    setNewStock(10);
    setNewColor('Black');
    setNewSizes(['M']);
    setIsModalOpen(false);
  };

  // 4. Handle Delete Product
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // 5. Handle Size Checkbox toggle
  const handleSizeToggle = (size: string) => {
    setNewSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Filtered products list for Search Control
  const searchedProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Critical stock alerts (below 5 units)
  const criticalStockAlerts = useMemo(() => {
    return products.filter(p => p.stock <= 5).slice(0, 3);
  }, [products]);

  return (
    <div className="min-h-screen flex bg-gray-light/20 font-sans relative">
      
      {/* MOBILE SIDEBAR TOGGLE BUTTON */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden absolute top-6 left-6 z-50 p-2 bg-primary text-white rounded-md shadow-md cursor-pointer"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* LEFT SIDEBAR SECTION */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-light bg-white flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Header title */}
          <div>
            <h2 className="font-sans text-lg font-black tracking-widest text-primary uppercase">
              Boutique Admin
            </h2>
            <div className="flex items-center space-x-3 mt-6 border-b border-gray-light pb-4">
              {/* Profile Image Circle Placeholder */}
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-mono font-bold text-primary">
                AP
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary font-mono tracking-wide uppercase">Admin Profile</h4>
                <span className="text-[10px] text-gray-medium font-mono uppercase">Store Manager</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gray-light text-primary border-l-4 border-secondary'
                  : 'text-gray-medium hover:bg-gray-light/50 hover:text-primary'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => { setActiveTab('stock'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-gray-light text-primary border-l-4 border-secondary'
                  : 'text-gray-medium hover:bg-gray-light/50 hover:text-primary'
              }`}
            >
              <Package size={16} />
              <span>Stock Control</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gray-light text-primary border-l-4 border-secondary'
                  : 'text-gray-medium hover:bg-gray-light/50 hover:text-primary'
              }`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Actions Bottom */}
        <div className="space-y-4 pt-6 border-t border-gray-light">
          {/* Add Product yellow button */}
          <button
            onClick={() => navigate('/admin/produtos/novo')}
            className="w-full bg-secondary hover:bg-black hover:text-secondary text-primary font-sans text-xs font-bold tracking-widest uppercase py-3.5 flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-mono font-bold uppercase tracking-widest text-gray-medium hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SECTION */}
      <main className="flex-grow p-6 sm:p-8 lg:p-12 overflow-y-auto w-full lg:max-w-[calc(100vw-16rem)]">
        
        {/* TOP OVERVIEW BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-light pb-6 mb-8 mt-12 lg:mt-0">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-secondary w-5 h-5" />
            <h1 className="font-sans text-sm font-black tracking-widest text-primary uppercase">
              PERFORMANCE OVERVIEW
            </h1>
          </div>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 bg-white border border-gray-light text-xs font-mono px-4 py-2 pr-8 focus:outline-none focus:border-gray-medium"
              />
              <Search className="absolute right-3 w-4 h-4 text-gray-medium" />
            </div>

            {/* Notification and Support mock */}
            <button className="w-8 h-8 rounded-full border border-gray-light flex items-center justify-center text-primary bg-white cursor-pointer hover:bg-gray-light transition-colors">
              <Bell size={14} />
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-light flex items-center justify-center text-primary bg-white cursor-pointer hover:bg-gray-light transition-colors">
              <HelpCircle size={14} />
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: DASHBOARD VIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* KPI METRICS (Non-monetary) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Total Products */}
              <div className="bg-white p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-bold text-gray-medium uppercase tracking-wider block">TOTAL PRODUCTS</span>
                  <span className="font-sans text-2xl font-black text-primary block leading-none">{kpiMetrics.totalProducts}</span>
                  <span className="font-mono text-[9px] text-secondary font-bold uppercase block">↑ +12.4% vs last week</span>
                </div>
                <div className="p-3 bg-secondary/15 text-primary rounded-sm">
                  <Shirt size={16} />
                </div>
              </div>

              {/* Card 2: Total Stock Units */}
              <div className="bg-white p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-bold text-gray-medium uppercase tracking-wider block">STOCK ITEMS</span>
                  <span className="font-sans text-2xl font-black text-primary block leading-none">{kpiMetrics.totalStock}</span>
                  <span className="font-mono text-[9px] text-secondary font-bold uppercase block">↑ +8 items today</span>
                </div>
                <div className="p-3 bg-primary/5 text-primary rounded-sm">
                  <Package size={16} />
                </div>
              </div>

              {/* Card 3: Stock Alerts */}
              <div className="bg-white p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-bold text-gray-medium uppercase tracking-wider block">STOCK ALERTS</span>
                  <span className="font-sans text-2xl font-black text-primary block leading-none">{kpiMetrics.stockAlerts}</span>
                  <span className="font-mono text-[9px] text-gray-medium uppercase block">Items below threshold</span>
                </div>
                <div className="p-3 bg-red-100 text-red-600 rounded-sm">
                  <AlertTriangle size={16} />
                </div>
              </div>

              {/* Card 4: Store Visitors (Real-time Engagement) */}
              <div className="bg-white p-6 border border-gray-light rounded-sm flex items-start justify-between shadow-sm bg-primary text-white">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-bold text-gray-medium uppercase tracking-wider block text-gray-light">STORE VISITORS</span>
                  <span className="font-sans text-2xl font-black block leading-none">1,248</span>
                  <span className="font-mono text-[9px] text-gray-light uppercase block">Real-time engagement</span>
                </div>
                <div className="p-3 bg-white/10 rounded-sm">
                  <Layers size={16} />
                </div>
              </div>

            </div>

            {/* PERFORMANCE CHART AND ALERTS ROWS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Chart Card (Weekly activities) */}
              <div className="lg:col-span-2 bg-white p-6 border border-gray-light rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-gray-light pb-4 mb-6">
                    <div>
                      <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase">Weekly Performance</h3>
                      <p className="text-[10px] text-gray-medium font-mono uppercase mt-1">Activity and stock movement across categories</p>
                    </div>
                    <div className="flex space-x-1 font-mono text-[9px]">
                      <span className="px-2 py-1 bg-gray-light text-gray-medium uppercase rounded-sm">Daily</span>
                      <span className="px-2 py-1 bg-primary text-white uppercase rounded-sm font-bold">Weekly</span>
                    </div>
                  </div>

                  {/* CUSTOM DRAWN BAR CHART GRAPHIC */}
                  <div className="flex items-end justify-between h-48 px-4 pt-6 border-b border-gray-light">
                    <div className="flex flex-col items-center space-y-2 w-12">
                      <div className="w-8 bg-gray-light hover:bg-secondary rounded-sm transition-all" style={{ height: '70px' }}></div>
                      <span className="font-mono text-[9px] text-gray-medium">SEG</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 w-12">
                      <div className="w-8 bg-gray-light hover:bg-secondary rounded-sm transition-all" style={{ height: '110px' }}></div>
                      <span className="font-mono text-[9px] text-gray-medium">TER</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 w-12">
                      <div className="w-8 bg-primary hover:bg-secondary rounded-sm transition-all" style={{ height: '90px' }}></div>
                      <span className="font-mono text-[9px] text-gray-medium font-bold">QUA</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 w-12">
                      <div className="w-8 bg-gray-light hover:bg-secondary rounded-sm transition-all" style={{ height: '130px' }}></div>
                      <span className="font-mono text-[9px] text-gray-medium">QUI</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 w-12">
                      <div className="w-8 bg-gray-light hover:bg-secondary rounded-sm transition-all" style={{ height: '80px' }}></div>
                      <span className="font-mono text-[9px] text-gray-medium">SEX</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 w-12">
                      <div className="w-8 bg-gray-light hover:bg-secondary rounded-sm transition-all" style={{ height: '150px' }}></div>
                      <span className="font-mono text-[9px] text-gray-medium">SAB</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 w-12">
                      <div className="w-8 bg-secondary rounded-sm transition-all" style={{ height: '115px' }}></div>
                      <span className="font-mono text-[9px] text-gray-medium">DOM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Critical Alerts Card */}
              <div className="bg-white p-6 border border-gray-light rounded-sm shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase border-b border-gray-light pb-4 mb-6">
                    Stock Alerts
                  </h3>
                  
                  {/* Alert items list */}
                  <div className="space-y-4">
                    {criticalStockAlerts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-light/30 border border-gray-light rounded-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center text-white font-mono font-bold text-xs">
                            {product.name[0]}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-primary tracking-tight max-w-[120px] truncate">{product.name}</h4>
                            <span className="text-[9px] font-mono text-gray-medium uppercase">{product.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 uppercase ${
                            product.stock === 0 
                              ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {product.stock} Units left
                          </span>
                          <button className="text-gray-medium hover:text-primary cursor-pointer">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Action Link */}
                <button 
                  onClick={() => setActiveTab('stock')}
                  className="w-full border border-primary hover:bg-primary hover:text-white transition-all duration-300 py-3 mt-6 font-mono text-[10px] font-bold tracking-widest uppercase cursor-pointer"
                >
                  Inventory Audit
                </button>
              </div>

            </div>

            {/* RECENT ADDITIONS / ACTIVITY TABLE */}
            <div className="bg-white border border-gray-light rounded-sm shadow-sm">
              <div className="p-6 border-b border-gray-light flex items-center justify-between">
                <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase">
                  Recent Product Registrations
                </h3>
                <button 
                  onClick={() => setActiveTab('stock')}
                  className="font-mono text-[10px] font-bold text-primary hover:text-secondary uppercase tracking-widest cursor-pointer"
                >
                  View All Products
                </button>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="bg-gray-light/30 border-b border-gray-light text-gray-medium uppercase tracking-wider text-[10px]">
                      <th className="p-4 pl-6">Product ID</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Stock Qty</th>
                      <th className="p-4">Date Added</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-light">
                    {products.slice(0, 3).map((product) => (
                      <tr key={product.id} className="hover:bg-gray-light/20 transition-colors">
                        <td className="p-4 pl-6 font-bold text-primary">{product.id}</td>
                        <td className="p-4 font-sans font-bold text-primary uppercase">{product.name}</td>
                        <td className="p-4 uppercase text-gray-medium">{product.category}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold ${
                            product.status === 'IN STOCK' 
                              ? 'bg-green-50 text-green-600'
                              : product.status === 'LOW STOCK'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold">{product.stock} units</td>
                        <td className="p-4 text-gray-medium">{product.date}</td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end space-x-3 text-gray-medium">
                            <button className="hover:text-primary cursor-pointer" title="Edit">
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="hover:text-red-600 cursor-pointer" 
                              title="Delete"
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
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: STOCK CONTROL VIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'stock' && (
          <div className="bg-white border border-gray-light rounded-sm shadow-sm">
            <div className="p-6 border-b border-gray-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase">
                  Stock Control Directory
                </h3>
                <p className="text-[10px] text-gray-medium font-mono uppercase mt-1">Manage and audit boutique inventory list</p>
              </div>
              
              {/* Add Product in stock view */}
              <button
                onClick={() => navigate('/admin/produtos/novo')}
                className="bg-primary hover:bg-secondary text-white hover:text-primary font-sans text-xs font-bold tracking-widest uppercase px-6 py-3 flex items-center space-x-2 transition-all duration-300 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Table layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="bg-gray-light/30 border-b border-gray-light text-gray-medium uppercase tracking-wider text-[10px]">
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Color</th>
                    <th className="p-4">Sizes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-light">
                  {searchedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-light/20 transition-colors">
                      <td className="p-4 pl-6 font-bold text-primary">{product.id}</td>
                      <td className="p-4 font-sans font-bold text-primary uppercase">{product.name}</td>
                      <td className="p-4 uppercase text-gray-medium">{product.category}</td>
                      <td className="p-4 uppercase">{product.color}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {product.sizes.map(size => (
                            <span key={size} className="px-1.5 py-0.5 bg-gray-light border border-gray-light/50 text-[9px] font-bold rounded-sm">
                              {size}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold ${
                          product.status === 'IN STOCK' 
                            ? 'bg-green-50 text-green-600'
                            : product.status === 'LOW STOCK'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold">{product.stock} units</td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end space-x-3 text-gray-medium">
                          <button className="hover:text-primary cursor-pointer" title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="hover:text-red-600 cursor-pointer" 
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {searchedProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-medium uppercase tracking-wider">// NO PRODUCTS REGISTERED MATCH SEARCH</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: SETTINGS VIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-gray-light rounded-sm shadow-sm p-8 max-w-2xl">
            <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase border-b border-gray-light pb-4 mb-6">
              Boutique Settings
            </h3>
            <div className="space-y-6 font-mono text-xs">
              <div className="space-y-2">
                <label className="block text-gray-medium uppercase">Boutique Name</label>
                <input type="text" defaultValue="VOGUE & BEYOND" disabled className="w-full bg-gray-light border border-transparent px-4 py-3 cursor-not-allowed opacity-75" />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-medium uppercase">Administration Access Level</label>
                <input type="text" defaultValue="STORE MANAGER (Full Access)" disabled className="w-full bg-gray-light border border-transparent px-4 py-3 cursor-not-allowed opacity-75" />
              </div>
              <p className="text-[10px] text-gray-medium leading-relaxed">
                As configurações globais do sistema administrativo estão restritas a contas de administradores centrais. Contate a diretoria para obter maiores credenciais.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* PRODUCT REGISTRATION MODAL (NO PRICES) */}
      {/* ---------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-gray-light shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-primary text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-sans text-base font-bold uppercase tracking-tight">Register Product</h3>
                <p className="text-[9px] font-mono text-gray-medium uppercase mt-0.5">Add a new item to boutique stock database</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-light hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-5 text-xs font-mono">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="block text-gray-medium uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sculpted Wool Blazer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-light px-4 py-2.5 focus:outline-none focus:border-primary text-primary"
                />
              </div>

              {/* Category dropdown */}
              <div className="space-y-1.5">
                <label className="block text-gray-medium uppercase">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-gray-light px-4 py-2.5 bg-white focus:outline-none focus:border-primary text-primary"
                >
                  <option value="Outerwear">Outerwear</option>
                  <option value="Tailoring">Tailoring</option>
                  <option value="Essentials">Essentials</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>

              {/* Stock input */}
              <div className="space-y-1.5">
                <label className="block text-gray-medium uppercase">Initial Stock Count (Units)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full border border-gray-light px-4 py-2.5 focus:outline-none focus:border-primary text-primary"
                />
              </div>

              {/* Color dropdown */}
              <div className="space-y-1.5">
                <label className="block text-gray-medium uppercase">Color Swatch</label>
                <select
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full border border-gray-light px-4 py-2.5 bg-white focus:outline-none focus:border-primary text-primary"
                >
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Navy">Navy</option>
                  <option value="Salmon">Salmon</option>
                </select>
              </div>

              {/* Sizes selector checkboxes */}
              <div className="space-y-1.5">
                <label className="block text-gray-medium uppercase">Select Sizes</label>
                <div className="flex gap-4 pt-1">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <label key={size} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSizes.includes(size)}
                        onChange={() => handleSizeToggle(size)}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-primary">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Note about values */}
              <p className="text-[9px] text-gray-medium leading-relaxed bg-gray-light/40 p-2.5 border border-dashed border-gray-light">
                Nota: Em conformidade com o padrão administrativo de cadastro, este painel gerencia exclusivamente a contabilidade física de estoque. Informações financeiras de precificação de venda são indexadas à parte no ERP fiscal.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-gray-light hover:border-primary text-primary py-3 font-bold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-primary hover:bg-secondary text-white hover:text-primary py-3 font-bold tracking-widest uppercase transition-all cursor-pointer active:scale-[0.98]"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

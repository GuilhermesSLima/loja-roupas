import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/home/Home';
import { Catalog } from './pages/catalog/Catalog';
import { Contact } from './pages/contact/Contact';
import { Admin } from './pages/admin/Admin';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AddProduct } from './pages/admin/AddProduct';
import { ProductDetail } from './pages/product/ProductDetail';
import { Cart } from './pages/cart/Cart';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import './App.css';

// Inner component so useCart is inside CartProvider
function AppInner() {
  const location = useLocation();

  // Hide store Navbar/Footer on all /admin/* paths
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Store Header – hidden on admin paths */}
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* ── Public Store Routes ── */}
        <Route path="/" element={<Home onAddToCart={() => {}} />} />
        <Route path="/produtos" element={<Catalog />} />
        <Route path="/produtos/:id" element={<ProductDetail />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/contato" element={<Contact />} />

        {/* ── Admin Auth ── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Protected Admin Routes ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/produtos/novo"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/produtos/editar/:id"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Store Footer – hidden on admin paths */}
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
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
import { StoreProvider } from './context/StoreContext';
import { SaaSLayout } from './components/SaaSLayout';
import { SaaSHome } from './pages/saas/SaaSHome';
import './App.css';

// Nestable routes for specific stores
function RoutesInnerStore() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-primary">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="" element={<Home onAddToCart={() => {}} />} />
          <Route path="produtos" element={<Catalog />} />
          <Route path="produtos/:id" element={<ProductDetail />} />
          <Route path="carrinho" element={<Cart />} />
          <Route path="contato" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function AppInner() {
  return (
    <Routes>
      {/* ── SaaS Landing Page ── */}
      <Route
        path="/"
        element={
          <SaaSLayout>
            <SaaSHome />
          </SaaSLayout>
        }
      />

      {/* ── Public Tenant Store Routes ── */}
      <Route
        path="/loja/:storeSlug/*"
        element={
          <StoreProvider>
            <RoutesInnerStore />
          </StoreProvider>
        }
      />

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

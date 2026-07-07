import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/home/Home';
import { Catalog } from './pages/catalog/Catalog';
import { Contact } from './pages/contact/Contact';
import { Admin } from './pages/admin/Admin';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AddProduct } from './pages/admin/AddProduct';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';
import './App.css';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  // Hide store Navbar/Footer on all /admin/* paths
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Store Header – hidden on admin paths */}
      {!isAdminPage && <Navbar cartCount={cartCount} />}

      <Routes>
        {/* ── Public Store Routes ── */}
        <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
        <Route path="/produtos" element={<Catalog />} />
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

export default App;

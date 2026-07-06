import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/home/Home';
import { Catalog } from './pages/catalog/Catalog';
import { Contact } from './pages/contact/Contact';
import { Footer } from './components/Footer';
import './App.css';

function App() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Dynamic Header / Navbar */}
      <Navbar cartCount={cartCount} />

      {/* Client-Side Routing */}
      <Routes>
        <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
        <Route path="/produtos" element={<Catalog />} />
        <Route path="/contato" element={<Contact />} />
      </Routes>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

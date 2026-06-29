import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/home/Home';
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

      {/* Main Home Page Content */}
      <Home onAddToCart={handleAddToCart} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

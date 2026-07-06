import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Hero } from '../../components/Hero';
import { SectionTitle } from '../../components/SectionTitle';
import { CategoryCard } from '../../components/CategoryCard';
import { ProductCard } from '../../components/ProductCard';
import { PromotionalBanner } from '../../components/PromotionalBanner';

// Import local category assets
import catSuit from '../../assets/cat_suit.jpg';
import catOutdoor from '../../assets/cat_outdoor.jpg';
import catBag from '../../assets/cat_bag.jpg';
import catKnitwear from '../../assets/cat_knitwear.jpg';

interface HomeProps {
  onAddToCart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onAddToCart }) => {
  // Weekly arrivals high-fidelity product mockup data
  const products = [
    {
      id: '1',
      name: 'Silk Slip Dress',
      category: 'Vestidos',
      price: 'R$ 389,00',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=600&q=80',
    },
    {
      id: '2',
      name: 'Structured Blazer',
      category: 'Alfaiataria',
      price: 'R$ 679,00',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&h=600&q=80',
    },
    {
      id: '3',
      name: 'Fluid Trousers',
      category: 'Calças',
      price: 'R$ 429,00',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&h=600&q=80',
    },
    {
      id: '4',
      name: 'Boxy Light Tee',
      category: 'Camisetas',
      price: 'R$ 159,00',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&h=600&q=80',
    },
  ];

  return (
    <main className="flex-grow">
      
      {/* 1. Hero Banner */}
      <Hero />

      {/* 2. Featured Collections (Categorias Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Section title with right side action link */}
        <SectionTitle
          title="Featured Collections"
          subtitle="EXPLORE THE CAMPAIGN"
          underline
          rightElement={
            <Link to="/produtos" className="flex items-center space-x-2 text-xs font-mono font-bold tracking-wider text-primary hover:text-secondary transition-colors uppercase group">
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4 text-primary group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
            </Link>
          }
        />

        {/* Categories Complex Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Large Column (Tall Card) */}
          <div className="lg:col-span-1">
            <CategoryCard
              image={catSuit}
              title="Textured Essentials"
              subtitle="NEW IN STORE"
              actionText="VER CAMPANHA"
              aspectClass="h-[400px] lg:h-[624px]"
            />
          </div>

          {/* Right Column (Landscape + 2 Squares) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Top landscape card */}
            <CategoryCard
              image={catOutdoor}
              title="Urban Activewear"
              subtitle="STREETCORE"
              actionText="EXPLORAR"
              aspectClass="h-[200px] lg:h-[299px]"
            />

            {/* Bottom row containing two square cards */}
            <div className="grid grid-cols-2 gap-6">
              <CategoryCard
                image={catBag}
                title="Minimalist Leather"
                subtitle="ACCESSORIES"
                actionText="VER BOLSAS"
                aspectClass="h-[176px] lg:h-[299px]"
              />
              <CategoryCard
                image={catKnitwear}
                title="Cozy Knits"
                subtitle="AUTUMN EDIT"
                actionText="VER TRICÔS"
                aspectClass="h-[176px] lg:h-[299px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Promotional Banner */}
      <PromotionalBanner />

      {/* 4. Products Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Section title */}
        <div className="text-center mb-12">
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-secondary uppercase mb-2 block">
            // NEW ITEMS
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-extrabold tracking-tight text-primary uppercase">
            Weekly Arrivals
          </h2>
          <div className="w-12 h-1 bg-secondary mx-auto mt-3"></div>
        </div>

        {/* Responsive grid for 4 items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              image={product.image}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

    </main>
  );
};

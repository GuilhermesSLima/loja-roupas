import React, { useState, useMemo } from 'react';
import { Badge } from '../../components/Badge';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
  sizes: string[];
  color: string;
  dateAdded: number;
}

export const Catalog: React.FC = () => {
  // 1. Initial High-Fidelity Catalog Products Dataset
  const initialProducts: Product[] = [
    {
      id: 'c1',
      name: 'Sculpted Wool Blazer',
      category: 'Tailoring',
      price: 495.00,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&h=800&q=80',
      tag: 'NEW ARRIVAL',
      sizes: ['S', 'M', 'L'],
      color: 'Black',
      dateAdded: 3
    },
    {
      id: 'c2',
      name: 'Architectural Poplin Shirt',
      category: 'Essentials',
      price: 240.00,
      image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&h=800&q=80',
      sizes: ['S', 'M'],
      color: 'White',
      dateAdded: 2
    },
    {
      id: 'c3',
      name: 'Fluid Pleated Trouser',
      category: 'Tailoring',
      price: 385.00,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&h=800&q=80',
      tag: 'LIMITED',
      sizes: ['M', 'L', 'XL'],
      color: 'Black',
      dateAdded: 1
    },
    {
      id: 'c4',
      name: 'Linear Calfskin Tote',
      category: 'Accessories',
      price: 1150.00,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&h=800&q=80',
      sizes: ['S', 'M', 'L', 'XL'], // Bags are universal but fit filter sizes for simplicity
      color: 'Black',
      dateAdded: 4
    },
    {
      id: 'c5',
      name: 'Atelier Square-Toe Boot',
      category: 'Footwear',
      price: 620.00,
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&h=800&q=80',
      sizes: ['M', 'L'],
      color: 'Black',
      dateAdded: 5
    },
    {
      id: 'c6',
      name: 'Oversized Trench Coat',
      category: 'Outerwear',
      price: 875.00,
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&h=800&q=80',
      sizes: ['S', 'M', 'L', 'XL'],
      color: 'Black',
      dateAdded: 6
    },
    // Supporting colors for dynamic filters
    {
      id: 'c7',
      name: 'Mustard Knit Sweater',
      category: 'Essentials',
      price: 190.00,
      image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=600&h=800&q=80',
      sizes: ['S', 'M', 'L'],
      color: 'Yellow',
      dateAdded: 7
    },
    {
      id: 'c8',
      name: 'Minimalist Navy Blazer',
      category: 'Tailoring',
      price: 520.00,
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&h=800&q=80',
      sizes: ['M', 'L'],
      color: 'Navy',
      tag: 'NEW ARRIVAL',
      dateAdded: 8
    },
    {
      id: 'c9',
      name: 'Salmon Ribbed Top',
      category: 'Essentials',
      price: 120.00,
      image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=600&h=800&q=80',
      sizes: ['S', 'M'],
      color: 'Salmon',
      dateAdded: 9
    }
  ];

  // 2. Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Tailoring']); // Checked by default in reference
  const [selectedSize, setSelectedSize] = useState<string | null>('M'); // Selected by default in reference
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('Newest');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Constants
  const categoriesList = ['Outerwear', 'Tailoring', 'Essentials', 'Accessories', 'Footwear'];
  const sizesList = ['S', 'M', 'L', 'XL'];
  const colorsList = [
    { name: 'Black', class: 'bg-primary border-primary' },
    { name: 'White', class: 'bg-white border-gray-medium/30' },
    { name: 'Yellow', class: 'bg-[#F5C518] border-[#F5C518]' },
    { name: 'Navy', class: 'bg-[#1D2A44] border-[#1D2A44]' },
    { name: 'Salmon', class: 'bg-[#E07A5F] border-[#E07A5F]' }
  ];

  // 3. Handle Category Filter Toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 4. Handle Reset All Filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSize(null);
    setMaxPrice(2000);
    setSelectedColor(null);
    setSortBy('Newest');
    setVisibleCount(6);
  };

  // 5. Filter & Sort Logic using useMemo
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Filter by Size
    if (selectedSize) {
      result = result.filter(p => p.sizes.includes(selectedSize));
    }

    // Filter by Price
    result = result.filter(p => p.price <= maxPrice);

    // Filter by Color
    if (selectedColor) {
      result = result.filter(p => p.color === selectedColor);
    }

    // Sorting Logic
    if (sortBy === 'Newest') {
      result.sort((a, b) => b.dateAdded - a.dateAdded);
    } else if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategories, selectedSize, maxPrice, selectedColor, sortBy]);

  // Load More logic
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, filteredProducts.length));
  };

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* 1. Page Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-light pb-8 mb-12">
        <div className="max-w-2xl">
          <h1 className="font-sans text-4xl sm:text-5xl font-black uppercase tracking-tight text-primary mb-3">
            FULL COLLECTION
          </h1>
          <p className="font-sans text-sm text-gray-medium leading-relaxed">
            A curated selection of modern essentials, editorial tailoring, and avant-garde 
            silhouettes designed for the contemporary wardrobe.
          </p>
        </div>

        {/* Sort By Dropdown Selector */}
        <div className="flex items-center space-x-3 mt-6 md:mt-0 font-mono text-xs">
          <span className="text-gray-medium uppercase tracking-wider">SORT BY</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border-b border-primary bg-transparent py-1 font-bold text-primary focus:outline-none cursor-pointer uppercase"
          >
            <option value="Newest">Newest</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 2. Main Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
        
        {/* Sidebar Filters */}
        <aside className="col-span-1 lg:col-span-4 space-y-10">
          
          {/* Category Filter */}
          <div>
            <h4 className="font-mono text-xs font-bold tracking-widest text-primary uppercase border-b border-gray-light pb-3 mb-4">
              CATEGORY
            </h4>
            <div className="space-y-3 font-mono text-xs">
              {categoriesList.map((category) => (
                <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-primary group-hover:text-secondary transition-colors ${selectedCategories.includes(category) ? 'font-bold' : ''}`}>
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h4 className="font-mono text-xs font-bold tracking-widest text-primary uppercase border-b border-gray-light pb-3 mb-4">
              SIZE
            </h4>
            <div className="flex flex-wrap gap-2">
              {sizesList.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                  className={`w-12 py-2 border font-mono text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                    selectedSize === size
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-primary border-gray-light hover:border-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="font-mono text-xs font-bold tracking-widest text-primary uppercase border-b border-gray-light pb-3 mb-4">
              PRICE RANGE
            </h4>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[11px] text-gray-medium">
                <span>$0</span>
                <span className="text-primary font-bold">Up to ${maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h4 className="font-mono text-xs font-bold tracking-widest text-primary uppercase border-b border-gray-light pb-3 mb-4">
              COLOR
            </h4>
            <div className="flex flex-wrap gap-3">
              {colorsList.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                  title={color.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform duration-200 cursor-pointer ${color.class} ${
                    selectedColor === color.name ? 'scale-125 border-secondary' : 'hover:scale-110 border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="w-full bg-primary hover:bg-secondary text-white hover:text-primary py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            CLEAR ALL FILTERS
          </button>

        </aside>

        {/* Product Grid Panel */}
        <div className="col-span-1 lg:col-span-6">
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {displayedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group flex flex-col h-full bg-white relative overflow-hidden"
                >
                  {/* Card Image Wrapper */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-light">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />

                    {/* Image tags */}
                    {product.tag && (
                      <Badge 
                        variant={product.tag === 'NEW ARRIVAL' ? 'black' : 'yellow'}
                        className="absolute top-4 left-4 text-[9px] px-2 py-1 font-mono font-bold tracking-wider rounded-none"
                      >
                        {product.tag}
                      </Badge>
                    )}


                  </div>

                  {/* Details Block (Title, Category, Price) */}
                  <div className="flex flex-col mt-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-sans text-sm font-bold text-primary tracking-tight uppercase max-w-[70%]">
                        {product.name}
                      </h3>
                      <span className="font-mono text-sm font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-gray-medium uppercase mt-1">
                      {product.category}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="font-mono text-sm text-gray-medium uppercase tracking-widest mb-2">// NO RESULTS FOUND</span>
              <p className="font-sans text-xs text-gray-medium max-w-xs">
                Tente ajustar os filtros selecionados para encontrar os produtos desejados.
              </p>
            </div>
          )}

          {/* 3. Load More / Pagination Block */}
          {filteredProducts.length > 0 && (
            <div className="mt-16 border-t border-gray-light pt-8 flex flex-col items-center">
              <span className="font-mono text-[10px] font-bold text-gray-medium uppercase tracking-widest mb-3">
                SHOWING {displayedProducts.length} OF {filteredProducts.length} ITEMS
              </span>
              
              {/* Progress Bar Line */}
              <div className="w-64 h-[2px] bg-gray-light relative mb-6">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" 
                  style={{ width: `${(displayedProducts.length / filteredProducts.length) * 100}%` }}
                ></div>
              </div>

              {/* Load More Button */}
              {displayedProducts.length < filteredProducts.length && (
                <button
                  onClick={handleLoadMore}
                  className="border border-primary bg-white hover:bg-primary text-primary hover:text-white transition-all duration-300 font-mono text-xs font-bold tracking-widest uppercase py-3.5 px-10 cursor-pointer"
                >
                  LOAD MORE PRODUCTS
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

import React from 'react';
import { Button } from './Button';
import promoImg from '../assets/promo_fabric.jpg';

export const PromotionalBanner: React.FC = () => {
  return (
    <section className="bg-primary text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Content Column */}
        <div className="flex flex-col justify-center space-y-6">
          <span className="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
            // EDITORIAL PREMIUM
          </span>
          
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            UNCOMPROMISED <br />
            <span className="text-secondary">CRAFTSMANSHIP.</span>
          </h2>
          
          <p className="font-sans text-gray-medium text-sm sm:text-base leading-relaxed max-w-md">
            Cada peça de nossa coleção é pensada sob a ótica do minimalismo e da durabilidade. 
            Utilizando matérias-primas de alta qualidade, garantimos acabamentos impecáveis 
            que resistem ao tempo e elevam o seu estilo diário.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="primary" className="px-8 py-3.5 text-xs font-bold tracking-widest font-mono">
              SHOP THE SALE
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary px-8 py-3.5 text-xs font-bold tracking-widest font-mono">
              OUR STORY
            </Button>
          </div>
        </div>

        {/* Right Image Column with Creative Frame */}
        <div className="relative flex justify-center">
          {/* Subtle Decorative Yellow Corner Accent */}
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-secondary/30 pointer-events-none hidden lg:block"></div>
          
          {/* Background offset dark box */}
          <div className="absolute top-4 left-4 w-full max-w-[400px] aspect-[3/4] border border-gray-medium/20 pointer-events-none"></div>
          
          {/* Image Card Container */}
          <div className="relative w-full max-w-[400px] aspect-[3/4] overflow-hidden shadow-2xl bg-black">
            <img 
              src={promoImg} 
              alt="Tailoring craftsmanship close-up" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import heroImg from '../assets/hero_fashion.jpg';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] bg-primary flex items-center justify-start overflow-hidden">
      {/* Background Image with elegant dark overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImg} 
          alt="Architectural Minimalism Collection" 
          className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/30 to-transparent"></div>
        <div className="absolute inset-0 bg-primary/20"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
        <div className="max-w-2xl">
          {/* Subtitle tag */}
          <span className="inline-block font-mono text-xs font-semibold tracking-[0.25em] text-secondary uppercase mb-4 animate-fade-in-down">
            // NEW COLLECTION
          </span>
          
          {/* Headline with weight contrast */}
          <h1 className="font-sans text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight leading-none mb-6 animate-fade-in-up">
            ARCHITECTURAL
            <span 
              className="block font-sans font-normal tracking-wide text-4xl sm:text-6xl md:text-7xl mt-2 select-none"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)', color: 'transparent' }}
            >
              MINIMALISM
            </span>
          </h1>

          {/* Description */}
          <p className="font-sans text-gray-light text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-lg mb-8 opacity-90 animate-fade-in">
            A harmonia entre linhas retas, texturas nobres e cores sóbrias. 
            Desenvolvido para criar a base estruturada do guarda-roupa contemporâneo.
          </p>

          {/* Call-to-action button */}
          <div className="animate-fade-in-up delay-300">
            <Link to="/produtos">
              <Button variant="primary" className="flex items-center space-x-2 px-8 py-4 text-xs font-bold font-mono tracking-widest group/btn">
                <span>COMPRAR AGORA</span>
                <ArrowRight className="w-4 h-4 text-primary group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

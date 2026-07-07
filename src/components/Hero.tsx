import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full bg-black flex flex-col items-center justify-center overflow-hidden py-16 md:py-24 border-b border-gray-light">

      {/* Top label */}
      {/* <p className="font-mono text-xs font-semibold tracking-[0.35em] text-yellow-400 uppercase animate-fade-in-down">
        Bem-vindo a
      </p> */}

      {/* Logo as main visual */}
      <div className="w-full max-w-3xl mx-auto px-6 flex items-center justify-center animate-fade-in">
        <img
          src="/banner-black.png"
          alt="Canhoto Surf Outlet"
          className="w-full h-auto object-contain select-none"
          draggable={false}
        />
      </div>
    </section>
  );
};

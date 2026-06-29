import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-light pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand details & Social Icons */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-sans text-lg font-black tracking-widest text-primary uppercase">
              VOGUE <span className="text-secondary font-normal">&</span> BEYOND
            </h3>
            
            <p className="font-sans text-xs text-gray-medium leading-relaxed max-w-xs">
              Criamos peças atemporais pensadas para o guarda-roupa moderno. Minimalismo, qualidade e caimento perfeitos em cada costura.
            </p>

            {/* Social Icons Placeholders */}
            <div className="flex space-x-3">
              <span className="w-8 h-8 flex items-center justify-center border border-dashed border-gray-medium/50 rounded-sm text-[9px] font-mono text-gray-medium select-none" title="Facebook">FB</span>
              <span className="w-8 h-8 flex items-center justify-center border border-dashed border-gray-medium/50 rounded-sm text-[9px] font-mono text-gray-medium select-none" title="Instagram">IG</span>
              <span className="w-8 h-8 flex items-center justify-center border border-dashed border-gray-medium/50 rounded-sm text-[9px] font-mono text-gray-medium select-none" title="Pinterest">PIN</span>
              <span className="w-8 h-8 flex items-center justify-center border border-dashed border-gray-medium/50 rounded-sm text-[9px] font-mono text-gray-medium select-none" title="TikTok">TT</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-sans text-xs font-bold tracking-widest text-primary uppercase">
              PRODUTOS
            </h4>
            <ul className="space-y-2 font-sans text-xs text-gray-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Novidades</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Roupas Masculinas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Roupas Femininas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Acessórios</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Promoções</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Support */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-sans text-xs font-bold tracking-widest text-primary uppercase">
              SUPORTE
            </h4>
            <ul className="space-y-2 font-sans text-xs text-gray-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Atendimento ao Cliente</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Envios e Entregas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Guia de Tamanhos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Fale Conosco</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col space-y-4">
            <h4 className="font-sans text-xs font-bold tracking-widest text-primary uppercase">
              ASSINE NOSSA NEWSLETTER
            </h4>
            
            <p className="font-sans text-xs text-gray-medium leading-relaxed">
              Receba atualizações sobre novos lançamentos, vendas exclusivas e editoriais de moda.
            </p>

            {/* Newsletter input layout */}
            <form onSubmit={(e) => e.preventDefault()} className="flex items-stretch mt-2">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="w-full bg-gray-light border border-transparent px-4 py-3 text-xs font-mono focus:outline-none focus:border-gray-medium/50 placeholder:text-gray-medium/70"
              />
              <button 
                type="submit"
                className="bg-primary hover:bg-secondary text-white hover:text-primary transition-all duration-300 px-4 font-mono text-xs flex items-center justify-center cursor-pointer select-none"
              >
                [{'>'}]
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="border-t border-gray-light pt-8 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] text-gray-medium uppercase tracking-wider">
          <p>© {new Date().getFullYear()} VOGUE & BEYOND. TODOS OS DIREITOS RESERVADOS.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">POLÍTICA DE PRIVACIDADE</a>
            <a href="#" className="hover:text-primary transition-colors">TERMOS DE USO</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

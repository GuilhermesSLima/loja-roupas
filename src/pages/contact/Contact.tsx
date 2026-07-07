import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ContactCardProps {
  title: string;
  detail: string;
  href?: string;
  icon: React.ReactNode;
}

const ContactCard: React.FC<ContactCardProps> = ({ title, detail, href, icon }) => {
  const CardContent = () => (
    <div className="flex items-center space-x-5 flex-grow">
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-white">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <h3 className="font-sans text-base font-bold text-primary tracking-tight">
          {title}
        </h3>
        <span className="font-mono text-xs text-gray-medium mt-1 break-all">
          {detail}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-6 sm:p-8 bg-white border border-gray-light rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group w-full"
      >
        <CardContent />
        <div className="w-8 h-8 flex items-center justify-center border border-gray-light rounded-full group-hover:border-primary transition-colors flex-shrink-0 ml-4">
          <svg
            className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12,5 19,12 12,19"></polyline>
          </svg>
        </div>
      </a>
    );
  }

  return (
    <div className="flex items-center justify-between p-6 sm:p-8 bg-white border border-gray-light rounded-lg shadow-sm w-full">
      <CardContent />
    </div>
  );
};

export const Contact: React.FC = () => {
  const [lojaInfo, setLojaInfo] = useState<{
    telefone: string;
    whatsapp: string;
    instagram: string;
    email: string;
    endereco: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLojaInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('loja')
          .select('telefone, whatsapp, instagram, email, endereco')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setLojaInfo(data[0]);
        } else {
          // Fallback caso a tabela loja esteja vazia
          setLojaInfo({
            telefone: '+55 (11) 99999-9999',
            whatsapp: '+55 (11) 99999-9999',
            instagram: '@vogueandbeyond',
            email: 'contato@vogueandbeyond.com',
            endereco: 'Av. Paulista, 1000 - São Paulo, SP',
          });
        }
      } catch (err) {
        console.error('Erro ao buscar dados de contato da loja:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLojaInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-6 h-6 border-2 border-gray-light border-t-primary rounded-full animate-spin" />
        <p className="font-mono text-[10px] text-gray-medium uppercase tracking-widest">
          Carregando informações...
        </p>
      </div>
    );
  }

  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  const contactChannels = [];

  if (lojaInfo?.whatsapp && lojaInfo.whatsapp.trim()) {
    contactChannels.push({
      title: 'WhatsApp',
      detail: lojaInfo.whatsapp,
      href: `https://wa.me/${cleanNumber(lojaInfo.whatsapp)}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      ),
    });
  }

  if (lojaInfo?.instagram && lojaInfo.instagram.trim()) {
    contactChannels.push({
      title: 'Instagram',
      detail: lojaInfo.instagram.startsWith('@') ? lojaInfo.instagram : `@${lojaInfo.instagram}`,
      href: `https://instagram.com/${lojaInfo.instagram.replace('@', '')}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
    });
  }

  if (lojaInfo?.email && lojaInfo.email.trim()) {
    contactChannels.push({
      title: 'E-mail',
      detail: lojaInfo.email,
      href: `mailto:${lojaInfo.email}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    });
  }

  if (lojaInfo?.telefone && lojaInfo.telefone.trim()) {
    contactChannels.push({
      title: 'Telefone',
      detail: lojaInfo.telefone,
      href: `tel:${cleanNumber(lojaInfo.telefone)}`,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
    });
  }

  if (lojaInfo?.endereco && lojaInfo.endereco.trim()) {
    contactChannels.push({
      title: 'Endereço',
      detail: lojaInfo.endereco,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow flex flex-col justify-center">
      
      {/* Editorial Title Section */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="font-mono text-xs font-semibold tracking-[0.2em] text-secondary uppercase block">
          // CANAIS DE ATENDIMENTO
        </span>
        
        <h1 className="font-sans text-4xl sm:text-5xl font-black uppercase tracking-tight text-primary">
          Fale Conosco
        </h1>
        
        <div className="w-12 h-1 bg-secondary mx-auto"></div>
        
        <p className="font-sans text-sm text-gray-medium leading-relaxed pt-2">
          Estamos à disposição para transformar sua experiência. Entre em contato através de nossos canais oficiais de atendimento.
        </p>
      </div>

      {/* Grid Channels Layout */}
      {contactChannels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {contactChannels.map((channel, idx) => (
            <ContactCard
              key={idx}
              title={channel.title}
              detail={channel.detail}
              href={channel.href}
              icon={channel.icon}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-light rounded-lg max-w-md mx-auto w-full">
          <p className="font-mono text-xs text-gray-medium uppercase tracking-wider">
            Nenhum canal de atendimento cadastrado no momento.
          </p>
        </div>
      )}

    </div>
  );
};

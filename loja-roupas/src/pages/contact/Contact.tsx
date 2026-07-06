import React from 'react';

interface ContactCardProps {
  title: string;
  detail: string;
  href: string;
  icon: React.ReactNode;
}

const ContactCard: React.FC<ContactCardProps> = ({ title, detail, href, icon }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-6 sm:p-8 bg-white border border-gray-light rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <div className="flex items-center space-x-5">
        {/* Left circular black icon badge */}
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-white">
          {icon}
        </div>
        
        {/* Contact details */}
        <div className="flex flex-col">
          <h3 className="font-sans text-base font-bold text-primary tracking-tight">
            {title}
          </h3>
          <span className="font-mono text-xs text-gray-medium mt-1">
            {detail}
          </span>
        </div>
      </div>

      {/* Right Action Arrow */}
      <div className="w-8 h-8 flex items-center justify-center border border-gray-light rounded-full group-hover:border-primary transition-colors">
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
};

export const Contact: React.FC = () => {
  const contactChannels = [
    {
      title: 'WhatsApp',
      detail: 'Atendimento Imediato',
      href: 'https://wa.me/5511900000000',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      )
    },
    {
      title: 'Instagram',
      detail: '@vogueandvesture',
      href: 'https://instagram.com/vogueandvesture',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      )
    },
    {
      title: 'E-mail',
      detail: 'Suporte e Parcerias',
      href: 'mailto:contato@vogueandvesture.com',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      )
    },
    {
      title: 'Telefone',
      detail: '+55 (11) 90000-0000',
      href: 'tel:+5511900000000',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow flex flex-col justify-center">
      
      {/* Editorial Title Section */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="font-mono text-xs font-semibold tracking-[0.2em] text-secondary uppercase block">
          // GET IN TOUCH
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

    </div>
  );
};

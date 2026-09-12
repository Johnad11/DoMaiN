import React from 'react';

export default function DomainLogo({ size = 'md', showTagline = false }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Official Website Logo Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <img
          src="/favicon.svg"
          alt="DOMAINIT Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,229,255,0.45)] hover:scale-105 transition-transform"
        />
      </div>

      {/* Innovative Stylized Brand Name */}
      <div className="flex flex-col">
        <div className={`font-heading font-black tracking-wider ${textSizes[size]} leading-none flex items-center`}>
          <span className="text-cyan-plasma">DOMA</span>
          <span className="text-bone">IN</span>
          <span className="text-orange-magma">IT</span>
          <span className="inline-block w-2 h-2 ml-1 rounded-sm bg-green-bio animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[10px] font-mono tracking-widest uppercase text-ash mt-1">
            Own the question. Rule the room.
          </span>
        )}
      </div>
    </div>
  );
}

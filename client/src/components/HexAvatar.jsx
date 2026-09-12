import React from 'react';

export default function HexAvatar({
  name = 'Player',
  color = '#00E5FF',
  size = 'md', // sm, md, lg, xl
  rank = null,
  isHost = false,
  showGlow = true
}) {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  const initial = (name || 'P').charAt(0).toUpperCase();

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer Hex Border with Neon Glow */}
      <div
        className={`${sizeMap[size]} p-[2px] flex items-center justify-center transition-all duration-300`}
        style={{
          backgroundColor: color,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          boxShadow: showGlow ? `0 0 16px ${color}66` : 'none'
        }}
      >
        {/* Inner Dark Hex Body */}
        <div
          className="w-full h-full bg-slate flex items-center justify-center font-heading font-bold"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            color: color
          }}
        >
          {initial}
        </div>
      </div>

      {/* Rank Badge if provided */}
      {rank && (
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 bg-obsidian border border-bone/30 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-bone shadow"
        >
          #{rank}
        </div>
      )}
    </div>
  );
}

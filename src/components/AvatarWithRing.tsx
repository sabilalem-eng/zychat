import React from 'react';
import { AvatarRing } from '../types';

interface AvatarWithRingProps {
  src: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: AvatarRing;
  showVerified?: boolean;
  isOnline?: boolean;
  className?: string;
}

export const AvatarWithRing: React.FC<AvatarWithRingProps> = ({
  src,
  size = 'md',
  ring = 'comic',
  showVerified = false,
  isOnline = false,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const getRingClasses = () => {
    switch (ring) {
      case 'comic':
        return 'border-[2.5px] border-[#111111] shadow-[2px_2px_0px_#111111]';
      case 'duo_merah':
        return 'border-[3px] border-[#EF4444] ring-2 ring-[#FFC800]';
      case 'halftone':
        return 'border-[3px] border-[#8B5CF6] ring-2 ring-[#111111]';
      case 'speed_line':
        return 'border-[3px] border-[#00B8D9] border-dashed ring-1 ring-[#111111]';
      case 'pow':
        return 'border-[3.5px] border-[#F6C825] ring-2 ring-[#111111] shadow-[0_0_10px_rgba(246,200,37,0.8)]';
      case 'polos':
      default:
        return 'border border-neutral-300';
    }
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`rounded-full overflow-hidden bg-neutral-200 transition-all ${sizeMap[size]} ${getRingClasses()}`}
      >
        <img
          src={src}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback avatar
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
          }}
        />
      </div>

      {/* Online Dot */}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#18C96E] border-2 border-white rounded-full" />
      )}

      {/* Centang Biru Verified Badge */}
      {showVerified && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 bg-[#008DA6] text-white rounded-full flex items-center justify-center text-[9px] font-black border border-white shadow-xs"
          title="Terverifikasi"
        >
          ✓
        </span>
      )}
    </div>
  );
};

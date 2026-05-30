import React from 'react';

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = '', iconOnly = false, size = 'md' }: BrandLogoProps) {
  const getLogoSize = () => {
    switch (size) {
      case 'sm':
        return { icon: 'h-6 w-6', text: 'text-lg', subtitle: 'text-[6px]' };
      case 'lg':
        return { icon: 'h-12 w-12', text: 'text-3xl', subtitle: 'text-[9px]' };
      case 'md':
      default:
        return { icon: 'h-9 w-9', text: 'text-2xl', subtitle: 'text-[7.5px]' };
    }
  };

  const { icon, text, subtitle } = getLogoSize();

  return (
    <div id="brand-logo-container" className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* S-Highway Ribbon SVG ICON */}
      <div id="sendie-logo-icon" className={`${icon} flex-shrink-0 relative`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Main S-Ribbon underlay shadows */}
          <path
            d="M20,95 C15,95 10,85 15,75 C25,55 55,55 65,35 C75,15 110,15 110,35 C110,55 80,65 70,85 C60,105 25,105 20,95 Z"
            fill="url(#highwayGrad)"
          />
          {/* High-quality path lane markings */}
          <path
            d="M 15 85 C 25 65 55 55 65 35 C 75 15 105 25 105 45 C 105 60 80 65 70 85 C 60 102 32 98 18 85"
            stroke="white"
            strokeWidth="3.5"
            strokeDasharray="8 6"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Speed streaks in the back left */}
          <line x1="2" y1="50" x2="16" y2="50" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
          <line x1="-5" y1="62" x2="12" y2="62" stroke="#1D4ED8" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
          <line x1="1" y1="74" x2="14" y2="74" stroke="#1E3A8A" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />

          <defs>
            <linearGradient id="highwayGrad" x1="0" y1="120" x2="120" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="35%" stopColor="#1E3A8A" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {!iconOnly && (
        <div id="sendie-text-layout" className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline">
            <span id="logo-main-text" className={`font-display font-extrabold tracking-tight text-slate-900 ${text}`}>
              Sendie
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 ml-0.5 mb-1.5 animate-pulse"></span>
          </div>
          <span id="logo-sub-text" className={`font-sans font-bold tracking-[0.2em] text-blue-600 uppercase ${subtitle}`}>
            TRACK. DELIVER. DELIGHT.
          </span>
        </div>
      )}
    </div>
  );
}

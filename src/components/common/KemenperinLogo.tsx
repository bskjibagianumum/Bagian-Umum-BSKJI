import React, { useState } from 'react';
import kemenperinLogoImg from '../../assets/images/kemenperin_logo.png';
import kemenperinStrokeImg from '../../assets/images/kemenperin_stroke.png';

interface KemenperinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
}

export const KemenperinLogo: React.FC<KemenperinLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  lightText = false,
}) => {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Fallback cascade sequence
  const logoSources = [
    kemenperinLogoImg,
    kemenperinStrokeImg,
    '/kemenperin_logo.png',
    '/kemenperin_stroke.png',
    '/images/kemenperin_logo.png',
    '/images/kemenperin_stroke.png',
    '/logo.png',
  ];

  const sizeContainerClasses = {
    sm: 'h-8 px-1 min-w-8',
    md: 'h-9 px-1.5 min-w-9',
    lg: 'h-11 px-2 min-w-11',
    xl: 'h-14 px-2.5 min-w-14',
  };

  const imgHeightClasses = {
    sm: 'h-7 w-auto max-w-[80px]',
    md: 'h-8 w-auto max-w-[100px]',
    lg: 'h-10 w-auto max-w-[140px]',
    xl: 'h-12 w-auto max-w-[180px]',
  };

  const handleImageError = () => {
    if (fallbackIndex < logoSources.length - 1) {
      setFallbackIndex((prev) => prev + 1);
    } else {
      setFallbackIndex(999); // SVG fallback mode
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative shrink-0 ${sizeContainerClasses[size]} rounded-xl bg-white/95 p-1 border border-slate-200/90 shadow-2xs flex items-center justify-center ring-1 ring-slate-900/5 transition-all`}
      >
        {fallbackIndex === 999 ? (
          /* SVG Official Seal Fallback */
          <div className="flex items-center justify-center p-1 text-slate-800 font-black text-center">
            <svg
              className="w-full h-full max-h-7 text-blue-700"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L1 21h22L12 2zm0 4.2L18.8 19H5.2L12 6.2z" />
              <circle cx="12" cy="14" r="2.5" fill="#e11d48" />
            </svg>
          </div>
        ) : (
          <img
            src={logoSources[fallbackIndex]}
            alt="Logo Resmi Kementerian Perindustrian"
            className={`${imgHeightClasses[size]} object-contain`}
            onError={handleImageError}
            loading="eager"
            decoding="async"
          />
        )}
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight leading-tight text-xs uppercase ${
              lightText ? 'text-white' : 'text-slate-900'
            }`}
          >
            Kementerian Perindustrian RI
          </span>
          <span
            className={`text-[10px] leading-tight font-medium ${
              lightText ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Badan Standardisasi dan Kebijakan Jasa Industri
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import kemenperinLogoImg from '../../assets/images/kemenperin_logo.png';

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
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative shrink-0 ${sizeClasses[size]} rounded-xl bg-white p-0.5 border border-slate-200/90 shadow-xs overflow-hidden flex items-center justify-center ring-1 ring-slate-900/5`}>
        <img
          src={kemenperinLogoImg}
          alt="Logo Resmi Kementerian Perindustrian"
          className="w-full h-full object-contain rounded-lg"
          referrerPolicy="no-referrer"
        />
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

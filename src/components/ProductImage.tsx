import React, { useState } from 'react';
import { ShoppingBasket } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  placeholderLabel?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = '', loading = 'lazy', placeholderLabel }) => {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[#e8dfcf] text-[#756d60] ${className}`} role="img" aria-label={`${alt} image unavailable`}>
        <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
        <span className="px-3 text-center font-display text-lg font-bold leading-none text-[#4d5649]">{placeholderLabel || 'Market photo coming soon'}</span>
        <span className="px-3 text-center text-[9px] font-bold uppercase tracking-[0.14em]">Real product photo coming soon</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading={loading} onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} />;
};

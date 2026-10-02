import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Product } from '../types/index.js';
import { formatNaira } from '../utils/formatters.js';
import { useCart } from '../context/CartContext.js';

interface ProductCardProps { product: Product; onSelect: (product: Product) => void; }

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const quickAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (product.stock < 1) return;
    const result = addToCart(product, 1);
    if (result.success) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    }
  };

  return (
    <article className="group cursor-pointer" onClick={() => onSelect(product)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#eadfce] border border-[#ddcfbb]">
        <img src={product.image} alt={`${product.name} food product`} loading="lazy" className={`h-full w-full object-cover transition duration-700 ${hovered && product.hover_image ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-[1.03]'}`} />
        {product.hover_image && <img src={product.hover_image} alt="Food detail" loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`} />}
        <button type="button" onClick={quickAdd} disabled={product.stock < 1} className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 bg-[#fffaf2] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#20251e] opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60">
          {added ? <><Check className="h-4 w-4" /> Added to bag</> : <><Plus className="h-4 w-4" /> Add to bag</>}
        </button>
        {product.stock < 1 && <span className="absolute left-3 top-3 bg-[#20251e] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white">Out of stock</span>}
      </div>
      <div className="space-y-1.5 pt-4">
        <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a05b35]"><span>{product.category_slug}</span><span>{product.weight}</span></div>
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#20251e]">{product.name}</h3>
        <div className="flex items-center justify-between gap-3"><p className="line-clamp-1 text-sm text-[#6f6a60]">{product.description}</p><span className="shrink-0 text-sm font-bold text-[#20251e]">{formatNaira(product.price)}</span></div>
      </div>
    </article>
  );
};

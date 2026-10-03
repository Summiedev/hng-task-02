import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Product } from '../types/index.js';
import { formatNaira } from '../utils/formatters.js';
import { getUnitOptions } from '../utils/product.js';
import { useCart } from '../context/CartContext.js';
import { ProductImage } from './ProductImage.js';
import { QuantitySelector } from './QuantitySelector.js';

interface ProductCardProps { product: Product; onSelect: (product: Product) => void; }

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const units = getUnitOptions(product);
  const [selectedUnit, setSelectedUnit] = useState(units[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const quickAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (product.stock < 1) return;
    const result = addToCart(product, quantity, selectedUnit.label);
    if (result.success) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <article className="group flex min-w-0 flex-col rounded-[1.25rem] border border-[#e1d8c9] bg-[#fffdf8] p-2 shadow-[0_10px_30px_rgba(60,45,20,0.04)] transition hover:-translate-y-0.5 hover:border-[#cdbda7] sm:p-2.5">
      <button type="button" onClick={() => onSelect(product)} className="relative block aspect-[1.08] overflow-hidden rounded-[0.9rem] bg-[#e8dfcf] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e]">
        <ProductImage src={product.image} alt={`${product.name} in a market-style food photo`} placeholderLabel={product.name} className="transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#fff9ed]/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#4d5649]">{product.stock > 0 ? 'In stock' : 'Sold out'}</span>
      </button>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <div className="flex flex-col gap-2 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between min-[390px]:gap-3">
          <button type="button" onClick={() => onSelect(product)} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e]">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#b8472e]">{product.category_slug.replaceAll('-', ' ')}</p>
            <h3 className="mt-1 font-display text-[1.15rem] font-bold leading-[0.98] tracking-[-0.035em] text-[#1d2a1d] sm:text-[1.35rem]">{product.name}</h3>
          </button>
          <div className="shrink-0 text-left min-[390px]:text-right">
            <p className="text-[0.95rem] font-black text-[#1d2a1d] sm:text-base">{formatNaira(selectedUnit.price)}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-[#777466]">per {selectedUnit.label}</p>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.35rem] text-xs leading-5 text-[#777466]">{product.description}</p>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" aria-label={`Choose a buying unit for ${product.name}`}>
          {units.map((unit) => <button key={unit.label} type="button" onClick={(event) => { event.stopPropagation(); setSelectedUnit(unit); }} className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e] ${selectedUnit.label === unit.label ? 'border-[#1d2a1d] bg-[#1d2a1d] text-white' : 'border-[#d8cebf] bg-[#fffaf2] text-[#5e655a] hover:border-[#8e9a87]'}`}>{unit.label}</button>)}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <QuantitySelector value={quantity} onChange={setQuantity} max={Math.max(1, product.stock)} label={`${product.name} quantity`} compact />
          <button type="button" onClick={quickAdd} disabled={product.stock < 1} className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#b8472e] px-3 text-[10px] font-black uppercase tracking-[0.13em] text-white transition hover:bg-[#91341f] disabled:cursor-not-allowed disabled:bg-[#cfc8bb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d2a1d]">
            {added ? <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Added</> : <><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
};

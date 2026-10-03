import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, MapPin } from 'lucide-react';
import { Product } from '../types/index.js';
import { formatNaira } from '../utils/formatters.js';
import { getUnitOptions } from '../utils/product.js';
import { useCart } from '../context/CartContext.js';
import { ProductCard } from '../components/ProductCard.js';
import { ProductImage } from '../components/ProductImage.js';
import { QuantitySelector } from '../components/QuantitySelector.js';
import { fetchJson } from '../utils/api.js';

interface ProductDetailPageProps { product: Product; onBack: () => void; onSelectProduct: (product: Product) => void; }

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onSelectProduct }) => {
  const { addToCart } = useCart();
  const units = getUnitOptions(product);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedUnit, setSelectedUnit] = useState(units[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    setSelectedImage(product.image); setSelectedUnit(getUnitOptions(product)[0]); setQuantity(1);
    fetchJson<Product[]>(`/api/products?category=${product.category_slug}`).then((items) => setRelated(items.filter((item) => item.id !== product.id).slice(0, 3))).catch(() => setRelated([]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const add = () => {
    if (product.stock < 1) return;
    const result = addToCart(product, quantity, selectedUnit.label);
    if (result.success) { setAdded(true); window.setTimeout(() => setAdded(false), 1800); }
  };
  const gallery = Array.from(new Set([product.image, ...(product.gallery || [])]));

  return <div className="min-h-screen bg-[#fffaf2] px-4 py-8 text-[#1d2a1d] sm:px-8 sm:py-14"><div className="mx-auto max-w-[1280px]">
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#777466] hover:text-[#b8472e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the market</button>
    <div className="grid gap-9 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
      <div><div className="flex flex-col-reverse gap-3 sm:flex-row"><div className="flex gap-2 overflow-auto sm:w-20 sm:flex-col">{gallery.map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => setSelectedImage(src)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-[0.65rem] border-2 sm:h-20 sm:w-20 ${src === selectedImage ? 'border-[#b8472e]' : 'border-[#dfd5c5]'}`} aria-label={`View ${product.name} photo ${index + 1}`}><ProductImage src={src} alt="" /></button>)}</div><div className="aspect-square flex-1 overflow-hidden rounded-[1.4rem] bg-[#e8dfcf] sm:aspect-[1.04]"><ProductImage src={selectedImage} alt={`${product.name} food product`} loading="eager" /></div></div>{product.image_note && <p className="mt-3 text-xs leading-5 text-[#777466]">{product.image_note}</p>}</div>
      <div className="lg:pt-6"><div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#b8472e]"><span>{product.category_slug.replaceAll('-', ' ')}</span><span className="text-[#c8bba9]">·</span><span>{product.stock > 0 ? 'In stock' : 'Out of stock'}</span></div><h1 className="mt-4 max-w-[12ch] font-display text-5xl font-bold leading-[0.88] tracking-[-0.06em] sm:text-7xl">{product.name}</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#65695d]">{product.detailed_description}</p>
        <div className="mt-7 rounded-[1rem] border border-[#e1d8c9] bg-[#fffdf8] p-4 sm:p-5"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b8472e]">Choose your market unit</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{units.map((unit) => <button key={unit.label} type="button" onClick={() => setSelectedUnit(unit)} className={`rounded-[0.7rem] border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e] ${selectedUnit.label === unit.label ? 'border-[#1d2a1d] bg-[#1d2a1d] text-white' : 'border-[#ddd3c3] bg-[#fffaf2] text-[#1d2a1d] hover:border-[#b8472e]'}`}><span className="block text-xs font-black">{unit.label}</span><span className={`mt-1 block text-xs ${selectedUnit.label === unit.label ? 'text-[#f0d3a6]' : 'text-[#777466]'}`}>{formatNaira(unit.price)}</span></button>)}</div><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><QuantitySelector value={quantity} onChange={setQuantity} max={Math.max(1, product.stock)} label={`${product.name} quantity`} /><button type="button" onClick={add} disabled={product.stock < 1} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#b8472e] px-5 text-xs font-black uppercase tracking-[0.13em] text-white transition hover:bg-[#91341f] disabled:bg-[#cfc8bb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d2a1d]">{added ? <><Check className="h-4 w-4" aria-hidden="true" /> Added to basket</> : product.stock < 1 ? 'Out of stock' : `Add to basket · ${formatNaira(selectedUnit.price * quantity)}`}</button></div></div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#667060]"><MapPin className="h-4 w-4 text-[#b8472e]" aria-hidden="true" /> Packed in Lagos · delivery area chosen at checkout</div>
        <div className="mt-9 grid gap-5 border-t border-[#e1d8c9] pt-6 sm:grid-cols-2"><div><h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#b8472e]">What’s inside</h2><p className="mt-2 text-sm leading-6 text-[#777466]">{product.ingredients || 'Ingredients information coming soon.'}</p></div><div><h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#b8472e]">Storage</h2><p className="mt-2 text-sm leading-6 text-[#777466]">{product.storage_info || 'Storage information coming soon.'}</p>{product.allergen_info && <><h2 className="mt-5 text-[10px] font-black uppercase tracking-[0.15em] text-[#b8472e]">Allergens</h2><p className="mt-2 text-sm leading-6 text-[#777466]">{product.allergen_info}</p></>}</div></div>
      </div>
    </div>
    {related.length > 0 && <section className="mt-20 border-t border-[#e1d8c9] pt-10"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b8472e]">More for the same pot</p><h2 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em]">Keep browsing the shelf</h2><div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} onSelect={onSelectProduct} />)}</div></section>}
  </div></div>;
};

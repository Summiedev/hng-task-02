import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { Product } from '../types/index.js';
import { formatNaira } from '../utils/formatters.js';
import { useCart } from '../context/CartContext.js';
import { ProductCard } from '../components/ProductCard.js';

interface ProductDetailPageProps { product: Product; onBack: () => void; onSelectProduct: (product: Product) => void; }

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    setSelectedImage(product.image);
    setQuantity(1);
    fetch(`/api/products?category=${product.category_slug}`).then((r) => r.json()).then((items: Product[]) => setRelated(items.filter((item) => item.id !== product.id).slice(0, 3))).catch(() => setRelated([]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const add = () => {
    if (product.stock < 1) return;
    const result = addToCart(product, quantity);
    if (result.success) { setAdded(true); window.setTimeout(() => setAdded(false), 1800); }
  };
  const gallery = Array.from(new Set([product.image, ...(product.gallery || [])]));

  return (
    <div className="min-h-screen bg-[#fffaf2] px-5 py-8 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1280px]">
        <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#6f6a60] hover:text-[#a05b35]"><ArrowLeft className="h-4 w-4" /> Back to the shelf</button>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex flex-col-reverse gap-4 sm:flex-row">
              <div className="flex gap-3 overflow-auto sm:w-20 sm:flex-col">
                {gallery.map((src, index) => <button type="button" key={src} onClick={() => setSelectedImage(src)} className={`h-20 w-16 shrink-0 overflow-hidden border ${src === selectedImage ? 'border-[#a05b35]' : 'border-[#d9cdbb]'}`}><img src={src} alt={`${product.name} food image ${index + 1}`} className="h-full w-full object-cover" /></button>)}
              </div>
              <div className="aspect-[4/5] flex-1 overflow-hidden bg-[#eadfce]"><img src={selectedImage} alt={`${product.name} food product`} className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]" /></div>
            </div>
            {product.image_note && <p className="mt-3 text-xs leading-5 text-[#6f6a60]">{product.image_note}</p>}
          </div>
          <div className="lg:pt-8">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-[#a05b35]"><span>{product.category_slug}</span><span>{product.sku}</span></div>
            <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">{product.name}</h1>
            <div className="mt-6 flex items-baseline justify-between border-b border-[#d9cdbb] pb-6"><span className="text-2xl font-bold">{formatNaira(product.price)}</span><span className="text-sm font-semibold text-[#6f6a60]">{product.weight}</span></div>
            <p className="mt-6 text-base leading-7 text-[#6f6a60]">{product.detailed_description}</p>
            <div className="mt-8 flex gap-3"><div className="flex items-center border border-[#d9cdbb]"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button><span className="w-10 text-center text-sm font-bold">{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button></div><button type="button" onClick={add} disabled={product.stock < 1} className="flex-1 bg-[#20251e] px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#a05b35] disabled:bg-[#d9cdbb]">{added ? <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> Added to bag</span> : product.stock < 1 ? 'Out of stock' : `Add to bag — ${formatNaira(product.price * quantity)}`}</button></div>
            <p className="mt-3 text-xs text-[#6f6a60]">{product.stock} available · packed for delivery from Lagos</p>
            <div className="mt-10 grid gap-5 border-t border-[#d9cdbb] pt-6 sm:grid-cols-2"><div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#a05b35]">Ingredients</h2><p className="mt-2 text-sm leading-6 text-[#6f6a60]">{product.ingredients || 'Ingredients information coming soon.'}</p></div><div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#a05b35]">Storage</h2><p className="mt-2 text-sm leading-6 text-[#6f6a60]">{product.storage_info || 'Storage information coming soon.'}</p>{product.allergen_info && <><h2 className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#a05b35]">Allergens</h2><p className="mt-2 text-sm leading-6 text-[#6f6a60]">{product.allergen_info}</p></>}</div></div>
          </div>
        </div>
        {related.length > 0 && <section className="mt-20 border-t border-[#d9cdbb] pt-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a05b35]">Try it with</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">More from the {product.category_slug} shelf</h2><div className="mt-8 grid gap-6 sm:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} onSelect={onSelectProduct} />)}</div></section>}
      </div>
    </div>
  );
};

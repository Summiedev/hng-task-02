import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { SectionHeading } from '../components/SectionHeading.js';
import { useCart } from '../context/CartContext.js';
import { fetchJson } from '../utils/api.js';

interface ShopPageProps { initialCategory: string; initialQuery?: string; onSelectProduct: (product: Product) => void; }

const categories = [
  ['all', 'All food'], ['garri-cassava', 'Garri & cassava'], ['rice-grains', 'Rice & grains'], ['beans-legumes', 'Beans & legumes'], ['soups-swallows', 'Soups & swallows'], ['vegetables', 'Vegetables'], ['spices-seasoning', 'Spices'], ['oils', 'Oils'], ['fish-seafood', 'Fish & seafood'], ['tubers', 'Tubers'], ['drinks-breakfast', 'Breakfast & drinks'], ['pantry-essentials', 'Pantry essentials'],
];

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory, initialQuery = '', onSelectProduct }) => {
  const { wishlist } = useCart();
  const [category, setCategory] = useState(initialCategory || 'all');
  const [query, setQuery] = useState(initialQuery);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setCategory(initialCategory || 'all'); }, [initialCategory]);
  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const params = new URLSearchParams();
    if (category !== 'all' && category !== 'deals' && category !== 'wishlist') params.set('category', category);
    if (query.trim()) params.set('search', query.trim());
    if (inStock) params.set('inStock', 'true');
    params.set('sort', sort);
    fetchJson<Product[]>(`/api/products?${params}`, { signal: controller.signal }).then((data) => {
      let next = category === 'deals' ? data.filter((product) => product.price <= 5000) : data;
      if (category === 'wishlist') next = next.filter((product) => wishlist.includes(product.id));
      setProducts(next);
    }).catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message || 'We could not load the market shelf.'); }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [category, query, inStock, sort, wishlist]);

  const activeLabel = useMemo(() => categories.find(([id]) => id === category)?.[1] || (category === 'deals' ? 'Market deals' : 'Shop foodstuff'), [category]);
  const reset = () => { setCategory('all'); setQuery(''); setInStock(false); setSort('featured'); };

  return (
    <div className="min-h-screen bg-[#fffaf2] px-4 py-10 text-[#1d2a1d] sm:px-8 sm:py-16"><div className="mx-auto max-w-[1440px]">
      <SectionHeading eyebrow="Koko Market shelf" title={activeLabel} copy="Browse familiar Nigerian foodstuff with the unit and price right there on the card." />
      <div className="mt-9 rounded-[1.25rem] border border-[#e1d8c9] bg-[#fffdf8] p-3 sm:p-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Food categories">{categories.map(([id, label]) => <button type="button" key={id} onClick={() => setCategory(id)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.11em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e] ${category === id ? 'bg-[#1d2a1d] text-white' : 'bg-[#f3ecdf] text-[#677062] hover:text-[#b8472e]'}`}>{label}</button>)}<button type="button" onClick={() => setCategory('deals')} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.11em] ${category === 'deals' ? 'bg-[#b8472e] text-white' : 'bg-[#f0d3a6] text-[#74402d]'}`}>Market deals</button><button type="button" onClick={() => setCategory('wishlist')} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.11em] ${category === 'wishlist' ? 'bg-[#1d2a1d] text-white' : 'bg-[#f3ecdf] text-[#677062]'}`}>Saved ({wishlist.length})</button></div>
        <div className="mt-3 flex flex-col gap-3 border-t border-[#eee6d9] pt-3 sm:flex-row sm:items-center"><label className="relative min-w-0 flex-1"><span className="sr-only">Search the market</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8472e]" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try garri, white garri, beans, egusi…" className="w-full rounded-full border border-[#d9cfbf] bg-[#fffaf2] py-3 pl-10 pr-10 text-sm text-[#1d2a1d] outline-none placeholder:text-[#9a9589] focus:border-[#b8472e] focus:ring-2 focus:ring-[#b8472e]/15" />{query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777466]" aria-label="Clear search"><X className="h-4 w-4" aria-hidden="true" /></button>}</label><div className="flex items-center justify-between gap-3 sm:justify-end"><label className="flex items-center gap-2 text-xs font-bold text-[#677062]"><input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} className="h-4 w-4 accent-[#b8472e]" /> In stock</label><select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-[#d9cfbf] bg-[#fffaf2] px-3 py-2.5 text-xs font-bold text-[#394437] outline-none focus:border-[#b8472e]"><option value="featured">Featured</option><option value="price-asc">Lowest price</option><option value="price-desc">Highest price</option><option value="newest">Newest</option></select></div></div>
      </div>
      <div className="mt-7 flex items-center justify-between text-xs text-[#777466]"><span>{loading ? 'Checking the shelf…' : `${products.length} ${products.length === 1 ? 'food item' : 'food items'}`}</span>{(category !== 'all' || query || inStock || sort !== 'featured') && <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 font-black uppercase tracking-[0.1em] text-[#b8472e]"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Clear filters</button>}</div>
      {loading ? <div className="mt-7 grid grid-cols-1 gap-4 min-[390px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div key={item} className="aspect-[0.82] animate-pulse rounded-[1.25rem] bg-[#eee6d9]" />)}</div> : error ? <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center"><SlidersHorizontal className="h-6 w-6 text-[#b8472e]" aria-hidden="true" /><h2 className="mt-4 font-display text-3xl font-bold">The shelf took a break.</h2><p className="mt-2 text-sm text-[#777466]">{error}</p><button type="button" onClick={reset} className="mt-6 rounded-full bg-[#1d2a1d] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">Try the full market</button></div> : products.length === 0 ? <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center"><span className="text-3xl text-[#b8472e]" aria-hidden="true">⌕</span><h2 className="mt-4 font-display text-3xl font-bold">{query ? `Nothing found for “${query}”` : category === 'wishlist' ? 'No saved food yet' : 'Nothing on this shelf'}</h2><p className="mt-3 text-sm leading-6 text-[#777466]">{query ? 'Try garri, beans, egusi, palm oil or plantain.' : 'Start with the full market and find what your kitchen needs.'}</p><button type="button" onClick={reset} className="mt-6 rounded-full bg-[#b8472e] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">Shop all food</button></div> : <div className="mt-7 grid grid-cols-1 gap-4 min-[390px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}</div>}
    </div></div>
  );
};

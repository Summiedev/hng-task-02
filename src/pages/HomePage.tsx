import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';

interface HomePageProps { onSelectProduct: (product: Product) => void; onSelectCategory: (category: string) => void; onNavigateToShop: () => void; }

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct, onSelectCategory, onNavigateToShop }) => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { fetch('/api/products?sort=featured').then((response) => response.json()).then(setProducts).catch(() => setProducts([])); }, []);
  const featured = products.filter((product) => product.is_featured).slice(0, 4);

  return <div className="bg-[#fffaf2] text-[#20251e]">
    <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 pb-14 pt-8 sm:px-8 md:grid-cols-12 md:gap-10 md:pb-24 md:pt-12">
      <div className="flex flex-col justify-center md:col-span-5"><p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#a05b35]">Good things for the Nigerian kitchen.</p><h1 className="max-w-xl text-5xl font-black leading-[0.9] tracking-[-0.06em] sm:text-7xl">FROM OUR SHELF<br /><span className="text-[#a05b35]">TO YOUR TABLE.</span></h1><p className="mt-6 max-w-md text-base leading-7 text-[#6f6a60]">Small-batch pantry staples, bold spices, crunchy snacks and bright drinks, gathered in Lagos.</p><button type="button" onClick={onNavigateToShop} className="mt-8 inline-flex w-fit items-center gap-3 bg-[#20251e] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#a05b35]">Shop the pantry <ArrowRight className="h-4 w-4" /></button></div>
      <div className="relative min-h-[420px] overflow-hidden bg-[#d8b28b] md:col-span-7 md:min-h-[590px]"><img src="/images/nigeria-rice-beans-market.jpg" alt="Rice and beans at a Nigerian market" className="h-full w-full object-cover" /><div className="absolute bottom-5 left-5 bg-[#fffaf2] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#20251e]">A Lagos pantry, well stocked.</div></div>
    </section>
    <section className="border-y border-[#d9cdbb] bg-[#f0e7d8]"><div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 text-sm sm:grid-cols-3 sm:px-8"><div><p className="font-semibold">Made for everyday cooking</p></div><div><p className="font-semibold">Packed and dispatched from Lagos</p></div><div><p className="font-semibold">Food worth sharing</p></div></div></section>
    <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:py-24"><div className="mb-8 flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a05b35]">This week at Koko</p><h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">On the shelf</h2></div><button type="button" onClick={onNavigateToShop} className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] hover:text-[#a05b35] sm:flex">Shop all <ArrowRight className="h-4 w-4" /></button></div><div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}</div></section>
    <section className="bg-[#20251e] text-[#fffaf2]"><div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:items-center md:py-24"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e69a62]">Try it with</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-6xl">BUILD A BETTER PLATE.</h2><p className="mt-5 max-w-md text-base leading-7 text-[#d7dbc8]">Koko Shito with rice. Suya Spice with vegetables. Zobo over ice. Good pantry choices make the next meal easier.</p><button type="button" onClick={() => onSelectCategory('spices')} className="mt-8 inline-flex items-center gap-3 border border-[#e69a62] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#fffaf2] hover:bg-[#e69a62] hover:text-[#20251e]">Explore spices <ArrowRight className="h-4 w-4" /></button></div><img src="https://upload.wikimedia.org/wikipedia/commons/5/54/Suya.jpg" alt="Suya being prepared in Nigeria" className="aspect-[4/3] w-full object-cover" /></div></section>
  </div>;
};

import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/ProductCard.js';
import { ProductImage } from '../components/ProductImage.js';
import { SectionHeading } from '../components/SectionHeading.js';
import { formatNaira } from '../utils/formatters.js';
import { fetchJson } from '../utils/api.js';

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (category: string) => void;
  onSelectMeal: (term: string) => void;
  onNavigateToShop: () => void;
}

const categories = [
  ['garri-cassava', 'Garri & cassava', 'Soak, eba, swallow'],
  ['rice-grains', 'Rice & grains', 'For the big pot'],
  ['beans-legumes', 'Beans & legumes', 'Porridge, akara, moi moi'],
  ['soups-swallows', 'Soups & swallows', 'Egusi to yam flour'],
  ['spices-seasoning', 'Spices & seasoning', 'Crayfish, pepper, more'],
  ['oils', 'Oils', 'Palm oil and more'],
  ['vegetables', 'Vegetables', 'Fresh market picks'],
  ['tubers', 'Tubers', 'Yam, plantain, potatoes'],
];

const meals = [
  ['Jollof rice', 'rice'],
  ['Egusi soup', 'egusi'],
  ['Eba & soup', 'garri'],
  ['Beans & plantain', 'beans'],
  ['Pepper soup', 'pepper'],
  ['Yam & egg', 'yam'],
];

const market = '/images/nigeria-rice-beans-market.jpg';
const riceMarket = '/images/rice-market.jpg';
const jollofPlate = '/images/nigerian-jollof-plantain-fish.jpg';
const egusiBowl = '/images/nigerian-egusi-bowl.jpg';
const eba = '/images/nigerian-eba.jpg';
const yellowGarri = '/images/yellow-garri.jpg';
const beansMarket = '/images/nigeria-beans-market.jpg';
const plantainMarket = '/images/plantain-market.jpg';
const palmOilMarket = '/images/palm-oil-bottles.jpg';
const driedPepper = '/images/nigerian-dried-pepper.jpg';

const categoryImages: Record<string, string> = {
  'garri-cassava': yellowGarri,
  'rice-grains': riceMarket,
  'beans-legumes': beansMarket,
  'soups-swallows': egusiBowl,
  'vegetables': market,
  'spices-seasoning': driedPepper,
  'oils': palmOilMarket,
  'tubers': plantainMarket,
};

export const HomePage: React.FC<HomePageProps> = ({ onSelectProduct, onSelectCategory, onSelectMeal, onNavigateToShop }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<Product[]>('/api/products?sort=featured').then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const featured = products.filter((product) => product.is_featured).slice(0, 4);
  const deals = products.filter((product) => product.price <= 5000).slice(0, 4);

  return (
    <div className="overflow-hidden bg-[#fffaf2] text-[#1d2a1d]">
      <section className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-10 pt-7 sm:px-8 sm:pb-16 sm:pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:pb-20">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9cfbf] bg-[#fffdf8] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#566251]"><MapPin className="h-3.5 w-3.5 text-[#b8472e]" aria-hidden="true" /> Lagos / local delivery</div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b8472e]">Your trusted foodstuff market, online</p>
          <h1 className="mt-4 max-w-[12ch] font-display text-[3.8rem] font-bold leading-[0.88] tracking-[-0.065em] text-[#1d2a1d] sm:text-[5.8rem]">Wetín you wan <span className="text-[#b8472e]">cook?</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#65695d] sm:text-lg">Stock your kitchen with the garri, beans, rice, soup things and everyday essentials you already know—packed neatly and brought to your door.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={onNavigateToShop} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#b8472e] px-6 text-xs font-black uppercase tracking-[0.13em] text-white transition hover:bg-[#91341f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d2a1d]">Shop foodstuff <ArrowRight className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfc4b3] px-6 text-xs font-black uppercase tracking-[0.13em] text-[#1d2a1d] transition hover:border-[#b8472e] hover:text-[#b8472e]">Browse categories</button></div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#737469]"><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[#75916b]" aria-hidden="true" /> Familiar market units</span><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[#75916b]" aria-hidden="true" /> Clear prices</span><span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[#75916b]" aria-hidden="true" /> Lagos delivery</span></div>
        </div>
        <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[#d5c09a] sm:min-h-[520px] lg:min-h-[600px]">
          <ProductImage src="/images/nigeria-rice-beans-market.jpg" alt="A local Lagos market stall with sacks of rice and beans" className="brightness-[0.78]" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1d2a1d]/75 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f0d3a6]">Fresh from the market</p><p className="mt-2 max-w-[15ch] font-display text-3xl font-bold leading-none text-white sm:text-4xl">Your kitchen, sorted.</p></div><span className="hidden rounded-full bg-[#fff9ed] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#1d2a1d] sm:block">No market stress</span></div>
        </div>
      </section>

      <div className="border-y border-[#e5dccd] bg-[#f3ecdf]"><div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-4 py-4 text-xs sm:grid-cols-3 sm:px-8"><div className="flex items-center gap-3"><Truck className="h-5 w-5 text-[#b8472e]" aria-hidden="true" /><span><strong className="block text-[#1d2a1d]">Packed for Lagos delivery</strong><span className="text-[#777466]">Choose your area at checkout</span></span></div><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#b8472e]" aria-hidden="true" /><span><strong className="block text-[#1d2a1d]">Straightforward shopping</strong><span className="text-[#777466]">Unit, price and stock are clear</span></span></div><div className="flex items-center gap-3"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d2a1d] text-[10px] font-black text-white">₦</span><span><strong className="block text-[#1d2a1d]">Real market quantities</strong><span className="text-[#777466]">Cup, mudu, bunch, litre and more</span></span></div></div></div>

      <section id="categories" className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 sm:py-20"><SectionHeading eyebrow="Shop like you know the market" title="What’s on your list?" copy="Start with the aisle you would head to first. Everything is labelled in the units you actually use." action={<button type="button" onClick={onNavigateToShop} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#b8472e]">Shop all <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>} /><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{categories.map(([slug, name, copy]) => <button key={slug} type="button" onClick={() => onSelectCategory(slug)} className="group rounded-[1rem] border border-[#e1d8c9] bg-[#fffdf8] p-3 text-left transition hover:-translate-y-1 hover:border-[#b8a992] hover:shadow-[0_10px_25px_rgba(60,45,20,0.06)]"><div className="relative mb-3 aspect-square overflow-hidden rounded-[0.75rem] bg-[#e8dfcf]"><ProductImage src={categoryImages[slug] || market} alt={`${name} Nigerian food market`} className="opacity-85 transition duration-500 group-hover:scale-105" /><span className="absolute bottom-2 left-2 rounded-full bg-[#fff9ed]/90 px-2 py-1 text-[9px] font-black text-[#1d2a1d]">{slug.includes('garri') ? 'mudu' : slug.includes('tuber') ? 'bunch' : 'everyday'}</span></div><p className="font-display text-lg font-bold leading-none tracking-[-0.02em] text-[#1d2a1d]">{name}</p><p className="mt-1 text-[11px] leading-4 text-[#777466]">{copy}</p></button>)}</div></section>

      <section className="bg-[#1d2a1d] px-4 py-14 text-[#fff9ed] sm:px-8 sm:py-20"><div className="mx-auto max-w-[1440px]"><SectionHeading light eyebrow="No long thinking" title="What are you cooking?" copy="Tap a meal and we’ll pull the pantry list closer. You can still adjust every item before it enters your basket." /><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{meals.map(([label, term]) => { const mealImage = term === 'rice' ? jollofPlate : term === 'egusi' ? egusiBowl : term === 'garri' ? eba : term === 'beans' ? beansMarket : term === 'pepper' ? driedPepper : plantainMarket; return <button key={label} type="button" onClick={() => onSelectMeal(term)} className="group overflow-hidden rounded-[1rem] border border-[#4f624d] bg-[#263727] text-left transition hover:border-[#efad67] hover:bg-[#314632]"><div className="relative aspect-[1.35] overflow-hidden bg-[#314632]"><ProductImage src={mealImage} alt={`${label} Nigerian meal inspiration`} className="opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" /><div className="absolute inset-0 bg-gradient-to-t from-[#1d2a1d]/80 to-transparent" /><span className="absolute bottom-3 left-3 font-display text-xl font-bold leading-none text-[#fff9ed]">{label}</span></div><span className="flex items-center gap-1 px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#bfcab7] group-hover:text-[#efad67]">See ingredients <ArrowRight className="h-3 w-3" aria-hidden="true" /></span></button>; })}</div></div></section>

      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 sm:py-20"><SectionHeading eyebrow="Today’s picks" title="Good things for the pot" copy="Everyday staples and market favourites, ready when you are." action={<button type="button" onClick={onNavigateToShop} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#b8472e]">See the shelf <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>} />{loading ? <div className="mt-8 grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="aspect-[0.82] animate-pulse rounded-[1.25rem] bg-[#eee6d9]" />)}</div> : featured.length ? <div className="mt-8 grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}</div> : <p className="mt-8 rounded-[1rem] bg-[#f3ecdf] p-6 text-sm text-[#777466]">The shelf is loading. Try the shop in a moment.</p>}</section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-14 sm:px-8 sm:pb-20 lg:grid-cols-[1.15fr_0.85fr]"><div className="rounded-[1.5rem] bg-[#f0d3a6] p-6 sm:p-9"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#74402d]">Market basket</p><h2 className="mt-3 max-w-[11ch] font-display text-4xl font-bold leading-[0.9] tracking-[-0.05em] text-[#1d2a1d] sm:text-5xl">Shop like you’re telling your market seller.</h2><p className="mt-5 max-w-lg text-sm leading-6 text-[#5e513e]">“1 mudu garri, 2 cups beans, 1 bunch plantain…” Add what you need, see the full total, and review everything before checkout.</p><div className="mt-7 grid max-w-md gap-2 rounded-[1rem] bg-[#fff9ed]/70 p-4 text-sm text-[#394437]"><div className="flex justify-between"><span>White Garri · 1 mudu</span><strong>{formatNaira(850)}</strong></div><div className="flex justify-between"><span>Honey Beans · 2 cups</span><strong>{formatNaira(700)}</strong></div><div className="flex justify-between"><span>Plantain · 1 bunch</span><strong>{formatNaira(2500)}</strong></div><div className="mt-2 flex justify-between border-t border-[#d7ba8a] pt-3 font-black"><span>Total</span><span>{formatNaira(4050)}</span></div></div><button type="button" onClick={onNavigateToShop} className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#b8472e]">Start your basket <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div><div className="rounded-[1.5rem] border border-[#e1d8c9] bg-[#fffdf8] p-6 sm:p-9"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b8472e]">How it works</p><div className="mt-7 space-y-7">{[['01', 'Pick your food', 'Search or browse by what you want to cook.'], ['02', 'Choose your unit', 'Cup, mudu, bunch, litre or the size that makes sense.'], ['03', 'We pack and deliver', 'Tell us your Lagos area and we’ll take it from there.']].map(([number, title, copy]) => <div key={number} className="flex gap-4"><span className="font-display text-2xl font-bold text-[#b8472e]">{number}</span><div><h3 className="font-bold text-[#1d2a1d]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#777466]">{copy}</p></div></div>)}</div><button type="button" onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })} className="mt-8 rounded-full border border-[#cfc4b3] px-5 py-3 text-xs font-black uppercase tracking-[0.13em] text-[#1d2a1d] hover:border-[#b8472e] hover:text-[#b8472e]">Browse the market</button></div></section>

      {deals.length > 0 && <section className="border-t border-[#e5dccd] bg-[#f3ecdf] px-4 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1440px]"><SectionHeading eyebrow="Market deals" title="Under ₦5,000" copy="Good pantry restocks without the guesswork. No fake markdowns—just clear market prices." action={<button type="button" onClick={onNavigateToShop} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#b8472e]">Shop deals <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>} /><div className="mt-8 grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 lg:grid-cols-4">{deals.map((product) => <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />)}</div></div></section>}
    </div>
  );
};

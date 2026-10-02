import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps { onNavigate: (page: string, param?: string) => void; currentPage: string; onOpenSearch: () => void; }

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenSearch }) => {
  const { itemCount, openCart } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const categories = [['pantry', 'Pantry'], ['spices', 'Spices'], ['snacks', 'Snacks'], ['breakfast', 'Breakfast'], ['drinks', 'Drinks']];
  const go = (page: string, category?: string) => { setOpen(false); onNavigate(page, category); };

  return (
    <header className="sticky top-0 z-40 border-b border-[#d9cdbb] bg-[#fffaf2]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#20251e] lg:hidden"><Menu className="h-5 w-5" /> Menu</button>
        <nav className="hidden items-center gap-6 lg:flex">{categories.map(([slug, label]) => <button key={slug} type="button" onClick={() => go('shop', slug)} className={`text-xs font-bold uppercase tracking-[0.13em] transition hover:text-[#a05b35] ${currentPage === `shop-${slug}` ? 'text-[#a05b35]' : 'text-[#20251e]'}`}>{label}</button>)}</nav>
        <button type="button" onClick={() => go('home')} className="text-center text-[#20251e]"><span className="block text-xl font-black tracking-[0.2em] sm:text-2xl">KOKO MARKET</span><span className="block text-[9px] font-bold uppercase tracking-[0.27em] text-[#a05b35]">Lagos Pantry &amp; Provisions</span></button>
        <div className="flex items-center gap-3 sm:gap-5"><button type="button" onClick={onOpenSearch} aria-label="Search food" className="text-[#20251e] hover:text-[#a05b35]"><Search className="h-5 w-5" /></button><button type="button" onClick={() => go('account')} aria-label="Account" className="hidden text-[#20251e] hover:text-[#a05b35] sm:block"><User className="h-5 w-5" /></button><button type="button" onClick={openCart} aria-label="Open bag" className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.13em] text-[#20251e] hover:text-[#a05b35]"><ShoppingBag className="h-5 w-5" /><span className="hidden sm:inline">Bag</span><span>({itemCount})</span></button></div>
      </div>
      {open && <div className="fixed inset-0 z-50 bg-[#20251e] p-6 text-[#fffaf2] sm:p-10"><div className="flex items-center justify-between border-b border-[#66705c] pb-5"><span className="text-lg font-black tracking-[0.18em]">KOKO MARKET</span><button type="button" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-6 w-6" /></button></div><div className="mx-auto flex max-w-xl flex-col gap-5 py-12">{categories.map(([slug, label]) => <button key={slug} type="button" onClick={() => go('shop', slug)} className="border-b border-[#66705c] pb-4 text-left text-3xl font-semibold hover:text-[#e69a62]">{label}</button>)}<button type="button" onClick={() => go('shop')} className="border-b border-[#66705c] pb-4 text-left text-3xl font-semibold hover:text-[#e69a62]">Shop all</button><button type="button" onClick={() => go('about')} className="border-b border-[#66705c] pb-4 text-left text-3xl font-semibold hover:text-[#e69a62]">Our pantry</button><p className="pt-6 text-sm text-[#d7dbc8]">{user ? `Welcome back, ${user.name}.` : 'Small-batch pantry goods, packed in Lagos.'}</p></div></div>}
    </header>
  );
};

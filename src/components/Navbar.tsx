import React, { useEffect, useRef, useState } from 'react';
import { Menu, Search, ShoppingBasket, UserRound, X } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps { onNavigate: (page: string, param?: string) => void; currentPage: string; onOpenSearch: () => void; }

const menuItems: Array<[string, string, string?]> = [
  ['Home', 'home'],
  ['Shop foodstuff', 'shop'],
  ['Categories', 'shop'],
  ['Market deals', 'shop', 'deals'],
  ['How it works', 'about'],
  ['Orders', 'account'],
  ['Account', 'account'],
];

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenSearch }) => {
  const { itemCount, openCart } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab' && drawer.current) {
        const focusable = Array.from(drawer.current.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'));
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      menuTrigger.current?.focus();
    };
  }, [open]);

  const go = (page: string, param?: string) => { setOpen(false); onNavigate(page, param); };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e1d8c9] bg-[#fffaf2]/95 backdrop-blur-xl">
        <div className="hidden border-b border-[#e9e0d2] bg-[#1d2a1d] px-5 py-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#f0d3a6] sm:block">Lagos delivery · Fresh pantry staples · A market basket that makes sense</div>
        <div className="mx-auto flex h-[4.6rem] max-w-[1440px] items-center gap-3 px-4 sm:h-[5.2rem] sm:px-8 lg:gap-8">
          <button ref={menuTrigger} type="button" onClick={() => setOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9cfbf] text-[#1d2a1d] lg:hidden" aria-label="Open menu" aria-expanded={open}>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <button type="button" onClick={() => go('home')} className="group shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e] lg:w-[13rem]">
            <span className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-[0.65rem] bg-[#b8472e] font-display text-lg font-bold text-white">K</span><span className="font-display text-[1.55rem] font-bold tracking-[-0.05em] text-[#1d2a1d] sm:text-[1.8rem]">KOKO</span></span>
            <span className="hidden pl-10 text-[9px] font-black uppercase tracking-[0.2em] text-[#7b776d] sm:block">Market · Lagos foodstuff</span>
          </button>

          <button type="button" onClick={onOpenSearch} className="hidden min-w-0 flex-1 items-center gap-3 rounded-full border border-[#d9cfbf] bg-[#fffdf8] px-4 py-3 text-left text-sm text-[#8a867b] transition hover:border-[#b8a992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e] md:flex" aria-label="Search the market">
            <Search className="h-4 w-4 text-[#b8472e]" aria-hidden="true" /><span className="truncate">Search garri, beans, egusi, palm oil…</span><span className="ml-auto hidden rounded-full bg-[#f0e8db] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#777466] lg:block">Search</span>
          </button>

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary navigation">
            <button type="button" onClick={() => go('shop')} className={`text-xs font-black uppercase tracking-[0.12em] transition hover:text-[#b8472e] ${currentPage.startsWith('shop') ? 'text-[#b8472e]' : 'text-[#394437]'}`}>Shop</button>
            <button type="button" onClick={() => go('shop', 'deals')} className="text-xs font-black uppercase tracking-[0.12em] text-[#394437] transition hover:text-[#b8472e]">Deals</button>
            <button type="button" onClick={() => go('about')} className="text-xs font-black uppercase tracking-[0.12em] text-[#394437] transition hover:text-[#b8472e]">How it works</button>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={onOpenSearch} className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[#1d2a1d] hover:border-[#d9cfbf] md:hidden" aria-label="Search food"><Search className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => go('account')} className="hidden h-10 items-center gap-2 rounded-full border border-transparent px-3 text-[#1d2a1d] hover:border-[#d9cfbf] sm:flex" aria-label={user ? 'Open your account' : 'Sign in'}><UserRound className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" /><span className="hidden text-xs font-black uppercase tracking-[0.1em] lg:inline">{user ? 'Account' : 'Sign in'}</span></button>
            <button type="button" onClick={openCart} className="relative flex h-10 items-center gap-2 rounded-full bg-[#1d2a1d] px-3.5 text-white transition hover:bg-[#b8472e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e]" aria-label={`Open market basket, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}><ShoppingBasket className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" /><span className="hidden text-xs font-black uppercase tracking-[0.1em] sm:inline">Basket</span><span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f0d3a6] px-1 text-[10px] font-black text-[#1d2a1d]">{itemCount}</span></button>
          </div>
        </div>
        <div className="mx-auto max-w-[1440px] px-4 pb-3 md:hidden"><button type="button" onClick={onOpenSearch} className="flex w-full items-center gap-3 rounded-full border border-[#d9cfbf] bg-[#fffdf8] px-4 py-2.5 text-left text-sm text-[#8a867b]" aria-label="Search the market"><Search className="h-4 w-4 text-[#b8472e]" aria-hidden="true" />Search garri, beans, egusi…</button></div>
      </header>

      {open && <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Koko Market menu">
        <button type="button" className="absolute inset-0 h-full w-full bg-[#1d2a1d]/60" onClick={() => setOpen(false)} aria-label="Close menu overlay" />
        <aside ref={drawer} className="relative ml-auto flex h-full w-[min(88vw,390px)] flex-col overflow-y-auto bg-[#fff9ed] p-5 shadow-2xl sm:p-7">
          <div className="flex items-center justify-between border-b border-[#dfd5c5] pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b8472e]">Koko Market</p><p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-[#1d2a1d]">Wetín you wan cook?</p></div><button ref={closeButton} type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cfbf] text-[#1d2a1d]" aria-label="Close menu"><X className="h-5 w-5" aria-hidden="true" /></button></div>
          <nav className="mt-7 flex flex-col" aria-label="Mobile navigation">{menuItems.map(([label, page, param], index) => <button key={`${label}-${index}`} type="button" onClick={() => go(page, param)} className="flex items-center justify-between border-b border-[#e5dccd] py-4 text-left text-lg font-bold text-[#1d2a1d] transition hover:text-[#b8472e]">{label}<span className="text-[#b8472e]">↗</span></button>)}</nav>
          <div className="mt-auto rounded-[1.1rem] bg-[#e9efe3] p-4 text-sm leading-6 text-[#42513f]"><p className="font-black text-[#1d2a1d]">{user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Lagos, your kitchen is sorted.'}</p><p className="mt-1">Browse everyday foodstuff, choose your unit, and we’ll pack your market basket.</p></div>
        </aside>
      </div>}
    </>
  );
};

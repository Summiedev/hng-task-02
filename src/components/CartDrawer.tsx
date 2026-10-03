import React, { useEffect, useRef } from 'react';
import { ArrowRight, ShoppingBasket, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { formatNaira } from '../utils/formatters.js';
import { ProductImage } from './ProductImage.js';
import { QuantitySelector } from './QuantitySelector.js';

interface CartDrawerProps { onNavigateToCheckout: () => void; onNavigateToShop: () => void; }

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCheckout, onNavigateToShop }) => {
  const { isCartOpen, closeCart, items, itemCount, subtotal, deliveryFee, total, removeFromCart, updateQuantity } = useCart();
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isCartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', closeOnEscape); };
  }, [isCartOpen, closeCart]);

  return <>{isCartOpen && <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your market basket">
    <button type="button" onClick={closeCart} className="absolute inset-0 h-full w-full bg-[#1d2a1d]/65" aria-label="Close market basket" />
    <aside className="absolute right-0 top-0 flex h-full w-full max-w-[31rem] flex-col bg-[#fff9ed] text-[#1d2a1d] shadow-2xl">
      <div className="flex items-start justify-between border-b border-[#dfd5c5] bg-[#f3ecdf] p-5 sm:p-7"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b8472e]">Your market basket</p><h2 className="mt-2 font-display text-4xl font-bold leading-none tracking-[-0.05em]">Kitchen, sorted.</h2><p className="mt-2 text-sm text-[#777466]">{itemCount} {itemCount === 1 ? 'item' : 'items'} ready for review</p></div><button ref={closeButton} type="button" onClick={closeCart} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d2c7b6]" aria-label="Close market basket"><X className="h-5 w-5" aria-hidden="true" /></button></div>
      <div className="flex-1 overflow-y-auto p-5 sm:p-7">{items.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0d3a6] text-[#b8472e]"><ShoppingBasket className="h-7 w-7" aria-hidden="true" /></div><h3 className="mt-5 font-display text-3xl font-bold">Your market basket is empty.</h3><p className="mt-2 max-w-xs text-sm leading-6 text-[#777466]">Start adding your kitchen essentials and we’ll keep the list tidy.</p><button type="button" onClick={() => { closeCart(); onNavigateToShop(); }} className="mt-6 rounded-full bg-[#b8472e] px-5 py-3 text-xs font-black uppercase tracking-[0.13em] text-white">Shop foodstuff</button></div> : <div className="space-y-3">{items.map(({ product, quantity, selectedSize, unitPrice }) => <div key={`${product.id}-${selectedSize}`} className="rounded-[1rem] border border-[#e1d8c9] bg-[#fffdf8] p-3"><div className="flex gap-3"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-[0.7rem] bg-[#e8dfcf]"><ProductImage src={product.image} alt={product.name} className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold text-[#1d2a1d]">{product.name}</h3><p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#b8472e]">{selectedSize || product.weight}</p></div><button type="button" onClick={() => removeFromCart(product.id, selectedSize)} className="text-[#827a6e] hover:text-[#b8472e]" aria-label={`Remove ${product.name}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div><div className="mt-3 flex items-center justify-between gap-3"><QuantitySelector value={quantity} onChange={(value) => updateQuantity(product.id, value, selectedSize)} max={product.stock} label={`${product.name} quantity`} compact /><span className="font-black">{formatNaira((unitPrice || product.price) * quantity)}</span></div></div></div></div>)}</div>}</div>
      {items.length > 0 && <div className="border-t border-[#dfd5c5] bg-[#f3ecdf] p-5 sm:p-7"><div className="space-y-2 text-sm"><div className="flex justify-between text-[#777466]"><span>Foodstuff subtotal</span><span className="font-bold text-[#1d2a1d]">{formatNaira(subtotal)}</span></div><div className="flex justify-between text-[#777466]"><span>Lagos delivery estimate</span><span>{formatNaira(deliveryFee)}</span></div><div className="flex justify-between border-t border-[#d8cbb9] pt-3 text-lg font-black"><span>Total</span><span>{formatNaira(total)}</span></div></div><button type="button" onClick={() => { closeCart(); onNavigateToCheckout(); }} className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#1d2a1d] px-5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#b8472e]">Review basket <ArrowRight className="h-4 w-4" aria-hidden="true" /></button><p className="mt-3 text-center text-[11px] text-[#777466]">Delivery fee is confirmed by area at checkout.</p></div>}
    </aside>
  </div>}</>;
};

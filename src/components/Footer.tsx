import React from 'react';

interface FooterProps { onNavigate: (page: string, param?: string) => void; }

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => (
  <footer className="border-t border-[#d9cdbb] bg-[#20251e] text-[#fffaf2]">
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 md:grid-cols-3">
      <div><div className="text-2xl font-black tracking-[0.18em]">KOKO MARKET</div><p className="mt-4 max-w-xs text-sm leading-6 text-[#d7dbc8]">A Lagos pantry for sauces, spices, snacks, grains and good things to keep on the shelf.</p><p className="mt-5 text-xs uppercase tracking-[0.14em] text-[#e69a62]">Lagos, Nigeria</p></div>
      <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#e69a62]">Shop the shelf</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#d7dbc8]">{['pantry', 'spices', 'snacks', 'breakfast', 'drinks'].map((category) => <button key={category} type="button" onClick={() => onNavigate('shop', category)} className="text-left capitalize hover:text-white">{category}</button>)}</div></div>
      <div><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#e69a62]">Need a hand?</h2><div className="mt-4 space-y-3 text-sm text-[#d7dbc8]"><button type="button" onClick={() => onNavigate('about')} className="block hover:text-white">About Koko</button><button type="button" onClick={() => onNavigate('account')} className="block hover:text-white">Account &amp; orders</button><p>hello@kokomarket.ng</p></div></div>
    </div>
    <div className="border-t border-[#66705c] px-5 py-5 text-center text-xs text-[#aeb7a1]">© {new Date().getFullYear()} KOKO MARKET — Lagos Pantry &amp; Provisions</div>
  </footer>
);

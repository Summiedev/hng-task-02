import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { fetchJson } from '../utils/api.js';
import { Order } from '../types/index.js';
import { formatDate, formatNaira } from '../utils/formatters.js';

interface AccountPageProps {
  onSelectOrder: (order: Order) => void;
  onNavigateToShop: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AccountPage: React.FC<AccountPageProps> = ({ onSelectOrder, onNavigateToShop }) => {
  const {
    user,
    token,
    isLoading,
    authConfigLoading,
    authConfigError,
    error,
    googleClientId,
    supabaseEnabled,
    loginWithGoogleCredential,
    signInWithGoogle,
    logout,
    retryAuthConfiguration,
  } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [googleIdentityReady, setGoogleIdentityReady] = useState(Boolean(window.google?.accounts?.id));
  const googleButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const markGoogleReady = () => setGoogleIdentityReady(Boolean(window.google?.accounts?.id));
    if (window.google?.accounts?.id) return;

    const script = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    script?.addEventListener('load', markGoogleReady);
    return () => script?.removeEventListener('load', markGoogleReady);
  }, []);

  useEffect(() => {
    if (!user && googleClientId && googleIdentityReady && googleButton.current && window.google?.accounts?.id) {
      googleButton.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential?: string }) => {
          if (response.credential) void loginWithGoogleCredential(response.credential);
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
      });
    }
  }, [googleClientId, googleIdentityReady, loginWithGoogleCredential, user]);

  useEffect(() => {
    if (!user || !token) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    fetchJson<Order[]>('/api/orders/mine', { headers: { Authorization: `Bearer ${token}` } })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [user, token]);

  if (isLoading || authConfigLoading) {
    return <div className="min-h-screen bg-[#fffaf2] py-28 text-center text-sm text-[#777466]">Preparing secure Google sign-in…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fffaf2] px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-md rounded-[1.5rem] border border-[#e1d8c9] bg-[#fffdf8] p-7 text-center shadow-[0_18px_50px_rgba(60,45,20,0.06)] sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b8472e]">Koko account</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.05em]">Your orders, in one place.</h1>
          <p className="mt-4 text-sm leading-6 text-[#777466]">Sign in to see your market baskets and delivery details.</p>
          {error && <div className="mt-5 flex gap-2 rounded-[0.7rem] border border-[#e0a08d] bg-[#f8e2d8] p-3 text-left text-xs text-[#8d3b27]" role="alert"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {authConfigError ? (
            <div className="mt-6 rounded-[0.7rem] border border-[#e1d8c9] bg-[#f3ecdf] p-4">
              <p className="text-sm text-[#5f625a]">{authConfigError}</p>
              <button type="button" onClick={retryAuthConfiguration} className="mt-4 min-h-11 rounded-full border border-[#1d2a1d] px-5 text-xs font-black uppercase tracking-[0.12em] text-[#1d2a1d]">Retry Google sign-in</button>
            </div>
          ) : googleClientId ? (
            <div className="mt-6 min-h-12" aria-label="Continue with Google">
              {googleIdentityReady ? <div ref={googleButton} className="flex justify-center" /> : <p className="py-3 text-sm text-[#777466]">Loading Google sign-in…</p>}
            </div>
          ) : supabaseEnabled ? (
            <button type="button" onClick={() => void signInWithGoogle()} className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#1d2a1d] px-4 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#b8472e]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-[#4285f4]">G</span>
              Continue with Google
            </button>
          ) : (
            <div className="mt-6 rounded-[0.7rem] border border-[#e1d8c9] bg-[#f3ecdf] p-4 text-sm text-[#5f625a]" role="alert">Secure Google sign-in is unavailable. Refresh this page and try again.</div>
          )}
          <p className="mt-6 text-xs text-[#777466]">Your account helps us keep your order history together.</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-[#fffaf2] px-4 py-10 text-[#1d2a1d] sm:px-8 sm:py-16"><div className="mx-auto max-w-[1200px]"><div className="flex flex-col justify-between gap-5 border-b border-[#e1d8c9] pb-8 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b8472e]">Koko account</p><h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-[-0.06em]">Hello, {user.name.split(' ')[0]}.</h1><p className="mt-2 text-sm text-[#777466]">{user.email}</p></div><button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#777466] hover:text-[#b8472e]"><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button></div><section className="mt-10"><div className="flex items-center gap-3"><Package className="h-5 w-5 text-[#b8472e]" aria-hidden="true" /><h2 className="font-display text-3xl font-bold">Order history</h2></div>{loadingOrders ? <p className="py-12 text-sm text-[#777466]">Loading your market baskets…</p> : orders.length === 0 ? <div className="mt-5 rounded-[1rem] bg-[#f3ecdf] p-6"><p className="text-sm text-[#777466]">No market baskets yet.</p><button type="button" onClick={onNavigateToShop} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#b8472e] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">Shop foodstuff <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div> : <div className="mt-6 divide-y divide-[#e1d8c9] overflow-hidden rounded-[1rem] border border-[#e1d8c9] bg-[#fffdf8]">{orders.map((order) => <button type="button" key={order.id} onClick={() => onSelectOrder(order)} className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-[#f3ecdf]"><span><strong className="block">Order {order.order_number}</strong><span className="mt-1 block text-sm text-[#777466]">{formatDate(order.created_at)} · {order.items.length} items</span></span><span className="font-black">{formatNaira(order.total)}</span></button>)}</div>}</section></div></div>;
};

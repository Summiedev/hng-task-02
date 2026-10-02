import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { SearchModal } from './components/SearchModal.js';
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { Order, Product } from './types/index.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle URL hash changes for easy browser back/forward and deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === 'home') {
        setCurrentPage('home');
      } else if (hash.startsWith('shop')) {
        const parts = hash.split('/');
        setCurrentPage('shop');
        setCurrentCategory(parts[1] || 'all');
      } else if (hash.startsWith('product/')) {
        const slug = hash.split('/')[1];
        if (slug) {
          fetch(`/api/products/${slug}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((prod) => {
              if (prod) {
                setSelectedProduct(prod);
                setCurrentPage('product');
              }
            })
            .catch(() => {});
        }
      } else if (hash === 'checkout') {
        setCurrentPage('checkout');
      } else if (hash === 'account') {
        setCurrentPage('account');
      } else if (hash === 'about') {
        setCurrentPage('about');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'home') {
      window.location.hash = '#home';
      setCurrentPage('home');
    } else if (page === 'shop') {
      const cat = param || 'all';
      setCurrentCategory(cat);
      window.location.hash = cat !== 'all' ? `#shop/${cat}` : '#shop';
      setCurrentPage('shop');
    } else if (page === 'checkout') {
      window.location.hash = '#checkout';
      setCurrentPage('checkout');
    } else if (page === 'account') {
      window.location.hash = '#account';
      setCurrentPage('account');
    } else if (page === 'about') {
      window.location.hash = '#about';
      setCurrentPage('about');
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    window.location.hash = `#product/${product.slug}`;
    setCurrentPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageKey = () => {
    if (currentPage === 'home') return 'home';
    if (currentPage === 'shop') return `shop-${currentCategory}`;
    if (currentPage === 'product') return `product-${selectedProduct?.id || 'item'}`;
    if (currentPage === 'checkout') return 'checkout';
    if (currentPage === 'order-confirmation') return `order-${confirmedOrder?.id || 'success'}`;
    if (currentPage === 'account') return 'account';
    if (currentPage === 'about') return 'about';
    return currentPage;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#fffaf2] text-[#20251e] selection:bg-[#a05b35] selection:text-[#fffaf2]">
          
          {/* Main navigation */}
          <Navbar
            currentPage={currentPage === 'shop' && currentCategory !== 'all' ? `shop-${currentCategory}` : currentPage}
            onNavigate={(page, param) => navigateTo(page, param)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Page transitions */}
          <main className="flex-1 overflow-x-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={getPageKey()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {currentPage === 'home' && (
                  <HomePage
                    onSelectProduct={handleSelectProduct}
                    onSelectCategory={(cat) => navigateTo('shop', cat)}
                    onNavigateToShop={() => navigateTo('shop')}
                  />
                )}

                {currentPage === 'shop' && (
                  <ShopPage
                    initialCategory={currentCategory}
                    onSelectProduct={handleSelectProduct}
                  />
                )}

                {currentPage === 'product' && selectedProduct && (
                  <ProductDetailPage
                    product={selectedProduct}
                    onBack={() => navigateTo('shop')}
                    onSelectProduct={handleSelectProduct}
                  />
                )}

                {currentPage === 'checkout' && (
                  <CheckoutPage
                    onBackToShop={() => navigateTo('shop')}
                    onOrderSuccess={handleOrderSuccess}
                  />
                )}

                {currentPage === 'order-confirmation' && confirmedOrder && (
                  <OrderConfirmationPage
                    order={confirmedOrder}
                    onNavigateToShop={() => navigateTo('shop')}
                    onNavigateToAccount={() => navigateTo('account')}
                  />
                )}

                {currentPage === 'account' && (
                  <AccountPage
                    onSelectOrder={(order) => {
                      setConfirmedOrder(order);
                      setCurrentPage('order-confirmation');
                    }}
                    onNavigateToShop={() => navigateTo('shop')}
                  />
                )}

                {currentPage === 'about' && (
                  <AboutPage onNavigateToShop={() => navigateTo('shop')} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Cart drawer */}
          <CartDrawer
            onNavigateToCheckout={() => navigateTo('checkout')}
            onNavigateToShop={() => navigateTo('shop')}
          />

          {/* Search modal */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={(cat) => navigateTo('shop', cat)}
          />

          {/* Footer */}
          <Footer onNavigate={(page, param) => navigateTo(page, param)} />

        </div>
      </CartProvider>
    </AuthProvider>
  );
}

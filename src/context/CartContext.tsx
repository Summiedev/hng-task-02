import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types/index.js';

interface CartContextType {
  items: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string
  ) => { success: boolean; message?: string };
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  subtotal: number;
  itemCount: number;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'koko_market_food_cart_v1';
const WISHLIST_KEY = 'koko_market_food_wishlist_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading cart from localStorage', e);
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading wishlist from localStorage', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(2500);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed saving cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed saving wishlist to localStorage', e);
    }
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string
  ): { success: boolean; message?: string } => {
    if (product.stock <= 0) {
      return { success: false, message: `${product.name} is currently out of stock.` };
    }

    let message: string | undefined;
    let success = true;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > product.stock) {
          message = `Only ${product.stock} units of ${product.name} are available.`;
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], quantity: product.stock };
          return updated;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(quantity, product.stock);
        if (quantity > product.stock) {
          message = `Only ${product.stock} units are available.`;
        }
        return [
          ...prev,
          {
            product,
            quantity: initialQty,
            selectedSize: undefined,
            selectedColor: undefined,
          },
        ];
      }
    });

    setIsCartOpen(true);
    return { success, message };
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && (!selectedSize || item.selectedSize === selectedSize))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && (!selectedSize || item.selectedSize === selectedSize)) {
          const validQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        wishlist,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        openCart,
        closeCart,
        toggleCart,
        subtotal,
        itemCount,
        deliveryFee,
        setDeliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

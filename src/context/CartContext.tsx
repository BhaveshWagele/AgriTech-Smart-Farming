import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.tsx';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  totalAmount: 0,
  isOpen: false,
  setIsOpen: () => {},
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {}
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const refreshCart = async () => {
    if (!isAuthenticated || !token) {
      setItems([]);
      return;
    }

    try {
      const res = await fetch('/api/marketplace/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data && data.data.items) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.warn('Failed to fetch cart', err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [token, isAuthenticated]);

  const addToCart = async (product: any, quantity = 1) => {
    if (!isAuthenticated || !token) {
      // Local fallback for guest
      setItems(prev => {
        const existing = prev.find(i => i.productId === product._id);
        if (existing) {
          return prev.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          unit: product.unit
        }];
      });
      setIsOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/marketplace/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id, quantity })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.items) {
        setItems(data.data.items);
      }
      setIsOpen(true);
    } catch (err) {
      console.error('Add to cart failed', err);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!token) {
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i).filter(i => i.quantity > 0));
      return;
    }

    try {
      const res = await fetch('/api/marketplace/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.items) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error('Update cart failed', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!token) {
      setItems(prev => prev.filter(i => i.productId !== productId));
      return;
    }

    try {
      const res = await fetch('/api/marketplace/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.items) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error('Remove from cart failed', err);
    }
  };

  const clearCart = async () => {
    if (!token) {
      setItems([]);
      return;
    }

    try {
      await fetch('/api/marketplace/cart/clear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems([]);
    } catch (err) {
      console.error('Clear cart failed', err);
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isOpen,
        setIsOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

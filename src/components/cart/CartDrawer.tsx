import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal.tsx';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-800" />
            <h2 className="font-bold text-neutral-900 text-base">Agricultural Cart</h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
              {items.length} items
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mb-3" />
              <p className="font-semibold text-neutral-700 text-sm">Your cart is empty</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Explore our marketplace for certified seeds, organic fertilizers, and irrigation equipment.
              </p>
            </div>
          ) : (
            items.map(item => (
              <div 
                key={item.productId}
                className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 flex gap-3 items-center"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover bg-neutral-200 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-900 truncate">{item.name}</h4>
                  <div className="text-[11px] text-neutral-500">{item.unit}</div>
                  <div className="text-xs font-bold text-emerald-900 mt-1 font-mono">
                    ₹{item.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-neutral-200 rounded-lg bg-white overflow-hidden shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-semibold font-mono tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/70 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-bold text-neutral-900 font-mono tabular-nums text-sm">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Standard Delivery (Agri-Express)</span>
              <span className="font-semibold text-emerald-700">Free</span>
            </div>
            <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between">
              <span className="font-bold text-neutral-900 text-sm">Estimated Total</span>
              <span className="font-extrabold text-emerald-900 text-base font-mono tabular-nums">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={clearCart}
                className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200/60 rounded-xl transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  setShowCheckout(true);
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Proceed to Demo Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal 
          onClose={() => setShowCheckout(false)} 
          onSuccess={() => {
            setShowCheckout(false);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
};

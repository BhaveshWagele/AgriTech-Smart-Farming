import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { X, CheckCircle2, ShieldCheck, MapPin, Truck } from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const { totalAmount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || 'Ramesh Patel',
    phone: user?.phone || '+91 98765 43210',
    state: user?.state || 'Maharashtra',
    district: user?.district || 'Nashik',
    village: user?.village || 'Ozar',
    address: 'Plot 42, Godavari Shivar Road',
    pincode: '422206',
    paymentMethod: 'Cash on Delivery (Demo)'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress: formData,
          paymentMethod: formData.paymentMethod
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setOrderResult(data.data);
        await clearCart();
      } else {
        setError(data.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-neutral-900 text-lg">
              {orderResult ? 'Order Confirmed!' : 'Agri-Store Demo Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-neutral-900">
                Thank you for your order!
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Your agricultural supplies order has been verified and sent for dispatch.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Number:</span>
                <span className="font-mono font-bold text-neutral-900">{orderResult.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tracking Number:</span>
                <span className="font-mono font-semibold text-emerald-800">{orderResult.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimated Delivery:</span>
                <span className="font-medium text-neutral-900">{orderResult.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Status:</span>
                <span className="font-semibold text-amber-700">{orderResult.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-sm">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-950">₹{orderResult.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Back to Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Farm Delivery Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Farmer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Delivery Address / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Plot number, canal branch, or landmark"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-700">
                Payment Option (Demo Gateway)
              </label>
              <div className="space-y-2">
                {[
                  { id: 'Cash on Delivery (Demo)', label: 'Cash on Delivery at Farm Gate' },
                  { id: 'Kisan Credit Card (Demo)', label: 'Kisan Credit Card (KCC) Micro-Credit' },
                  { id: 'UPI (Demo)', label: 'Instant UPI / QR Code' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 p-2.5 border rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      formData.paymentMethod === opt.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === opt.id}
                      onChange={() => setFormData({ ...formData, paymentMethod: opt.id })}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Total and Submit */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-neutral-500">Order Payable Amount</div>
                <div className="text-base font-extrabold text-emerald-950 font-mono">
                  ₹{totalAmount.toLocaleString()}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm Demo Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

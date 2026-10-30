import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Star,
  Check,
  Truck,
  Package,
  Clock,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Seeds',
  'Fertilizers',
  'Farming Equipment',
  'Irrigation Equipment',
  'Organic Products',
  'Pesticides'
] as const;

export const MarketplacePage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const { t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'shop' | 'orders'>('shop');
  const [addedId, setAddedId] = useState<string | null>(null);

  const fetchMarketplace = async () => {
    try {
      setLoading(true);
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/marketplace/products').then(r => r.json()),
        fetch('/api/marketplace/orders', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      if (prodRes.success && prodRes.data) setProducts(prodRes.data);
      if (ordRes.success && ordRes.data) setOrders(ordRes.data);
    } catch (err) {
      console.warn('Error fetching marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, [token]);

  const handleAddToCart = async (prod: any) => {
    await addToCart(prod, 1);
    setAddedId(prod._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t('nav_marketplace')} & Inputs Store
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Order certified seeds, bio-fertilizers, solar drip kits, and protective agro-chemicals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('shop')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              viewMode === 'shop' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            Browse Products
          </button>
          <button
            onClick={() => setViewMode('orders')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'orders' ? 'bg-emerald-900 text-white shadow-xs' : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Order History ({orders.length})</span>
          </button>
        </div>
      </div>

      {viewMode === 'shop' ? (
        <>
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3">
              <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by brand, chemical active, or crop..."
                className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-neutral-400 hover:text-neutral-700">
                  Clear
                </button>
              )}
            </div>

            {/* Category Segmented Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 bg-white rounded-2xl border border-neutral-200 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-base">No Products Found</h3>
              <p className="text-xs text-neutral-500">
                No agricultural inputs match your current search and filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map(prod => (
                <div
                  key={prod._id}
                  className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold bg-white/90 backdrop-blur-xs text-emerald-900 rounded-md shadow-xs">
                        {prod.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-semibold text-neutral-600">{prod.brand}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{prod.rating}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">({prod.reviewsCount})</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-neutral-900 group-hover:text-emerald-900 transition-colors line-clamp-1">
                        {prod.name}
                      </h3>

                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      <div className="text-[11px] text-neutral-600">
                        Package: <strong className="text-neutral-800">{prod.unit}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Price and Add To Cart */}
                  <div className="p-4 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-neutral-900 font-mono">
                        ₹{prod.price.toLocaleString()}
                      </div>
                      {prod.originalPrice > prod.price && (
                        <div className="text-[10px] text-neutral-400 line-through font-mono">
                          ₹{prod.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        addedId === prod._id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-900 hover:bg-emerald-800 text-white shadow-xs'
                      }`}
                    >
                      {addedId === prod._id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Order History View */
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
              <Package className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-base">No Orders Yet</h3>
              <p className="text-xs text-neutral-500">
                You haven't placed any demo supply orders yet.
              </p>
              <button
                onClick={() => setViewMode('shop')}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Browse Agri-Store
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order._id}
                  className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900 text-sm font-mono">
                          Order #{order.orderNumber}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} · Tracking: <strong className="font-mono text-emerald-800">{order.trackingNumber}</strong>
                      </div>
                    </div>

                    <div className="text-right self-start sm:self-auto">
                      <div className="text-base font-extrabold text-neutral-900 font-mono">
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-neutral-500">{order.paymentMethod}</div>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900 truncate">{item.name}</div>
                          <div className="text-[11px] text-neutral-500">
                            Qty: <strong className="font-mono">{item.quantity}</strong> × ₹{item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Estimated Farm Delivery: <strong className="text-neutral-900">{order.estimatedDelivery}</strong></span>
                    </div>
                    <span>Destination: {order.shippingAddress?.village}, {order.shippingAddress?.district}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

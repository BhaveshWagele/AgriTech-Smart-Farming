import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest, authorizeRoles } from '../middleware/auth.ts';

const router = express.Router();

// Get Products
router.get('/products', (req, res) => {
  try {
    const { category, search, inStock } = req.query;
    let products = db.products.all();

    if (category && category !== 'All') {
      products = products.filter((p: any) => p.category === category);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      products = products.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (inStock === 'true') {
      products = products.filter((p: any) => p.inStock);
    }

    return res.json({ success: true, count: products.length, data: products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get Single Product
router.get('/products/:id', (req, res) => {
  const product = db.products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  return res.json({ success: true, data: product });
});

// Admin Add Product
router.post('/products', authenticate, authorizeRoles('Admin'), (req, res) => {
  try {
    const { name, category, brand, price, originalPrice, unit, stock, description, features, imageUrl } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
    }

    const newProduct = db.products.create({
      name: name.trim(),
      category,
      brand: brand || 'AgriTech Agro',
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      unit: unit || '1 Unit',
      stock: Number(stock || 50),
      rating: 4.8,
      reviewsCount: 1,
      description: description || '',
      features: Array.isArray(features) ? features : [features].filter(Boolean),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
      inStock: Number(stock || 50) > 0
    });

    return res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Update Product
router.put('/products/:id', authenticate, authorizeRoles('Admin'), (req, res) => {
  const product = db.products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const updated = db.products.findByIdAndUpdate(req.params.id, {
    ...req.body,
    inStock: req.body.stock !== undefined ? Number(req.body.stock) > 0 : product.inStock
  });

  return res.json({ success: true, message: 'Product updated', data: updated });
});

// Admin Delete Product
router.delete('/products/:id', authenticate, authorizeRoles('Admin'), (req, res) => {
  const product = db.products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  db.products.findByIdAndDelete(req.params.id);
  return res.json({ success: true, message: 'Product deleted' });
});

// Get User Cart
router.get('/cart', authenticate, (req: AuthenticatedRequest, res) => {
  let cart = db.carts.findOne({ userId: req.user!._id });
  if (!cart) {
    cart = db.carts.create({
      _id: `cart_${req.user!._id}`,
      userId: req.user!._id,
      items: []
    });
  }

  const total = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return res.json({
    success: true,
    data: {
      ...cart,
      totalAmount: total,
      itemCount: cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0)
    }
  });
});

// Add to Cart
router.post('/cart/add', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = db.products.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = db.carts.findOne({ userId: req.user!._id });
    if (!cart) {
      cart = db.carts.create({
        _id: `cart_${req.user!._id}`,
        userId: req.user!._id,
        items: []
      });
    }

    const items = [...cart.items];
    const existingIndex = items.findIndex((i: any) => i.productId === productId);

    if (existingIndex > -1) {
      items[existingIndex].quantity += Number(quantity);
    } else {
      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity),
        imageUrl: product.imageUrl,
        unit: product.unit
      });
    }

    const updatedCart = db.carts.findByIdAndUpdate(cart._id, { items });
    return res.json({ success: true, message: 'Item added to cart', data: updatedCart });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update Cart Item Quantity
router.post('/cart/update', authenticate, (req: AuthenticatedRequest, res) => {
  const { productId, quantity } = req.body;
  const cart = db.carts.findOne({ userId: req.user!._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  let items = [...cart.items];
  if (quantity <= 0) {
    items = items.filter((i: any) => i.productId !== productId);
  } else {
    const idx = items.findIndex((i: any) => i.productId === productId);
    if (idx > -1) {
      items[idx].quantity = Number(quantity);
    }
  }

  const updatedCart = db.carts.findByIdAndUpdate(cart._id, { items });
  return res.json({ success: true, message: 'Cart updated', data: updatedCart });
});

// Remove Cart Item
router.post('/cart/remove', authenticate, (req: AuthenticatedRequest, res) => {
  const { productId } = req.body;
  const cart = db.carts.findOne({ userId: req.user!._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const items = cart.items.filter((i: any) => i.productId !== productId);
  const updatedCart = db.carts.findByIdAndUpdate(cart._id, { items });
  return res.json({ success: true, message: 'Item removed from cart', data: updatedCart });
});

// Clear Cart
router.post('/cart/clear', authenticate, (req: AuthenticatedRequest, res) => {
  const cart = db.carts.findOne({ userId: req.user!._id });
  if (cart) {
    db.carts.findByIdAndUpdate(cart._id, { items: [] });
  }
  return res.json({ success: true, message: 'Cart cleared' });
});

// Get Orders (Farmer sees their own, Admin sees all)
router.get('/orders', authenticate, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let orders = [];

  if (user.role === 'Admin') {
    orders = db.orders.all();
  } else {
    orders = db.orders.find((o: any) => o.userId === user._id);
  }

  return res.json({ success: true, count: orders.length, data: orders });
});

// Place Demo Order
router.post('/orders', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { shippingAddress, paymentMethod = 'Cash on Delivery (Demo)' } = req.body;

    const cart = db.carts.findOne({ userId: req.user!._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
    }

    const totalAmount = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const orderNumber = `AGR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = `TRK-AGRI-${Math.floor(100000 + Math.random() * 900000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);

    const newOrder = db.orders.create({
      userId: req.user!._id,
      farmerName: req.user!.name,
      orderNumber,
      items: [...cart.items],
      totalAmount,
      shippingAddress: shippingAddress || {
        fullName: req.user!.name,
        phone: '+91 98765 43210',
        state: 'Maharashtra',
        district: 'Nashik',
        village: 'Ozar',
        address: 'Farm Plot Delivery point',
        pincode: '422206'
      },
      paymentMethod,
      paymentStatus: paymentMethod.includes('Cash') ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      trackingNumber,
      estimatedDelivery: deliveryDate.toISOString().split('T')[0]
    });

    // Clear user cart
    db.carts.findByIdAndUpdate(cart._id, { items: [] });

    // Notify user
    db.notifications.create({
      userId: req.user!._id,
      title: 'Order Confirmed!',
      message: `Order #${newOrder.orderNumber} for ₹${totalAmount.toLocaleString()} has been placed. Tracking: ${trackingNumber}.`,
      type: 'order',
      read: false,
      link: '/marketplace'
    });

    return res.status(201).json({
      success: true,
      message: 'Demo order placed successfully!',
      data: newOrder
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin update order status
router.put('/orders/:id/status', authenticate, authorizeRoles('Admin'), (req, res) => {
  const { orderStatus } = req.body;
  const order = db.orders.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const updated = db.orders.findByIdAndUpdate(req.params.id, {
    orderStatus
  });

  if (order.userId) {
    db.notifications.create({
      userId: order.userId,
      title: `Order Status: ${orderStatus}`,
      message: `Your order #${order.orderNumber} is now ${orderStatus}.`,
      type: 'order',
      read: false,
      link: '/marketplace'
    });
  }

  return res.json({ success: true, message: 'Order status updated', data: updated });
});

export default router;

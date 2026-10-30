import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  ShieldCheck,
  Users,
  Trees,
  Sprout,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  GraduationCap,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [pestReports, setPestReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'pest'>('users');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, ordersRes, pestRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then(r => r.json()),
        fetch('/api/admin/users', { headers }).then(r => r.json()),
        fetch('/api/marketplace/orders', { headers }).then(r => r.json()),
        fetch('/api/pest/reports', { headers }).then(r => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (pestRes.success) setPestReports(pestRes.data);
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePestStatus = async (reportId: string, status: string, notes: string) => {
    try {
      const res = await fetch(`/api/pest/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, expertNotes: notes })
      });
      const data = await res.json();
      if (data.success) {
        setPestReports(prev => prev.map(p => p._id === reportId ? { ...p, status, expertNotes: notes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-bold text-neutral-900 text-lg">Admin Access Required</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          You are currently logged in as a <strong>{user?.role || 'Guest'}</strong>. Switch to the Admin account via the top navbar to view platform metrics and management tools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          {t('nav_admin')} Console
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Platform-wide user management, fulfillment tracking, pest surveillance, and agronomist oversight.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
              <span>Total Farmers</span>
              <Users className="w-4 h-4 text-emerald-800" />
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 font-mono mt-2">
              {stats.totalFarmers}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {stats.totalUsers} platform accounts total
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
              <span>Cultivated Land</span>
              <Trees className="w-4 h-4 text-emerald-800" />
            </div>
            <div className="text-2xl font-extrabold text-neutral-900 font-mono mt-2">
              {stats.totalCultivatedLandAcres} <span className="text-xs font-sans font-normal">Acres</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Across {stats.totalFarms} registered parcels
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
              <span>Marketplace GMV</span>
              <ShoppingBag className="w-4 h-4 text-emerald-800" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950 font-mono mt-2">
              ₹{stats.totalRevenue?.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {stats.totalOrders} demo orders fulfilled
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
              <span>Active Pest Alerts</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-rose-700 font-mono mt-2">
              {stats.pendingPestReports}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              {stats.pendingConsultations} pending inquiries
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-neutral-200/80 shadow-xs max-w-md">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'users' ? 'bg-emerald-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Manage Users ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'orders' ? 'bg-emerald-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Orders Fulfillment ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('pest')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'pest' ? 'bg-emerald-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Pest Surveillance ({pestReports.length})
        </button>
      </div>

      {/* Tab 1: Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Region</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{u.name}</div>
                      <div className="text-[11px] text-neutral-500">{u.email}</div>
                    </td>
                    <td className="p-4 font-mono text-neutral-700">{u.phone}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="Farmer">Farmer</option>
                        <option value="Agricultural Expert">Agricultural Expert</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-neutral-600">
                      {u.village ? `${u.village}, ${u.district}` : u.state}
                    </td>
                    <td className="p-4 text-right">
                      {u._id !== user._id && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900 font-mono">#{o.orderNumber}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{o.trackingNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-neutral-900">{o.farmerName}</div>
                      <div className="text-[11px] text-neutral-500">{o.shippingAddress?.district}</div>
                    </td>
                    <td className="p-4">
                      {o.items?.length} items ({o.items?.map((i: any) => i.name).join(', ')})
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-950">
                      ₹{o.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                        className="px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pest Reports Surveillance */}
      {activeTab === 'pest' && (
        <div className="space-y-4">
          {pestReports.map(rep => (
            <div
              key={rep._id}
              className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">
                    {rep.cropName}: {rep.diseaseName}
                  </h4>
                  <div className="text-xs text-neutral-500">
                    Reported by: <strong>{rep.farmerName}</strong> · Location: {rep.location} · {new Date(rep.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Status:</span>
                  <select
                    value={rep.status}
                    onChange={(e) => handleUpdatePestStatus(rep._id, e.target.value, rep.expertNotes || 'Verified by Admin')}
                    className="px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <strong>Reported Symptoms:</strong> {rep.symptoms}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

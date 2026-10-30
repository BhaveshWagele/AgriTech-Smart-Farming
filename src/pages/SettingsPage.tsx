import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  User,
  Settings,
  Globe,
  MapPin,
  Phone,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  Database,
  Cpu
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    state: user?.state || 'Maharashtra',
    district: user?.district || 'Nashik',
    village: user?.village || 'Ozar',
    preferredLanguage: user?.preferredLanguage || 'en'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success && data.user) {
        updateUser(data.user);
        setLanguage(form.preferredLanguage as any);
        setSuccess('Profile credentials and regional settings saved successfully!');
      } else {
        setError(data.message || 'Update failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          {t('nav_settings')} & Farm Profile
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure regional agricultural preferences, local dialect, and contact credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left card: User identity summary */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 text-center">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-emerald-700/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xl flex items-center justify-center mx-auto">
              {user?.name?.charAt(0) || 'F'}
            </div>
          )}

          <div>
            <h3 className="font-bold text-neutral-900 text-base">{user?.name}</h3>
            <p className="text-xs text-neutral-500">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
              {user?.role}
            </span>
          </div>

          <div className="pt-3 border-t border-neutral-100 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-neutral-600">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-mono">{user?.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{user?.village ? `${user.village}, ` : ''}{user?.district}, {user?.state}</span>
            </div>
          </div>
        </div>

        {/* Right card: Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-neutral-900 text-sm">Account Preferences</h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">District</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Village</label>
                <input
                  type="text"
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Preferred Language</label>
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value as 'en' | 'hi' | 'mr' })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
              >
                <option value="en">English (Global Agri-English)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* System & Architecture Info */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-800" />
          <span>System & Deployment Architecture</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 font-medium">Database Layer:</span>
            <div className="font-bold text-neutral-900 mt-0.5">MongoDB Atlas / Resilient File Store</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 font-medium">AI Intelligence:</span>
            <div className="font-bold text-neutral-900 mt-0.5">Gemini 2.5 Flash (@google/genai)</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 font-medium">Weather Provider:</span>
            <div className="font-bold text-neutral-900 mt-0.5">OpenWeatherMap / Agrometeorology Model</div>
          </div>
        </div>
      </div>
    </div>
  );
};

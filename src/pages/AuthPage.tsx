import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Sprout, Lock, Mail, User, Phone, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, defaultMode = 'login' }) => {
  const { login, register, demoLogin } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Farmer',
    state: 'Maharashtra',
    district: 'Nashik',
    village: 'Ozar',
    preferredLanguage: 'en'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onSuccess();
        } else {
          setError(res.message);
        }
      } else {
        const res = await register({
          email,
          password,
          ...formData
        });
        if (res.success) {
          onSuccess();
        } else {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'Farmer' | 'Admin' | 'Agricultural Expert') => {
    setLoading(true);
    await demoLogin(role);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl border border-neutral-200/80 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-900 rounded-2xl text-white flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            {mode === 'login' ? 'Sign In to AgriTech' : 'Register Farmer Account'}
          </h2>
          <p className="text-xs text-neutral-500">
            {mode === 'login'
              ? 'Access real-time farm diagnostics, weather advisories, and crop records.'
              : 'Join thousands of farmers optimizing yields with digital intelligence.'}
          </p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-2">
          <div className="text-[11px] font-bold text-neutral-600 text-center uppercase tracking-wider">
            ⚡ Quick Instant Demo Login
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('Farmer')}
              className="py-1.5 px-2 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-900 border border-neutral-200 rounded-lg transition-colors shadow-xs"
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Agricultural Expert')}
              className="py-1.5 px-2 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-900 border border-neutral-200 rounded-lg transition-colors shadow-xs"
            >
              Agronomist
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Admin')}
              className="py-1.5 px-2 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-900 border border-neutral-200 rounded-lg transition-colors shadow-xs"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Mobile Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Preferred Language</label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agritech.com"
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-100 text-xs">
          {mode === 'login' ? (
            <p className="text-neutral-500">
              Don’t have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="font-bold text-emerald-900 hover:underline"
              >
                Register as a Farmer
              </button>
            </p>
          ) : (
            <p className="text-neutral-500">
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-emerald-900 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

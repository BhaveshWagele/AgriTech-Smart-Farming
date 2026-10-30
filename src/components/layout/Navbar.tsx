import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { 
  Sprout, 
  Globe, 
  ShoppingCart, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Menu,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  activeTab, 
  onNavigate,
  unreadCount = 0 
}) => {
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200/80 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile Hamburger + Brand Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-neutral-600 hover:text-emerald-800 hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          onClick={() => onNavigate('overview')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-900 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-lg text-emerald-950 tracking-tight leading-none group-hover:text-emerald-800 transition-colors">
              AgriTech
            </div>
            <div className="text-[11px] text-neutral-500 font-medium tracking-tight leading-tight hidden sm:block">
              Smart Farming System
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: Contextual Status / Quick Switcher */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role: <strong className="text-emerald-900">{user?.role || 'Guest'}</strong></span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 p-2 text-xs z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-600">
                Switch Demo User Role
              </div>
              <button
                onClick={async () => {
                  await demoLogin('Farmer');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  user?.role === 'Farmer' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div>
                  <div className="font-semibold">Ramesh Patel (Farmer)</div>
                  <div className="text-[10px] text-neutral-600 font-normal">Nashik, Maharashtra</div>
                </div>
                {user?.role === 'Farmer' && <span className="text-emerald-600">✓</span>}
              </button>
              <button
                onClick={async () => {
                  await demoLogin('Agricultural Expert');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  user?.role === 'Agricultural Expert' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div>
                  <div className="font-semibold">Dr. Aris Thorne (Expert)</div>
                  <div className="text-[10px] text-neutral-600 font-normal">Plant Pathologist</div>
                </div>
                {user?.role === 'Agricultural Expert' && <span className="text-emerald-600">✓</span>}
              </button>
              <button
                onClick={async () => {
                  await demoLogin('Admin');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                  user?.role === 'Admin' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div>
                  <div className="font-semibold">Devendra Sharma (Admin)</div>
                  <div className="text-[10px] text-neutral-600 font-normal">Platform Overseer</div>
                </div>
                {user?.role === 'Admin' && <span className="text-emerald-600">✓</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Language Selector, Cart, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Selector */}
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
          {(['en', 'hi', 'mr'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                language === lang
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मरा'}
            </button>
          ))}
        </div>

        {/* Shopping Cart Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 text-neutral-700 hover:text-emerald-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Shopping Cart"
          aria-label="View shopping cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
              {itemCount}
            </span>
          )}
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => onNavigate('notifications')}
          className="relative p-2 text-neutral-700 hover:text-emerald-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Account / Profile */}
        <div className="relative">
          {isAuthenticated && user ? (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-700/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="hidden md:block text-left text-xs">
                <div className="font-semibold text-neutral-900 leading-tight">{user.name}</div>
                <div className="text-[11px] text-neutral-500 leading-tight">{user.district || user.role}</div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              {t('nav_login')}
            </button>
          )}

          {showProfileMenu && user && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 p-2 text-xs z-50">
              <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                <div className="font-semibold text-neutral-900">{user.name}</div>
                <div className="text-neutral-500 text-[11px] truncate">{user.email}</div>
                <div className="text-emerald-700 font-medium text-[11px] mt-0.5">{user.role}</div>
              </div>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-neutral-500" />
                {t('nav_settings')}
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                  onNavigate('login');
                }}
                className="w-full text-left px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors flex items-center gap-2 mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                {t('nav_logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

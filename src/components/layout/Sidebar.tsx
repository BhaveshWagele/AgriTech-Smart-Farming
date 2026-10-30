import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  LayoutDashboard,
  Trees,
  Sprout,
  FlaskConical,
  CloudSun,
  Bug,
  ShoppingBag,
  GraduationCap,
  Users,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isOpen,
  onClose,
  unreadCount = 0
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'overview', label: t('nav_overview'), icon: LayoutDashboard },
    { id: 'farms', label: t('nav_farms'), icon: Trees },
    { id: 'crops', label: t('nav_crops'), icon: Sprout },
    { id: 'soil', label: t('nav_soil'), icon: FlaskConical },
    { id: 'weather', label: t('nav_weather'), icon: CloudSun },
    { id: 'pest-alerts', label: t('nav_pest'), icon: Bug },
    { id: 'marketplace', label: t('nav_marketplace'), icon: ShoppingBag },
    { id: 'consultation', label: t('nav_consultation'), icon: GraduationCap },
    { id: 'community', label: t('nav_community'), icon: Users },
    { 
      id: 'notifications', 
      label: t('nav_notifications'), 
      icon: Bell, 
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { id: 'settings', label: t('nav_settings'), icon: Settings }
  ];

  // If Admin, include Admin Console
  if (user?.role === 'Admin') {
    navItems.splice(10, 0, { id: 'admin', label: t('nav_admin'), icon: ShieldCheck });
  }

  const handleSelect = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-emerald-950">AgriTech</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            {t('nav_overview')}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-emerald-950 hover:bg-neutral-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile Summary & Logout */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/60">
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <div className="px-3 py-2 bg-white rounded-xl border border-neutral-200/70 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-medium">Logged in as</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    {user.role}
                  </span>
                </div>
                <div className="font-semibold text-xs text-neutral-900 truncate mt-0.5">
                  {user.name}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {user.village ? `${user.village}, ${user.district}` : user.email}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  handleSelect('login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>{t('nav_logout')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleSelect('login')}
              className="w-full py-2 px-3 text-xs font-semibold text-center text-white bg-emerald-900 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
            >
              {t('nav_login')}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

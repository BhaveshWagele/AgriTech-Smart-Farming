import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';

import { OverviewPage } from './pages/OverviewPage.tsx';
import { FarmsPage } from './pages/FarmsPage.tsx';
import { CropsPage } from './pages/CropsPage.tsx';
import { SoilHealthPage } from './pages/SoilHealthPage.tsx';
import { WeatherPage } from './pages/WeatherPage.tsx';
import { PestAlertsPage } from './pages/PestAlertsPage.tsx';
import { MarketplacePage } from './pages/MarketplacePage.tsx';
import { ConsultationPage } from './pages/ConsultationPage.tsx';
import { CommunityPage } from './pages/CommunityPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';

function MainApp() {
  const { user, isAuthenticated, demoLogin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Auto-login default demo farmer on first visit if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      demoLogin('Farmer');
    }
  }, [isLoading, isAuthenticated]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage onNavigate={setActiveTab} />;
      case 'farms':
        return <FarmsPage onNavigate={setActiveTab} />;
      case 'crops':
        return <CropsPage onNavigate={setActiveTab} />;
      case 'soil':
        return <SoilHealthPage onNavigate={setActiveTab} />;
      case 'weather':
        return <WeatherPage />;
      case 'pest-alerts':
        return <PestAlertsPage onNavigate={setActiveTab} />;
      case 'marketplace':
        return <MarketplacePage onNavigate={setActiveTab} />;
      case 'consultation':
        return <ConsultationPage />;
      case 'community':
        return <CommunityPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={setActiveTab} />;
      case 'admin':
        return <AdminPage />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
        return <AuthPage onSuccess={() => setActiveTab('overview')} />;
      default:
        return <OverviewPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-neutral-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        unreadCount={unreadCount}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadCount={unreadCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-w-0">
          <div className="max-w-6xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Shopping Cart Slide-over */}
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

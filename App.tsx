
import React, { useState, useEffect } from 'react';
import { Home, User, ShoppingBag, LayoutDashboard } from 'lucide-react';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import { db } from './services/mockDb';
import { Product } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'store' | 'admin' | 'profile'>('store');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    // Initialize Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Apply theme colors to header
      tg.setHeaderColor('#0b0f19');
      tg.setBackgroundColor('#0b0f19');

      const handleBack = () => {
        if (window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        setActiveTab('store');
      };

      if (activeTab !== 'store') {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBack);
      } else {
        tg.BackButton.hide();
        tg.BackButton.offClick(handleBack);
      }

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        const currentUser = db.getUser();
        if (currentUser.id !== String(tgUser.id)) {
           db.updateUser({
             ...currentUser,
             id: String(tgUser.id),
             username: tgUser.username || tgUser.first_name || 'User',
             avatarUrl: tgUser.photo_url || `https://ui-avatars.com/api/?name=${tgUser.first_name}&background=6366f1&color=fff`
           });
        }
      }
    }

    const checkAdmin = () => {
      const user = db.getUser();
      setIsAdmin(user.isAdmin);
    };
    checkAdmin();
    const interval = setInterval(checkAdmin, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handlePurchase = (product: Product) => {
    // Native haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }

    const result = db.purchaseProduct(product.id);
    if (result.success) {
      showNotification('Success! Item delivered to your profile.', 'success');
      setTimeout(() => setActiveTab('profile'), 1500); 
    } else {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      showNotification(result.message, 'error');
      if (result.message === 'Insufficient funds') {
        setTimeout(() => setActiveTab('profile'), 1500); 
      }
    }
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const switchTab = (tab: 'store' | 'admin' | 'profile') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans selection:bg-brand-500/30">
      <main className="max-w-md mx-auto min-h-screen relative bg-[#0b0f19] shadow-2xl overflow-hidden">
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'store' && <Storefront onPurchase={handlePurchase} />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'profile' && <UserProfile />}
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none px-4 pb-6">
            <div className="w-full max-w-sm bg-gray-900/80 backdrop-blur-2xl border border-white/10 pointer-events-auto rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex justify-around items-center h-16">
                    <button 
                        onClick={() => switchTab('store')}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'store' ? 'text-brand-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Home size={20} className={activeTab === 'store' ? 'scale-110 transition-transform' : ''} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Store</span>
                    </button>
                    
                    {isAdmin && (
                        <button 
                            onClick={() => switchTab('admin')}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'admin' ? 'text-brand-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <LayoutDashboard size={20} className={activeTab === 'admin' ? 'scale-110 transition-transform' : ''} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
                        </button>
                    )}

                    <button 
                        onClick={() => switchTab('profile')}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'profile' ? 'text-brand-400 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <User size={20} className={activeTab === 'profile' ? 'scale-110 transition-transform' : ''} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Notification */}
        {notification && (
            <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 ${
                notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
                <span className="font-bold text-sm tracking-wide">{notification.msg}</span>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;

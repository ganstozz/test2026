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
      tg.expand(); // Opens app to full height

      // Handle Back Button
      const backButton = tg.BackButton;
      
      const handleBack = () => {
        setActiveTab('store');
      };

      if (activeTab !== 'store') {
        backButton.show();
        backButton.onClick(handleBack);
      } else {
        backButton.hide();
        backButton.offClick(handleBack);
      }

      // Try to get real Telegram user data
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        const currentUser = db.getUser();
        // Update mock DB with real Telegram info if changed
        if (currentUser.id !== String(tgUser.id)) {
           db.updateUser({
             ...currentUser,
             id: String(tgUser.id),
             username: tgUser.username || tgUser.first_name || 'User',
             avatarUrl: tgUser.photo_url || currentUser.avatarUrl
           });
        }
      }
    }

    // Polling for admin status
    const checkAdmin = () => {
      const user = db.getUser();
      setIsAdmin(user.isAdmin);
    };
    checkAdmin();
    const interval = setInterval(checkAdmin, 1000);
    return () => clearInterval(interval);
  }, [activeTab]); // Re-run when tab changes to update BackButton

  const handlePurchase = (product: Product) => {
    const result = db.purchaseProduct(product.id);
    if (result.success) {
      showNotification(result.message, 'success');
      setActiveTab('profile'); 
    } else {
      showNotification(result.message, 'error');
      if (result.message === 'Insufficient funds') {
        setTimeout(() => setActiveTab('profile'), 1000); 
      }
    }
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans selection:bg-brand-500/30">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen relative bg-[#0b0f19] shadow-2xl overflow-hidden">
        
        {/* Content based on tab */}
        <div className="animate-in fade-in duration-300">
            {activeTab === 'store' && <Storefront onPurchase={handlePurchase} />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'profile' && <UserProfile />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <div className="w-full max-w-md bg-[#111827]/90 backdrop-blur-xl border-t border-gray-800 pointer-events-auto pb-safe">
                <div className="flex justify-around items-center h-16">
                    <button 
                        onClick={() => setActiveTab('store')}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'store' ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Home size={22} strokeWidth={activeTab === 'store' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Store</span>
                    </button>
                    
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveTab('admin')}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'admin' ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <LayoutDashboard size={22} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">Admin</span>
                        </button>
                    )}

                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'profile' ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Notification Toast */}
        {notification && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in ${
                notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
                <span className="font-bold text-sm">{notification.msg}</span>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
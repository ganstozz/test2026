import React, { useState, useEffect } from 'react';
import { Home, User as UserIcon, LayoutDashboard } from 'lucide-react';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import UserProfile from './components/UserProfile';
import { db } from './services/mockDb';
import { Product, User } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'store' | 'admin' | 'profile'>('store');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    const initApp = async () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Only call these if supported (version check or existence check)
        try {
          if (tg.setHeaderColor) tg.setHeaderColor('#0b0f19');
          if (tg.setBackgroundColor) tg.setBackgroundColor('#0b0f19');
        } catch (e) {
          console.warn("Telegram UI methods not supported in this version");
        }

        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser) {
          try {
            const syncedUser = await db.syncUser(tgUser);
            setUser(syncedUser);
            setIsAdmin(syncedUser.isAdmin || false);
          } catch (e) {
            console.error("Sync error", e);
          }
        }
      }
    };
    initApp();
  }, []);

  const handlePurchase = async (product: Product) => {
    if (!user) return;
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    const result = await db.purchaseProduct(user.id, product.id);
    if (result.success) {
      showNotification('Успешно! Товар в вашем профиле.', 'success');
      const updated = await db.getUser(user.id);
      setUser(updated);
      setTimeout(() => setActiveTab('profile'), 1500);
    } else {
      showNotification(result.message, 'error');
    }
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      <main className="max-w-md mx-auto min-h-screen relative bg-[#0b0f19] shadow-2xl overflow-hidden">
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'store' && <Storefront onPurchase={handlePurchase} />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'profile' && user && <UserProfile user={user} onRefresh={async () => setUser(await db.getUser(user.id))} />}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-6">
            <div className="w-full max-w-sm bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex h-16">
                <button onClick={() => setActiveTab('store')} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === 'store' ? 'text-brand-400 bg-white/5' : 'text-gray-500'}`}>
                    <Home size={20} />
                    <span className="text-[10px] font-bold uppercase">Магазин</span>
                </button>
                {isAdmin && (
                    <button onClick={() => setActiveTab('admin')} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === 'admin' ? 'text-brand-400 bg-white/5' : 'text-gray-500'}`}>
                        <LayoutDashboard size={20} />
                        <span className="text-[10px] font-bold uppercase">Админ</span>
                    </button>
                )}
                <button onClick={() => setActiveTab('profile')} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === 'profile' ? 'text-brand-400 bg-white/5' : 'text-gray-500'}`}>
                    <UserIcon size={20} />
                    <span className="text-[10px] font-bold uppercase">Профиль</span>
                </button>
            </div>
        </nav>

        {notification && (
            <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
                <span className="font-bold text-sm tracking-wide text-white">{notification.msg}</span>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
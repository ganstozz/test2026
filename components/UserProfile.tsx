import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { User, Order } from '../types';
import { Wallet, Plus, Copy, Check, ShoppingBag, Loader2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  onRefresh: () => void;
}

const UserProfile: React.FC<ProfileProps> = ({ user, onRefresh }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await db.getOrders(user.id);
        setOrders(data);
      } catch (err) {
        console.error("Order load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const handleTopUp = async () => {
    setLoading(true);
    await db.deposit(user.id, topUpAmount);
    setShowTopUp(false);
    onRefresh();
    setLoading(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pb-32 pt-6 px-4">
      <div className="bg-gradient-to-br from-brand-600 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-5">
          <img src={user.avatarUrl} className="w-16 h-16 rounded-3xl border-2 border-white/20 shadow-lg" alt="" />
          <div>
            <h2 className="text-xl font-black">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-bold">UID: {user.id.slice(0, 8)}</span>
                {user.isAdmin && <span className="text-[9px] bg-yellow-400 px-2 py-0.5 rounded-full text-black font-black uppercase">Admin</span>}
            </div>
          </div>
        </div>
        <div className="mt-10 relative z-10 flex justify-between items-end">
             <div>
                <p className="text-brand-200 text-[10px] font-black uppercase tracking-widest mb-1">Ваш Баланс</p>
                <h1 className="text-5xl font-black tracking-tighter">${user.balance}</h1>
             </div>
             <button onClick={() => setShowTopUp(true)} className="bg-white text-brand-600 p-3 rounded-2xl shadow-xl active:scale-90 transition-transform">
                <Plus size={24} />
             </button>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mt-10">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Мои Покупки</h3>
        <div className="space-y-4">
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-800" /></div>
            ) : orders.length > 0 ? orders.map(order => (
                <div key={order.id} className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-white text-sm">{String(order.productTitle)}</h4>
                        <span className="text-brand-400 font-black text-xs">${order.price}</span>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-4 font-mono text-[11px] text-gray-400 relative border border-white/5 break-all">
                        {String(order.deliveryData || '')}
                        <button onClick={() => handleCopy(String(order.deliveryData || ''), order.id)} className="absolute top-2 right-2 p-2 bg-gray-800 rounded-xl hover:text-white">
                            {copiedId === order.id ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
            )) : (
                <div className="text-center py-16 bg-gray-900/20 rounded-[2rem] border-2 border-dashed border-gray-900">
                    <ShoppingBag size={40} className="mx-auto text-gray-800 mb-2 opacity-20" />
                    <p className="text-gray-700 font-bold text-xs uppercase tracking-widest">Список пуст</p>
                </div>
            )}
        </div>
      </div>

      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md px-6 animate-in fade-in duration-200">
          <div className="bg-gray-950 w-full max-w-xs rounded-[2.5rem] border border-gray-800 p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6 text-center">Пополнение</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[10, 25, 50, 100].map(amt => (
                <button key={amt} onClick={() => setTopUpAmount(amt)} className={`py-4 rounded-2xl border-2 font-black transition-all ${topUpAmount === amt ? 'bg-brand-600 border-brand-500 text-white shadow-lg' : 'border-gray-900 text-gray-600'}`}>${amt}</button>
              ))}
            </div>
            <button onClick={handleTopUp} disabled={loading} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Пополнить баланс'}
            </button>
            <button onClick={() => setShowTopUp(false)} className="w-full mt-4 text-gray-600 text-[10px] font-black uppercase tracking-widest">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
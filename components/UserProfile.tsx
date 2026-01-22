import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { User, Transaction, Order } from '../types';
import { Wallet, Plus, Copy, Check, ShoppingBag } from 'lucide-react';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User>(db.getUser());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(10);
  const [activeTab, setActiveTab] = useState<'history' | 'orders'>('orders');

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUser(db.getUser());
    setTransactions(db.getTransactions());
    setOrders(db.getOrders());
  };

  const handleTopUp = () => {
    db.deposit(topUpAmount);
    setShowTopUp(false);
    refreshData();
  };

  const toggleAdmin = () => {
    db.toggleAdminMode();
    refreshData();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pb-24 pt-8 px-4">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-brand-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-20 -left-10 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>

        <div className="relative z-10 flex items-center gap-4">
          <img src={user.avatarUrl} className="w-16 h-16 rounded-full border-2 border-white/30" alt="Avatar" />
          <div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <div className="flex flex-col gap-1 mt-1 opacity-80 cursor-pointer" onClick={toggleAdmin}>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-mono">ID: {user.id}</span>
                    {user.isAdmin && <span className="text-xs bg-yellow-500/80 px-2 py-0.5 rounded text-black font-bold">ADMIN</span>}
                </div>
                {!user.isAdmin && <span className="text-[10px] text-brand-200 opacity-60">(Tap ID to manage store)</span>}
            </div>
          </div>
        </div>

        <div className="mt-8 relative z-10">
          <p className="text-brand-100 text-sm font-medium mb-1">Total Balance</p>
          <div className="flex justify-between items-end">
             <h1 className="text-4xl font-bold">${user.balance.toFixed(2)}</h1>
             <button 
               onClick={() => setShowTopUp(true)}
               className="bg-white text-brand-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-50 transition-colors"
             >
               <Plus size={16} /> Top Up
             </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mt-8 border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'orders' ? 'text-white' : 'text-gray-500'}`}
        >
          My Orders
          {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}
        >
          Transactions
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></div>}
        </button>
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {activeTab === 'orders' ? (
          orders.length > 0 ? orders.map(order => (
            <div key={order.id} className="bg-gray-850 p-4 rounded-xl border border-gray-800">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-semibold text-white">{order.productTitle}</h4>
                 <span className="text-brand-400 font-mono text-sm">${order.price}</span>
               </div>
               <div className="bg-gray-900 rounded p-3 mb-2 font-mono text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap relative group">
                  {order.deliveryData}
                  <button 
                    onClick={() => handleCopy(order.deliveryData || '', order.id)}
                    className="absolute top-2 right-2 p-1.5 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                  >
                    {copiedId === order.id ? <Check size={12} className="text-green-500"/> : <Copy size={12} />}
                  </button>
               </div>
               <div className="flex justify-between items-center text-xs text-gray-600">
                 <span>ID: {order.id}</span>
                 <span>{new Date(order.date).toLocaleDateString()}</span>
               </div>
            </div>
          )) : <div className="text-center text-gray-500 py-10">No orders yet</div>
        ) : (
          transactions.length > 0 ? transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
               <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'deposit' ? <Wallet size={18} /> : <ShoppingBag size={18} />}
                 </div>
                 <div>
                   <p className="text-white text-sm font-medium">{tx.description}</p>
                   <p className="text-gray-500 text-xs">{new Date(tx.date).toLocaleDateString()}</p>
                 </div>
               </div>
               <span className={`font-mono font-medium ${tx.type === 'deposit' ? 'text-green-400' : 'text-white'}`}>
                 {tx.type === 'deposit' ? '+' : ''}{tx.amount.toFixed(2)}
               </span>
            </div>
          )) : <div className="text-center text-gray-500 py-10">No transactions yet</div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-gray-900 w-full max-w-sm rounded-3xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-2">Add Funds</h3>
            <p className="text-gray-400 text-sm mb-6">Simulate a payment gateway transaction.</p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[10, 25, 50, 100].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-3 rounded-xl border font-medium transition-all ${
                    topUpAmount === amt 
                      ? 'bg-brand-600 border-brand-500 text-white' 
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
            
            <div className="mb-6">
                 <label className="text-xs text-gray-500 mb-1 block">Custom Amount</label>
                 <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400">$</span>
                    <input 
                        type="number" 
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(Number(e.target.value))}
                        className="w-full bg-gray-800 text-white py-3 pl-8 pr-4 rounded-xl border border-gray-700 focus:border-brand-500 focus:outline-none"
                    />
                 </div>
            </div>

            <button 
              onClick={handleTopUp}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Pay ${topUpAmount.toFixed(2)}
            </button>
            <button 
              onClick={() => setShowTopUp(false)}
              className="w-full mt-3 text-gray-500 py-2 text-sm hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Zap, Shield, Mail, Coins, Key, LayoutGrid, Loader2 } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { db } from '../services/mockDb';

interface StorefrontProps {
  onPurchase: (product: Product) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ onPurchase }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    try {
      const data = await db.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'ALL', name: 'Все товары', icon: LayoutGrid, color: 'from-blue-500 to-indigo-600' },
    { id: ProductCategory.ACCOUNTS, name: 'Аккаунты', icon: Shield, color: 'from-orange-500 to-red-600' },
    { id: ProductCategory.STEAM, name: 'Steam', icon: Zap, color: 'from-indigo-500 to-purple-600' },
    { id: ProductCategory.KEYS, name: 'Ключи', icon: Key, color: 'from-emerald-500 to-teal-600' },
    { id: ProductCategory.CURRENCY, name: 'Валюта', icon: Coins, color: 'from-yellow-500 to-orange-600' },
    { id: ProductCategory.EMAIL, name: 'Почты', icon: Mail, color: 'from-pink-500 to-rose-600' },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-32 pt-4 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">GAME<span className="text-brand-500">VAULT</span></h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Цифровой Маркетплейс</p>
        </div>
        <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800">
           {loading ? <Loader2 size={18} className="text-brand-500 animate-spin" /> : <Zap size={18} className="text-brand-400" />}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Поиск..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
              activeCategory === cat.id ? `bg-gradient-to-br ${cat.color} border-white/20` : 'bg-gray-900 border-gray-800'
            }`}
          >
            <cat.icon size={18} className={activeCategory === cat.id ? 'text-white' : 'text-gray-500'} />
            <span className={`text-[9px] font-bold mt-2 truncate w-full text-center ${activeCategory === cat.id ? 'text-white' : 'text-gray-500'}`}>{cat.name}</span>
          </button>
        ))}
      </div>

      {loading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="text-brand-500 animate-spin opacity-20" />
            <p className="text-gray-600 font-bold text-sm">Загрузка каталога...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 flex flex-col group active:scale-95 transition-transform">
              <div className="aspect-square relative overflow-hidden bg-gray-950">
                 <img src={product.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                 <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg text-[8px] text-white font-black border border-white/5 uppercase">
                   {product.stock > 0 ? `В наличии: ${product.stock}` : 'Продано'}
                 </div>
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-white text-[11px] font-bold line-clamp-2 h-8 mb-2">{product.title}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-white font-black text-lg">${product.price}</span>
                  <button
                    onClick={() => onPurchase(product)}
                    disabled={product.stock === 0}
                    className="p-2.5 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20 active:bg-brand-500 disabled:opacity-30"
                  >
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Storefront;
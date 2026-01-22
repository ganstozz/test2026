import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Zap, Shield, Mail, Coins, Key } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { db } from '../services/mockDb';

interface StorefrontProps {
  onPurchase: (product: Product) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ onPurchase }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real app, subscribe to DB updates
    const load = () => {
        setProducts(db.getProducts());
    };
    load();
    const interval = setInterval(load, 2000); // Poll for admin updates
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'ALL', name: 'All', icon: Zap },
    { id: ProductCategory.STEAM, name: 'Steam', icon: Shield },
    { id: ProductCategory.EMAIL, name: 'Email', icon: Mail },
    { id: ProductCategory.CURRENCY, name: 'Currency', icon: Coins },
    { id: ProductCategory.KEYS, name: 'Keys', icon: Key },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 pt-4 px-4">
      {/* Header & Search */}
      <div className="sticky top-0 bg-[#0b0f19]/95 backdrop-blur-md z-20 pb-2 pt-2 -mx-4 px-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white mb-4">GameVault Market</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-sm text-white rounded-xl pl-10 pr-4 py-3 border border-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-gray-850 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all flex flex-col h-full group relative">
            
            {/* Image Area */}
            <div className="aspect-square relative overflow-hidden bg-gray-900">
               <img 
                 src={product.imageUrl} 
                 alt={product.title} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
               />
               <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] text-white font-mono border border-white/10">
                 {product.stock > 0 ? `${product.stock} in stock` : 'SOLD OUT'}
               </div>
               {product.region && (
                 <div className="absolute bottom-2 left-2 bg-brand-600/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] text-white font-bold uppercase">
                    {product.region}
                 </div>
               )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-grow">
              <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-1">{product.title}</h3>
              <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-brand-400 font-bold text-lg">${product.price.toFixed(2)}</span>
                <button
                  onClick={() => onPurchase(product)}
                  disabled={product.stock === 0}
                  className={`p-2 rounded-lg transition-colors ${
                    product.stock > 0 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

export default Storefront;

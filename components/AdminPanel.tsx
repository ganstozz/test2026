import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Product, ProductCategory } from '../types';
import { Plus, Trash2, Edit2, Package, Save, X, DollarSign, Image as ImageIcon } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    category: ProductCategory.STEAM,
    stock: 1,
    imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(db.getProducts());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      db.deleteProduct(id);
      refreshData();
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.price) return alert('Title and Price are required');
    
    const newProduct: Product = {
      id: isEditing || Math.random().toString(36).substr(2, 9),
      title: formData.title!,
      description: formData.description || '',
      price: Number(formData.price),
      category: formData.category || ProductCategory.STEAM,
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl || 'https://picsum.photos/400/400',
      region: formData.region || 'Global',
      autoDeliveryData: formData.autoDeliveryData || ''
    };

    if (isEditing) {
      db.updateProduct(newProduct);
    } else {
      db.addProduct(newProduct);
    }

    setShowAddModal(false);
    setIsEditing(null);
    setFormData({ 
        category: ProductCategory.STEAM, 
        stock: 1,
        imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`
    });
    refreshData();
  };

  const openEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(product.id);
    setShowAddModal(true);
  };

  const openAdd = () => {
      setIsEditing(null);
      setFormData({
        category: ProductCategory.STEAM,
        stock: 1,
        imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`
      });
      setShowAddModal(true);
  }

  return (
    <div className="pb-24 pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory</h2>
          <p className="text-gray-400 text-sm">Manage store products</p>
        </div>
        <button 
          onClick={openAdd}
          className="bg-brand-600 hover:bg-brand-500 text-white p-3 rounded-full shadow-lg shadow-brand-600/30 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.id} className="bg-gray-850 rounded-xl p-4 border border-gray-800 flex items-start gap-4">
            <img src={p.imageUrl} className="w-16 h-16 rounded-lg object-cover bg-gray-900" alt="" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                 <h4 className="text-white font-semibold truncate pr-2">{p.title}</h4>
                 <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.stock > 0 ? `Stock: ${p.stock}` : 'OOS'}
                 </span>
              </div>
              <p className="text-gray-500 text-xs truncate mt-1">{p.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-brand-400 font-bold">${p.price}</span>
                <span className="text-gray-600 text-xs">| {p.category}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => openEdit(p)} className="p-2 bg-gray-800 text-blue-400 rounded-lg hover:bg-gray-700">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-2 bg-gray-800 text-red-400 rounded-lg hover:bg-gray-700">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Product Title</label>
                <input 
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-brand-500 focus:outline-none"
                  value={formData.title || ''}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., CS2 Prime Account"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-gray-400 text-xs mb-1">Price ($)</label>
                   <div className="relative">
                     <DollarSign className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                     <input 
                       type="number"
                       className="w-full bg-gray-800 text-white rounded-lg p-3 pl-9 border border-gray-700 focus:border-brand-500 focus:outline-none"
                       value={formData.price || ''}
                       onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-gray-400 text-xs mb-1">Stock</label>
                   <div className="relative">
                     <Package className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                     <input 
                       type="number"
                       className="w-full bg-gray-800 text-white rounded-lg p-3 pl-9 border border-gray-700 focus:border-brand-500 focus:outline-none"
                       value={formData.stock || ''}
                       onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                     />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Category</label>
                <select 
                   className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-brand-500 focus:outline-none appearance-none"
                   value={formData.category}
                   onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
                >
                  {Object.values(ProductCategory).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Description</label>
                <textarea 
                  className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-brand-500 focus:outline-none h-20"
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Product details..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Delivery Data (Hidden from store, sent to buyer)</label>
                <textarea 
                  className="w-full bg-gray-800 text-green-400 font-mono text-sm rounded-lg p-3 border border-gray-700 focus:border-green-500 focus:outline-none h-24"
                  value={formData.autoDeliveryData || ''}
                  onChange={e => setFormData({...formData, autoDeliveryData: e.target.value})}
                  placeholder="Login:User&#10;Pass:123"
                />
              </div>

               <div>
                <label className="block text-gray-400 text-xs mb-1">Image URL</label>
                <div className="flex gap-2">
                    <input 
                    className="flex-1 bg-gray-800 text-white rounded-lg p-3 border border-gray-700 focus:border-brand-500 focus:outline-none"
                    value={formData.imageUrl || ''}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    />
                    <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800">
              <button 
                onClick={handleSave}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Save size={20} />
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

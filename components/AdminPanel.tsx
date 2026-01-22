import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/mockDb';
import { Product, ProductCategory } from '../types';
import { Plus, Trash2, Edit2, Package, Save, X, DollarSign, Upload, Image as ImageIcon, Loader2, Tag } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    category: ProductCategory.STEAM,
    stock: 1,
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const data = await db.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Файл слишком большой (max 5MB)");
        return;
      }
      
      setIsUploading(true);
      try {
        const publicUrl = await db.uploadImage(file);
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } catch (err: any) {
        console.error("Upload error details:", err);
        alert(`Ошибка загрузки: ${err.message || 'Проверьте политики бакета'}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.price || !formData.imageUrl) {
        return alert('Заполните название, цену и загрузите фото');
    }
    
    const productData: Omit<Product, 'id'> = {
      title: formData.title!,
      description: formData.description || '',
      price: Number(formData.price),
      category: formData.category || ProductCategory.STEAM,
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl!,
      region: formData.region || 'Global',
      autoDeliveryData: formData.autoDeliveryData || ''
    };

    try {
      if (isEditing) {
        await db.updateProduct(isEditing, productData);
      } else {
        await db.addProduct(productData);
      }
      setShowAddModal(false);
      setIsEditing(null);
      setFormData({ category: ProductCategory.STEAM, stock: 1 });
      refreshData();
    } catch (err: any) {
      alert(`Ошибка сохранения: ${err.message}`);
    }
  };

  return (
    <div className="pb-32 pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Инвентарь</h2>
          <p className="text-gray-500 text-xs font-medium">Управление общим каталогом</p>
        </div>
        <button 
          onClick={() => { setIsEditing(null); setFormData({ category: ProductCategory.STEAM, stock: 1 }); setShowAddModal(true); }} 
          className="bg-brand-600 text-white p-3 rounded-2xl shadow-lg shadow-brand-500/20 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-3 border border-gray-800/50 flex items-center gap-4">
            <img src={p.imageUrl} className="w-14 h-14 rounded-xl object-cover bg-gray-950 border border-gray-800" alt="" />
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-bold truncate">{p.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-brand-400 font-black text-sm">${p.price}</span>
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-tighter bg-gray-800 px-1.5 py-0.5 rounded">{p.category}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setFormData(p); setIsEditing(p.id); setShowAddModal(true); }} className="p-2 text-gray-400 hover:text-white transition-colors"><Edit2 size={18} /></button>
              <button onClick={async () => { if (confirm('Удалить?')) { await db.deleteProduct(p.id); refreshData(); } }} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-10 text-gray-600 font-medium border-2 border-dashed border-gray-900 rounded-3xl">
            Товаров пока нет. Нажмите + чтобы добавить.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-950 w-full max-w-md rounded-3xl border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-900 flex justify-between items-center">
              <h3 className="text-xl font-black text-white">{isEditing ? 'Правка' : 'Новый товар'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Изображение</label>
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative aspect-video w-full bg-gray-900 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group ${
                    isUploading ? 'border-brand-500 bg-brand-500/5' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                       <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                       <span className="text-xs font-bold text-brand-400">Загружаем...</span>
                    </div>
                  ) : formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" alt="Preview" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Upload size={24} className="text-white mb-2 drop-shadow-lg" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md">Заменить фото</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-600 group-hover:text-gray-400 transition-colors">
                      <ImageIcon size={40} className="mb-2 opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest">Выбрать файл</span>
                      <span className="text-[9px] mt-1 font-medium opacity-50">JPG, PNG up to 5MB</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Название</label>
                <input 
                  className="w-full bg-gray-900 text-white rounded-2xl p-4 border border-gray-800 focus:border-brand-500 focus:outline-none transition-all placeholder:text-gray-700 font-bold text-sm" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Напр: Аккаунт Steam с CS2" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Категория</label>
                <div className="relative">
                   <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                   <select 
                    className="w-full bg-gray-900 text-white rounded-2xl p-4 pl-10 border border-gray-800 focus:border-brand-500 focus:outline-none font-bold text-sm appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
                   >
                     {Object.values(ProductCategory).map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Цена ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                    <input 
                      type="number" 
                      className="w-full bg-gray-900 text-white rounded-2xl p-4 pl-10 border border-gray-800 focus:border-brand-500 focus:outline-none font-bold text-sm" 
                      value={formData.price || ''} 
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Наличие</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                    <input 
                      type="number" 
                      className="w-full bg-gray-900 text-white rounded-2xl p-4 pl-10 border border-gray-800 focus:border-brand-500 focus:outline-none font-bold text-sm" 
                      value={formData.stock || ''} 
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} 
                      placeholder="0" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Автовыдача (Данные)</label>
                <textarea 
                  className="w-full bg-gray-900 text-brand-400 font-mono text-xs rounded-2xl p-4 border border-gray-800 focus:border-brand-500 focus:outline-none h-24 resize-none shadow-inner" 
                  value={formData.autoDeliveryData || ''} 
                  onChange={e => setFormData({...formData, autoDeliveryData: e.target.value})} 
                  placeholder="login:password или ссылка на скачивание" 
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-900">
              <button 
                onClick={handleSave} 
                disabled={isUploading}
                className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                    isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
                }`}
              >
                {!isUploading && <Save size={20} />}
                {isUploading ? 'Загрузка...' : isEditing ? 'Сохранить изменения' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
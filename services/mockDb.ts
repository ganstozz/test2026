import { createClient } from '@supabase/supabase-js';
import { Product, User, Order, Transaction, ProductCategory } from '../types';

const SUPABASE_URL = 'https://mdpwjrrvyunulbjlygmp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IGP4luC_dHv1vcRFges6ZA_lw5bv_lY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

class SupabaseService {
  /**
   * Принудительно конвертирует любое значение из БД в строку, безопасную для React.
   * Ошибка #31 возникает, когда в JSX попадает объект вместо строки/числа.
   */
  private safeString(val: any): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    
    // Если это объект, мы его либо сериализуем, либо возвращаем пустую строку.
    // Мы НИКОГДА не должны возвращать сам объект в React компоненты.
    try {
      if (typeof val === 'object') {
        // Если это React-элемент или имеет внутренние ключи, возвращаем пустую строку
        if (val.$$typeof || ('props' in val)) {
          return '';
        }
        return JSON.stringify(val);
      }
    } catch (e) {
      return '';
    }
    return '';
  }

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    
    return (data || []).map((p: any) => ({
      id: String(p.id),
      title: this.safeString(p.title),
      description: this.safeString(p.description),
      price: Number(p.price) || 0,
      category: (this.safeString(p.category) as ProductCategory) || ProductCategory.STEAM,
      stock: Number(p.stock) || 0,
      imageUrl: this.safeString(p.image_url || p.imageUrl),
      region: this.safeString(p.region),
      autoDeliveryData: this.safeString(p.auto_delivery_data || p.autoDeliveryData)
    }));
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    const { error } = await supabase.from('products').insert([{
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image_url: product.imageUrl,
      region: product.region,
      auto_delivery_data: product.autoDeliveryData
    }]);
    if (error) throw error;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const updateData: any = { ...product };
    if (product.imageUrl) {
      updateData.image_url = product.imageUrl;
      delete updateData.imageUrl;
    }
    if (product.autoDeliveryData) {
      updateData.auto_delivery_data = product.autoDeliveryData;
      delete updateData.autoDeliveryData;
    }
    const { error } = await supabase.from('products').update(updateData).eq('id', id);
    if (error) throw error;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  // --- IMAGES ---
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // --- USER ---
  async syncUser(tgUser: any): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: String(tgUser.id),
        username: tgUser.username || tgUser.first_name || 'User',
        avatar_url: tgUser.photo_url || `https://ui-avatars.com/api/?name=${tgUser.first_name}`,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return {
      id: String(data.id),
      username: this.safeString(data.username),
      balance: Number(data.balance) || 0,
      isAdmin: Boolean(data.is_admin),
      avatarUrl: this.safeString(data.avatar_url)
    } as User;
  }

  async getUser(id: string): Promise<User> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return {
      id: String(data.id),
      username: this.safeString(data.username),
      balance: Number(data.balance) || 0,
      isAdmin: Boolean(data.is_admin),
      avatarUrl: this.safeString(data.avatar_url)
    } as User;
  }

  async deposit(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    const { error } = await supabase
      .from('users')
      .update({ balance: Number(user.balance) + amount })
      .eq('id', userId);
    if (error) throw error;
  }

  // --- PURCHASES ---
  async purchaseProduct(userId: string, productId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.getUser(userId);
    const products = await this.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return { success: false, message: 'Товар не найден' };
    if (product.stock <= 0) return { success: false, message: 'Нет в наличии' };
    if (user.balance < product.price) return { success: false, message: 'Недостаточно средств' };

    await this.updateProduct(productId, { stock: product.stock - 1 });
    await supabase.from('users').update({ balance: user.balance - product.price }).eq('id', userId);
    await supabase.from('orders').insert([{
      user_id: userId,
      product_id: productId,
      product_title: product.title,
      price: product.price,
      delivery_data: product.autoDeliveryData
    }]);

    return { success: true, message: 'Успешно' };
  }

  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map((o: any) => ({
      id: String(o.id),
      userId: String(o.user_id),
      productId: String(o.product_id),
      productTitle: this.safeString(o.product_title),
      price: Number(o.price) || 0,
      date: o.created_at,
      status: o.status || 'completed',
      deliveryData: this.safeString(o.delivery_data)
    }));
  }
}

export const db = new SupabaseService();
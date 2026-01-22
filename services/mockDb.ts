import { Product, ProductCategory, User, Order, Transaction } from '../types';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Steam Account (CS2 Prime)',
    description: 'High tier account with Prime status enabled. 100+ hours played.',
    price: 15.99,
    category: ProductCategory.STEAM,
    stock: 5,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    region: 'Global',
    autoDeliveryData: 'login: steamuser1\npass: hunter2'
  },
  {
    id: '2',
    title: '1000 Gold (WoW)',
    description: 'Instant delivery of 1000 Gold. Server: Draenor EU.',
    price: 9.50,
    category: ProductCategory.CURRENCY,
    stock: 100,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    region: 'EU',
    autoDeliveryData: 'Contact support with Order ID to claim.'
  },
  {
    id: '3',
    title: 'Gmail Aged 2018',
    description: 'Verified phone. Farmed manually. Good for trust factor.',
    price: 1.20,
    category: ProductCategory.EMAIL,
    stock: 45,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    autoDeliveryData: 'email: test@gmail.com\npass: 123456'
  },
  {
    id: '4',
    title: 'Cyberpunk 2077 Key',
    description: 'Steam Global Key activation.',
    price: 29.99,
    category: ProductCategory.KEYS,
    stock: 2,
    imageUrl: 'https://picsum.photos/400/400?random=4',
    autoDeliveryData: 'AAAA-BBBB-CCCC-DDDD'
  }
];

const INITIAL_USER: User = {
  id: 'user_01',
  username: 'TelegramUser',
  balance: 0.00,
  isAdmin: false, // Toggle this via hidden mechanism in UI
  avatarUrl: 'https://picsum.photos/200/200?random=50'
};

class MockDatabase {
  private get<T>(key: string, initial: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  }

  private set(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getProducts(): Product[] {
    return this.get<Product[]>('gv_products', INITIAL_PRODUCTS);
  }

  addProduct(product: Product): void {
    const products = this.getProducts();
    this.set('gv_products', [product, ...products]);
  }

  updateProduct(product: Product): void {
    const products = this.getProducts().map(p => p.id === product.id ? product : p);
    this.set('gv_products', products);
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.set('gv_products', products);
  }

  getUser(): User {
    return this.get<User>('gv_user', INITIAL_USER);
  }

  updateUser(user: User): void {
    this.set('gv_user', user);
  }

  getOrders(): Order[] {
    return this.get<Order[]>('gv_orders', []);
  }

  createOrder(order: Order): void {
    const orders = this.getOrders();
    this.set('gv_orders', [order, ...orders]);
  }

  getTransactions(): Transaction[] {
    return this.get<Transaction[]>('gv_transactions', []);
  }

  addTransaction(tx: Transaction): void {
    const txs = this.getTransactions();
    this.set('gv_transactions', [tx, ...txs]);
  }

  // Actions
  purchaseProduct(productId: string): { success: boolean; message: string; order?: Order } {
    const user = this.getUser();
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return { success: false, message: 'Product not found' };
    if (product.stock <= 0) return { success: false, message: 'Out of stock' };
    if (user.balance < product.price) return { success: false, message: 'Insufficient funds' };

    // Process
    product.stock -= 1;
    user.balance -= product.price;

    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      productId: product.id,
      productTitle: product.title,
      price: product.price,
      date: new Date().toISOString(),
      status: 'completed',
      deliveryData: product.autoDeliveryData
    };

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: -product.price,
      type: 'purchase',
      date: new Date().toISOString(),
      description: `Bought ${product.title}`
    };

    this.updateProduct(product);
    this.updateUser(user);
    this.createOrder(order);
    this.addTransaction(transaction);

    return { success: true, message: 'Purchase successful!', order };
  }

  deposit(amount: number): void {
    const user = this.getUser();
    user.balance += amount;
    
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: amount,
      type: 'deposit',
      date: new Date().toISOString(),
      description: 'Wallet Top-up'
    };

    this.updateUser(user);
    this.addTransaction(transaction);
  }
  
  toggleAdminMode(): boolean {
    const user = this.getUser();
    user.isAdmin = !user.isAdmin;
    this.updateUser(user);
    return user.isAdmin;
  }
}

export const db = new MockDatabase();

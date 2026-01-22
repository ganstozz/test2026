
export enum ProductCategory {
  STEAM = 'STEAM',
  EMAIL = 'EMAIL',
  CURRENCY = 'CURRENCY',
  ACCOUNTS = 'ACCOUNTS',
  KEYS = 'KEYS'
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  imageUrl: string;
  region?: string;
  autoDeliveryData?: string; // Content delivered after purchase
}

export interface User {
  id: string;
  username: string;
  balance: number;
  isAdmin: boolean;
  avatarUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  price: number;
  date: string;
  status: 'completed' | 'pending';
  deliveryData?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'purchase';
  date: string;
  description: string;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        // Fix: Added missing Telegram WebApp methods and properties
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        initDataUnsafe: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
            photo_url?: string;
          }
        }
      }
    }
  }
}

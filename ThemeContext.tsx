import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient<any> = createClient(url, anonKey);

export interface ProductMedia {
  images?: string[];
  video?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  price: number;
  compare_at_price: number | null;
  discount_percentage: number;
  stock: number;
  media: ProductMedia;
  specifications: any[];
  badge: string | null;
  is_featured: boolean;
  is_trending: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_flash_sale: boolean;
  flash_sale_ends_at: string | null;
  rating: number;
  reviews_count: number;
  sold_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  price: number;
  quantity: number;
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  country: string;
  city: string;
  area: string | null;
  street: string;
  building: string | null;
  notes: string | null;
  shipping_address: any;
  subtotal: number;
  delivery_cost: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  estimated_delivery: string | null;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface DeliverySettings {
  id: number;
  delivery_time_days: number;
  delivery_fee: number;
  free_delivery_threshold: number;
  is_active: boolean;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  is_blocked: boolean;
}

export function getProductImage(p: Product): string | null {
  if (p.media?.images && p.media.images.length > 0) return p.media.images[0];
  return null;
}

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const ADMIN_ROLES = ['super_admin', 'store_manager', 'product_manager', 'order_manager', 'support', 'marketing'];

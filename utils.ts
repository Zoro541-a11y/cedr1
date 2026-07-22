export type Role =
  | 'customer'
  | 'super_admin'
  | 'store_manager'
  | 'product_manager'
  | 'order_manager'
  | 'support'
  | 'marketing';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type CouponType = 'percentage' | 'fixed';

export interface ProductMedia {
  images: string[];
  video?: string;
}

export interface Specification {
  key: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  price: number;
  compare_at_price: number | null;
  discount_percentage: number;
  stock: number;
  media: ProductMedia;
  specifications: Specification[];
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
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  brand?: Brand | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  question: string;
  answer: string | null;
  answered_by: string | null;
  created_at: string;
  answered_at: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  area: string | null;
  street: string;
  building: string | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
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
  created_at: string;
}

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
  shipping_address: Record<string, unknown> | null;
  subtotal: number;
  delivery_cost: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  estimated_delivery: string | null;
  items_count: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

export interface AdminRole {
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

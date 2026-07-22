export const CEDAR_NAME = 'Cedar';
export const CEDAR_TAGLINE = 'Premium Marketplace, Delivered';

export const CEDAR_CURRENCIES = ['USD', 'AED', 'SAR', 'EGP'] as const;
export const CEDAR_CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  AED: 'د.إ',
  SAR: 'ر.س',
  EGP: 'ج.م',
};

export const CEDAR_COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Egypt',
  'Kuwait',
  'Qatar',
  'Bahrain',
  'Oman',
  'Jordan',
  'United States',
] as const;

export const CEDAR_CITIES: Record<string, string[]> = {
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
  Egypt: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Port Said'],
  Kuwait: ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya'],
  Qatar: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor'],
  Bahrain: ['Manama', 'Muharraq', 'Riffa', 'Isa Town'],
  Oman: ['Muscat', 'Salalah', 'Sohar', 'Nizwa'],
  Jordan: ['Amman', 'Zarqa', 'Irbid', 'Aqaba'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
};

export const CEDAR_DELIVERY_COSTS: Record<string, number> = {
  'United Arab Emirates': 5,
  'Saudi Arabia': 6,
  Egypt: 3,
  Kuwait: 7,
  Qatar: 7,
  Bahrain: 7,
  Oman: 8,
  Jordan: 6,
  'United States': 9,
};

export const CEDAR_ESTIMATED_DELIVERY: Record<string, string> = {
  'United Arab Emirates': '1-3 business days',
  'Saudi Arabia': '2-4 business days',
  Egypt: '2-5 business days',
  Kuwait: '3-5 business days',
  Qatar: '3-5 business days',
  Bahrain: '3-5 business days',
  Oman: '4-6 business days',
  Jordan: '3-6 business days',
  'United States': '5-10 business days',
};

export const CEDAR_ROLES = [
  'super_admin',
  'store_manager',
  'product_manager',
  'order_manager',
  'support',
  'marketing',
] as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const;

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/orders', label: 'Orders', icon: 'ShoppingBag' },
  { href: '/admin/products', label: 'Products', icon: 'Package' },
  { href: '/admin/customers', label: 'Customers', icon: 'Users' },
  { href: '/admin/categories', label: 'Categories', icon: 'FolderTree' },
  { href: '/admin/brands', label: 'Brands', icon: 'Tag' },
  { href: '/admin/coupons', label: 'Coupons', icon: 'Ticket' },
  { href: '/admin/notifications', label: 'Notifications', icon: 'Bell' },
  { href: '/admin/reports', label: 'Reports', icon: 'BarChart3' },
  { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const STORE_NAV = [
  { href: '/', label: { en: 'Home', ar: 'الرئيسية' } },
  { href: '/categories', label: { en: 'Categories', ar: 'الفئات' } },
  { href: '/search', label: { en: 'Search', ar: 'البحث' } },
  { href: '/about', label: { en: 'About', ar: 'من نحن' } },
  { href: '/contact', label: { en: 'Contact', ar: 'تواصل معنا' } },
] as const;

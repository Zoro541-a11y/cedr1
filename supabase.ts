import { useState } from 'react';
import {
  Store, ShoppingBag, ShoppingCart, Heart, User, LogOut, Moon, Sun,
  Search, Menu, X, Package, Truck, ClipboardList, Shield, ArrowLeft,
  ChevronDown, Home,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { I18nProvider, useI18n } from './context/I18nContext';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { StorePage } from './components/StorePage';
import { CartDrawer } from './components/CartDrawer';
import { MyOrdersPage } from './components/MyOrdersPage';
import { WishlistPage } from './components/WishlistPage';
import { OrdersAdmin } from './components/OrdersAdmin';
import { ProductsAdmin } from './components/ProductsAdmin';
import { DeliverySettingsAdmin } from './components/DeliverySettingsAdmin';
import { useEffect } from 'react';

type Page = 'home' | 'shop' | 'orders' | 'wishlist';
type AdminTab = 'orders' | 'products' | 'delivery';

function Navbar({ onNavigate, onOpenCart, onSearch }: {
  onNavigate: (page: Page) => void;
  onOpenCart: () => void;
  onSearch: (query: string) => void;
}) {
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const navItem = (page: Page, label: string, icon: typeof Home) => (
    <button onClick={() => { onNavigate(page); setMenuOpen(false); }}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:text-primary dark:hover:text-primary-300">
      {(() => { const Icon = icon; return <Icon className="h-4 w-4" /> })()}
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-3">
          {/* Logo */}
          <button onClick={() => onNavigate('home')}
            className="flex flex-shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Store className="h-5 w-5" />
            </div>
            <span className="hidden text-lg font-bold text-gray-900 dark:text-white sm:block">Cedar</span>
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </form>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Language switch */}
            <button onClick={toggleLang}
              className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800">
              {lang === 'en' ? 'ع' : 'EN'}
            </button>

            {/* Dark mode toggle */}
            <button onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Desktop nav */}
            <div className="hidden items-center gap-4 lg:flex">
              {navItem('shop', t('shop'), ShoppingBag)}
              {navItem('orders', t('myOrders'), Package)}
              {navItem('wishlist', t('wishlist'), Heart)}
            </div>

            {/* Cart */}
            <button onClick={onOpenCart}
              className="relative rounded-lg p-2 text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 rounded-lg p-2 text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800">
                <User className="h-5 w-5" />
                <ChevronDown className="hidden h-3 w-3 sm:block" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-2 shadow-xl">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <button onClick={() => { onNavigate('orders'); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Package className="h-4 w-4" /> {t('myOrders')}
                    </button>
                    <button onClick={() => { onNavigate('wishlist'); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Heart className="h-4 w-4" /> {t('wishlist')}
                    </button>
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                      <LogOut className="h-4 w-4" /> {t('signOut')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 dark:border-gray-800 py-3 lg:hidden">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </form>
            <div className="flex flex-col gap-3 py-2">
              {navItem('home', t('home'), Home)}
              {navItem('shop', t('shop'), ShoppingBag)}
              {navItem('orders', t('myOrders'), Package)}
              {navItem('wishlist', t('wishlist'), Heart)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function AppContent() {
  const { user, loading, adminAuthed, signOut, exitAdmin } = useAuth();
  const { t } = useI18n();
  const [page, setPage] = useState<Page>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    if (page === 'home') { setSearchQuery(''); setCategoryFilter(null); }
  }, [page]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Admin panel
  if (adminAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-gray-900 dark:bg-gray-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exitAdmin}
                className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('exitToStore')}
              </button>
              <button onClick={signOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-white/10 hover:text-white">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t('signOut')}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-900 p-1">
            <button onClick={() => setAdminTab('orders')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${adminTab === 'orders' ? 'bg-white text-primary shadow-sm dark:bg-gray-800 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
              <ClipboardList className="h-4 w-4" /> {t('orders')}
            </button>
            <button onClick={() => setAdminTab('products')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${adminTab === 'products' ? 'bg-white text-primary shadow-sm dark:bg-gray-800 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
              <Package className="h-4 w-4" /> {t('products')}
            </button>
            <button onClick={() => setAdminTab('delivery')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${adminTab === 'delivery' ? 'bg-white text-primary shadow-sm dark:bg-gray-800 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
              <Truck className="h-4 w-4" /> {t('deliverySettings')}
            </button>
          </div>

          {adminTab === 'orders' && <OrdersAdmin />}
          {adminTab === 'products' && <ProductsAdmin />}
          {adminTab === 'delivery' && <DeliverySettingsAdmin />}
        </div>
      </div>
    );
  }

  // Customer views
  const navigate = (p: Page) => setPage(p);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCategoryFilter(null);
    setPage('shop');
  };

  const handleCategoryClick = (catId: string) => {
    setCategoryFilter(catId);
    setSearchQuery('');
    setPage('shop');
  };

  const handleViewAll = (section: string) => {
    setCategoryFilter(null);
    setSearchQuery('');
    setPage('shop');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onNavigate={navigate} onOpenCart={() => setCartOpen(true)} onSearch={handleSearch} />

      <main>
        {page === 'home' && (
          <LandingPage
            onShopNow={() => setPage('shop')}
            onExploreDeals={() => setPage('shop')}
            onCategoryClick={handleCategoryClick}
            onViewAll={handleViewAll}
            onSearch={handleSearch}
          />
        )}
        {page === 'shop' && (
          <StorePage
            initialSearch={searchQuery}
            initialCategory={categoryFilter}
            onBack={() => setPage('home')}
          />
        )}
        {page === 'orders' && <MyOrdersPage onBack={() => setPage('home')} />}
        {page === 'wishlist' && <WishlistPage onBack={() => setPage('home')} />}
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrderPlaced={() => { setCartOpen(false); setPage('orders'); }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" richColors />
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

import { useState } from 'react';
import { Store, LogIn, UserPlus, Loader2, AlertCircle, Shield, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { toast } from 'sonner';

type Mode = 'login' | 'signup' | 'admin';

export function LoginPage() {
  const { signIn, signUp, signInAsAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useI18n();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(lang === 'ar' ? 'الرجاء إدخال البريد وكلمة المرور' : 'Please enter your email and password');
      return;
    }
    if (password.length < 6) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError(lang === 'ar' ? 'الرجاء إدخال اسمك' : 'Please enter your name');
      return;
    }

    setBusy(true);
    if (mode === 'login') {
      const result = await signIn(email.trim(), password);
      if (result.error) { setError(result.error); setBusy(false); }
      else { toast.success(t('welcomeBack')); }
    } else if (mode === 'admin') {
      const result = await signInAsAdmin(email.trim(), password);
      if (result.error) { setError(result.error); setBusy(false); }
      else { toast.success(t('welcomeAdmin')); }
    } else {
      const result = await signUp(email.trim(), password, fullName.trim());
      if (result.error) { setError(result.error); setBusy(false); }
      else { toast.success(t('accountCreated')); }
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
  };

  const isAdminMode = mode === 'admin';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700">
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
        <button onClick={toggleTheme}
          className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${
            isAdminMode ? 'bg-gray-900' : 'bg-primary'
          }`}>
            {isAdminMode ? <Shield className="h-7 w-7" /> : <Store className="h-7 w-7" />}
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {isAdminMode ? t('adminAccess') : t('cedarStore')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAdminMode ? t('adminAccessDesc') : t('lebanonMarketplace')}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 shadow-xl">
          {!isAdminMode && (
            <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <button type="button" onClick={() => switchMode('login')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === 'login' ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                <LogIn className="h-4 w-4" /> {t('signIn')}
              </button>
              <button type="button" onClick={() => switchMode('signup')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === 'signup' ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                <UserPlus className="h-4 w-4" /> {t('signUp')}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName')}</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  disabled={busy}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t('enterEmail')} disabled={busy}
                className={`w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                  isAdminMode
                    ? 'border-gray-300 dark:border-gray-600 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                    : 'border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary'
                }`} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')} disabled={busy}
                className={`w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                  isAdminMode
                    ? 'border-gray-300 dark:border-gray-600 focus:border-gray-900 focus:ring-1 focus:ring-gray-900'
                    : 'border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary'
                }`} />
            </div>
            <button type="submit" disabled={busy}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 ${
                isAdminMode ? 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600' : 'bg-primary hover:bg-primary-600'
              }`}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'login' ? '...' : mode === 'admin' ? '...' : '...'}
                </>
              ) : mode === 'login' ? (
                <><LogIn className="h-4 w-4" /> {t('signIn')}</>
              ) : mode === 'admin' ? (
                <><Shield className="h-4 w-4" /> {t('enterAdminPanel')}</>
              ) : (
                <><UserPlus className="h-4 w-4" /> {t('signUp')}</>
              )}
            </button>
          </form>

          {isAdminMode ? (
            <button type="button" onClick={() => switchMode('login')}
              className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="h-4 w-4" /> {t('backToStoreLogin')}
            </button>
          ) : (
            <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <button type="button" onClick={() => switchMode('admin')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800">
                <Shield className="h-4 w-4" /> {t('adminLogin')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

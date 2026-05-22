import { useState, useEffect } from 'react';
import { Page } from './types';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NewDelivery from './pages/NewDelivery';
import PosPage from './pages/PosPage';
import Delivery from './pages/Delivery';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const getStoredUserRole = (): string => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return '';
    const user = JSON.parse(rawUser) as { role?: string };
    return String(user?.role ?? '').toLowerCase();
  } catch {
    return '';
  }
};

const pageForRole = (role: string): Page => {
  if (role === 'staff') return 'pos';
  if (role === 'delivery') return 'delivery';
  return 'dashboard';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState<{ type: 'success' | 'cancel'; message: string } | null>(null);

  const handleNavigate = (page: Page) => {
    const role = getStoredUserRole();
    if (isSignedIn && role === 'delivery' && page !== 'delivery' && page !== 'auth') {
      setCurrentPage('delivery');
      return;
    }
    setCurrentPage(page);
  };

  // Handle PayMongo redirect return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pmSession = params.get('pm_session');
    const pmCancel = params.get('pm_cancel');

    if (!pmSession && !pmCancel) return;

    // Strip payment params from URL without reload
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    if (pmCancel) {
      setPaymentBanner({ type: 'cancel', message: 'Payment was cancelled.' });
      setTimeout(() => setPaymentBanner(null), 5000);
      return;
    }

    if (pmSession) {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      fetch(`${API_BASE}/payments/checkout/${pmSession}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.status === 'paid') {
            setPaymentBanner({ type: 'success', message: 'Payment successful! Your transaction has been confirmed.' });
          } else {
            setPaymentBanner({ type: 'cancel', message: 'Payment is still being processed. Please check your order status.' });
          }
          setTimeout(() => setPaymentBanner(null), 7000);
        })
        .catch(() => {
          setPaymentBanner({ type: 'cancel', message: 'Could not verify payment. Please check your order status.' });
          setTimeout(() => setPaymentBanner(null), 7000);
        });
    }
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsSignedIn(false);
        setIsCheckingSession(false);
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        window.clearTimeout(timeout);

        if (!res.ok) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setIsSignedIn(false);
          setCurrentPage('auth');
          return;
        }

        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsSignedIn(true);
        const role = String(data?.user?.role ?? '').toLowerCase();
        setCurrentPage(pageForRole(role));
      } catch {
        setIsSignedIn(false);
        setCurrentPage('auth');
      } finally {
        setIsCheckingSession(false);
      }
    };

    void bootstrapSession();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    setIsSignedIn(Boolean(localStorage.getItem('access_token')));
  }, [currentPage]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsSignedIn(false);
    setCurrentPage('auth');
  };

  const homePage: Page = isSignedIn ? pageForRole(getStoredUserRole()) : 'landing';

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'signup':
        return <AuthPage onNavigate={handleNavigate} initialTab="signup" />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'new-delivery':
        return <NewDelivery onNavigate={handleNavigate} />;
      case 'pos':
        return <PosPage onNavigate={handleNavigate} />;
      case 'delivery':
        return <Delivery onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading AquaFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      homePage={homePage}
      isSignedIn={isSignedIn}
      onSignOut={handleSignOut}
      hideNav={currentPage === 'pos'}
    >
      {/* Payment result banner */}
      {paymentBanner && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            paymentBanner.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700 text-white'
          }`}
        >
          {paymentBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          {paymentBanner.message}
        </div>
      )}
      {renderPage()}
    </Layout>
  );
}

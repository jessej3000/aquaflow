import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Page } from './types';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NewDelivery from './pages/NewDelivery';
import PosPage from './pages/PosPage';
import Delivery from './pages/Delivery';
import SubscriptionPage from './pages/SubscriptionPage';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
  const [showSubExpiredModal, setShowSubExpiredModal] = useState(false);

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

    const pmSub = params.get('pm_sub');
    if (pmSub === 'success') {
      // Clear the renewal-only session token — user must sign in properly now
      sessionStorage.removeItem('sub_renewal_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setIsSignedIn(false);
      setCurrentPage('auth');
      setPaymentBanner({ type: 'success', message: 'Subscription activated! Please sign in to continue.' });
      setTimeout(() => setPaymentBanner(null), 8000);
      return;
    }
    if (pmSub === 'failed') {
      setPaymentBanner({ type: 'cancel', message: 'Payment failed. Please try again.' });
      setTimeout(() => setPaymentBanner(null), 6000);
      return;
    }

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
        const role = String(data?.user?.role ?? '').toLowerCase();

        // Subscription check applies to ALL roles on session restore.
        try {
          const subRes = await fetch(`${API_BASE}/subscription/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (subRes.ok) {
            const subData = await subRes.json() as { status?: string };
            if (subData.status === 'expired') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('user');
              setIsSignedIn(false);
              if (role === 'admin') {
                sessionStorage.setItem('sub_renewal_token', token);
                setCurrentPage('subscription');
              } else {
                setShowSubExpiredModal(true);
                setCurrentPage('auth');
              }
              return;
            }
          }
        } catch {
          // If subscription check fails, allow access — don't block the user
        }

        setIsSignedIn(true);
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

  // Handle mid-session subscription expiry (dispatched by pages that get a 403 with code: subscription_expired)
  useEffect(() => {
    const handleSubExpired = () => {
      const role = getStoredUserRole();
      const token = localStorage.getItem('access_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setIsSignedIn(false);
      if (role === 'admin') {
        if (token) sessionStorage.setItem('sub_renewal_token', token);
        setCurrentPage('subscription');
      } else {
        setShowSubExpiredModal(true);
        setCurrentPage('auth');
      }
    };
    window.addEventListener('subscription-expired', handleSubExpired);
    return () => window.removeEventListener('subscription-expired', handleSubExpired);
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
      case 'subscription':
        return <SubscriptionPage onNavigate={handleNavigate} onSignOut={handleSignOut} />;
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

      {/* Mid-session subscription expired modal (non-admin roles) */}
      {showSubExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Subscription Expired</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Your workspace subscription has expired. Please notify your admin to renew the subscription and restore access.
            </p>
            <button
              onClick={() => setShowSubExpiredModal(false)}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-container transition-all active:scale-95"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}

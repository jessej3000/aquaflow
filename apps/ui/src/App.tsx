import { useState, useEffect } from 'react';
import { Page } from './types';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NewDelivery from './pages/NewDelivery';
import PosPage from './pages/PosPage';
import Delivery from './pages/Delivery';
import { Loader2 } from 'lucide-react';

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

  const handleNavigate = (page: Page) => {
    const role = getStoredUserRole();

    // Delivery users are restricted to the Delivery page while signed in.
    if (isSignedIn && role === 'delivery' && page !== 'delivery' && page !== 'auth') {
      setCurrentPage('delivery');
      return;
    }

    setCurrentPage(page);
  };

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Simple scroll to top on page change
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
      {renderPage()}
    </Layout>
  );
}

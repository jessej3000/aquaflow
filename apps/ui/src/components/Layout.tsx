import {
  Droplet,
  Droplets,
  Globe,
  Home,
  LayoutDashboard,
  Map,
  Menu,
  Package,
  Receipt,
  Settings,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useState, ReactNode } from 'react';
import { Page } from '../types';

type DashboardView = 'dashboard' | 'deliveries' | 'sales' | 'customers' | 'branches' | 'inventory' | 'users' | 'quality' | 'settings';

const DASHBOARD_MOBILE_VIEW_KEY = 'dashboard_mobile_view';
const DASHBOARD_MOBILE_VIEW_EVENT = 'dashboard-mobile-view-change';

interface LayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  homePage: Page;
  isSignedIn?: boolean;
  onSignOut?: () => void;
  hideNav?: boolean;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
  homePage,
  isSignedIn = false,
  onSignOut,
  hideNav = false,
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const signedInMobileLinks: Array<{ label: string; view: DashboardView; icon: typeof Home }> = [
    { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { label: 'Orders', view: 'deliveries', icon: Truck },
    { label: 'Sales', view: 'sales', icon: Receipt },
    { label: 'Customers', view: 'customers', icon: Users },
    { label: 'Branches', view: 'branches', icon: Map },
    { label: 'Inventory', view: 'inventory', icon: Package },
    { label: 'Users', view: 'users', icon: Users },
    { label: 'Maintenance', view: 'quality', icon: Droplet },
    { label: 'Settings', view: 'settings', icon: Settings },
  ];

  const navigateToDashboardView = (view: DashboardView) => {
    localStorage.setItem(DASHBOARD_MOBILE_VIEW_KEY, view);
    window.dispatchEvent(new CustomEvent(DASHBOARD_MOBILE_VIEW_EVENT, { detail: { view } }));

    if (currentPage !== 'dashboard') {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!hideNav && (
        <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm h-16 flex justify-between items-center px-4 md:px-8">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate(homePage)}
              className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
            >
              <Droplets className="w-8 h-8 text-secondary" />
              <span>AquaFlow</span>
            </button>
            <div className="hidden md:flex items-center gap-6">
              {!isSignedIn && (
                <>
                  <a className="text-slate-600 hover:text-primary transition-colors duration-200 px-1 py-1" href="#">About</a>
                  <a className="text-slate-600 hover:text-primary transition-colors duration-200 px-1 py-1" href="#solutions">Features</a>
                  <a className="text-slate-600 hover:text-primary transition-colors duration-200 px-1 py-1" href="#pricing">Pricing</a>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => {
                if (isSignedIn) {
                  onSignOut?.();
                  return;
                }
                onNavigate('auth');
              }}
              className="text-slate-600 hover:text-primary font-medium transition-colors duration-200 px-3 md:px-4 py-2"
            >
              {isSignedIn ? 'Sign Out' : 'Sign In'}
            </button>
            <button 
              onClick={() => onNavigate('auth')}
              className="bg-primary text-white px-4 md:px-6 py-2 rounded-lg font-semibold hover:bg-primary-container transition-all duration-200 shadow-sm whitespace-nowrap"
            >
              Get Started
            </button>
            <button 
              className="md:hidden text-slate-600 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 space-y-4 md:hidden">
          <button
            className="w-full text-left text-lg font-medium text-slate-800 flex items-center gap-2"
            onClick={() => {
              localStorage.removeItem(DASHBOARD_MOBILE_VIEW_KEY);
              onNavigate(homePage);
              setIsMobileMenuOpen(false);
            }}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          {isSignedIn && (
            <>
              {signedInMobileLinks.map((item) => (
                <button
                  key={item.view}
                  className="w-full text-left text-lg font-medium text-slate-800 flex items-center gap-2"
                  onClick={() => {
                    navigateToDashboardView(item.view);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </>
          )}
          {!isSignedIn && (
            <>
              <a className="block text-lg font-medium text-slate-800" href="#" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a className="block text-lg font-medium text-slate-800" href="#solutions" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a className="block text-lg font-medium text-slate-800" href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
            </>
          )}
        </div>
      )}

      <main className={`flex-grow ${!hideNav ? 'pt-16' : ''}`}>
        {children}
      </main>

      <footer className="w-full border-t border-slate-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-xl font-bold text-primary flex items-center gap-2 justify-center md:justify-start">
                <Droplets className="w-6 h-6 text-secondary" />
                AquaFlow
              </span>
              <p className="text-slate-500 text-xs mt-1">© 2024 AquaFlow Systems. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a className="text-slate-400 text-xs hover:text-secondary transition-colors" href="#">Privacy Policy</a>
              <a className="text-slate-400 text-xs hover:text-secondary transition-colors" href="#">Terms of Service</a>
              <a className="text-slate-400 text-xs hover:text-secondary transition-colors" href="#">Contact</a>
              <a className="text-slate-400 text-xs hover:text-secondary transition-colors" href="#">Sustainability</a>
            </div>
            <div className="flex gap-4">
              <Globe className="w-5 h-5 text-slate-400 hover:text-secondary cursor-pointer transition-colors" />
              <Droplets className="w-5 h-5 text-slate-400 hover:text-secondary cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

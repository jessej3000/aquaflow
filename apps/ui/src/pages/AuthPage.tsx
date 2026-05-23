import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User as UserIcon, Loader2, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Page } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface AuthPageProps {
  onNavigate: (page: Page) => void;
  initialTab?: 'signin' | 'signup';
}

export default function AuthPage({ onNavigate, initialTab = 'signin' }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubExpiredAlert, setShowSubExpiredAlert] = useState(false);

  const switchTab = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setError(null);
    setVerifyPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'signup' && password !== verifyPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const endpoint = activeTab === 'signin' ? '/auth/signin' : '/auth/signup';
    const body: Record<string, string> = { email, password };
    if (activeTab === 'signup' && fullName.trim()) {
      body.full_name = fullName.trim();
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail ?? 'Something went wrong. Please try again.');
        return;
      }

      const role = String(data?.user?.role ?? '').toLowerCase();

      // Subscription check applies to ALL roles — no one gets in if expired.
      if ((data as { subscription_expired?: boolean }).subscription_expired) {
        if (role === 'admin') {
          sessionStorage.setItem('sub_renewal_token', data.access_token as string);
          onNavigate('subscription');
        } else {
          setShowSubExpiredAlert(true);
        }
        return;
      }

      // Normal login — route by role
      localStorage.setItem('access_token', data.access_token as string);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (role === 'staff') {
        onNavigate('pos');
      } else if (role === 'delivery') {
        onNavigate('delivery');
      } else {
        onNavigate('dashboard');
      }
    } catch {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden auth-card-blur">
          {/* Header */}
          <div className="p-8 text-center border-b border-outline-variant/10 bg-surface-container-low/30">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {activeTab === 'signin' ? 'Welcome Back' : 'Join AquaFlow'}
            </h1>
            <p className="text-on-surface-variant font-medium">Pure water, professional management.</p>
          </div>

          <div className="p-8">
            {/* Tab Switcher */}
            <div className="flex bg-surface-container-high rounded-xl p-1 mb-8">
              <button 
                onClick={() => switchTab('signin')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'signin' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => switchTab('signup')}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {activeTab === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant block ml-1" htmlFor="fullName">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-on-surface font-medium placeholder:text-outline-variant"
                      id="fullName"
                      placeholder="Jane Smith"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant block ml-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-on-surface font-medium placeholder:text-outline-variant" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-on-surface-variant" htmlFor="password">Password</label>
                  {activeTab === 'signin' && (
                    <a className="text-xs text-secondary font-bold hover:underline" href="#">Forgot password?</a>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    className="w-full pl-12 pr-12 py-4 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-on-surface font-medium placeholder:text-outline-variant" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={activeTab === 'signup' ? 8 : 1}
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {activeTab === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant block ml-1" htmlFor="verifyPassword">Verify Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-on-surface font-medium placeholder:text-outline-variant"
                      id="verifyPassword"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              )}

              <button 
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : (
                    <>
                      {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )
                }
              </button>
            </form>

          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-surface-container-low/30 border-t border-outline-variant/10 text-center">
            <p className="text-sm font-medium text-on-surface-variant">
              {activeTab === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => switchTab(activeTab === 'signin' ? 'signup' : 'signin')}
                className="text-secondary font-bold hover:underline transition-all"
              >
                {activeTab === 'signin' ? 'Create account' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </div>

      </motion.div>

      {/* Subscription expired modal for non-admin users */}
      {showSubExpiredAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Subscription Expired</h2>
              </div>
              <button
                onClick={() => setShowSubExpiredAlert(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Your workspace subscription has expired. Please notify your admin to renew the subscription and restore access.
            </p>
            <button
              onClick={() => setShowSubExpiredAlert(false)}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-container transition-all active:scale-95"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
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

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const role = String(data?.user?.role ?? '').toLowerCase();
      onNavigate(role === 'staff' ? 'pos' : 'dashboard');
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

        {/* Brand visual hints */}
        <div className="mt-8 grid grid-cols-2 gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="aspect-video rounded-xl overflow-hidden shadow-inner border border-outline-variant/20">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB7-yBZCAOic5bjhXDz2R_62RAP0URuBQFBOdcuD2MH71PL5MpBdDC2FiSiTSab_oM-ROqHrOzsrZxMhqsmvT86D0tw5PJ3x70kic736ETnrEaHZW_M6eXZ6la3DBceM3oZSPA8qdWMC-77m-O4J9lzx6YwW2KILvSyQN646lzRSK1W2t7a5TsguMQpWfZq_HspllLnGEHWtRUBgS0KIh32VcTSqF8rFR2gBxJmBOQyMhStTSlqkc_TbmSs-9nvr5qx8sbYrlfCX8"
              alt="Brand Visual"
            />
          </div>
          <div className="aspect-video rounded-xl overflow-hidden shadow-inner border border-outline-variant/20">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaORF57MHkQGaFYeWLa1qFZjd9vtzd1t1KhxySguN1gfBqW9yl1_NkN2ffb_rEqIQ0Pf_LrU0raMJwABLtehT7PFxApi5DkY4kNQVtCSwPeWLsoOppeaBPRBPNhqB26I4tC37JHuF-K28DKPPulNor4F_j2XlVvMdgufc4nZg1Hn03lP0v_nHpdmex8roTNkOcneswYVKEbw7fhfwN6h6VQUkMZ_YILpdb56POKZRb2vo9MEjRH9Zt6ZDHcHna-5natlPlhQjzQ1Y"
              alt="Brand Visual"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

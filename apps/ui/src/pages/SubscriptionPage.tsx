import { useState } from 'react';
import { Zap, Star, CheckCircle2, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { Page } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const PLANS = [
  {
    key: 'entry' as const,
    name: 'Entry',
    monthlyPrice: 49,
    yearlyPrice: 490,
    icon: 'zap',
    accent: 'text-primary',
    accentBg: 'bg-primary/5',
    accentBorder: 'border-primary/40',
    features: ['1 branch', 'Up to 500 orders / month', 'Basic analytics', 'Email support'],
  },
  {
    key: 'mid' as const,
    name: 'Mid',
    monthlyPrice: 129,
    yearlyPrice: 1290,
    icon: 'star',
    accent: 'text-violet-700',
    accentBg: 'bg-violet-50',
    accentBorder: 'border-violet-200',
    features: ['Unlimited branches', 'Unlimited orders', 'Advanced analytics', 'Priority support'],
  },
];

interface SubscriptionPageProps {
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
}

export default function SubscriptionPage({ onNavigate, onSignOut }: SubscriptionPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planKey: 'entry' | 'mid') => {
    // Use renewal token (expired subscription login flow) or normal session token
    const token = sessionStorage.getItem('sub_renewal_token') ?? localStorage.getItem('access_token');
    if (!token) return;

    setLoadingPlan(planKey);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/subscription/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_type: planKey, billing_cycle: billingCycle }),
      });

      const data = await res.json() as { checkout_url?: string; detail?: string };

      if (!res.ok) {
        setError(data.detail ?? 'Failed to create payment session. Please try again.');
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      setError('Unable to reach the payment gateway. Please check your connection.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      {/* Sign out link */}
      <button
        onClick={onSignOut}
        className="absolute top-6 right-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>

      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 mb-5">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-3">Subscription Expired</h1>
        <p className="text-slate-500 text-base leading-relaxed">
          Your free trial or subscription has ended. Choose a plan below to restore access to your workspace.
        </p>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            billingCycle === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            billingCycle === 'yearly' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Yearly
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
            Save ~17%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl mb-6">
        {PLANS.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const isLoading = loadingPlan === plan.key;
          return (
            <div
              key={plan.key}
              className={`flex flex-col rounded-2xl border-2 p-7 bg-white shadow-sm hover:shadow-md transition-all ${plan.accentBorder}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {plan.icon === 'zap' && <Zap className={`w-5 h-5 ${plan.accent}`} />}
                {plan.icon === 'star' && <Star className={`w-5 h-5 ${plan.accent}`} />}
                <p className={`text-lg font-black ${plan.accent}`}>{plan.name}</p>
              </div>
              <div className="mb-5">
                <span className={`text-4xl font-black ${plan.accent}`}>₱{price}</span>
                <span className="text-slate-400 text-sm ml-1">/ {billingCycle === 'yearly' ? 'year' : 'month'}</span>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => void handleSubscribe(plan.key)}
                disabled={isLoading || loadingPlan !== null}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-60 ${plan.accentBg} ${plan.accent} border ${plan.accentBorder} hover:brightness-95`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  `Subscribe · ₱${price}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-5 py-3.5 bg-red-50 border border-red-100 rounded-xl max-w-2xl w-full">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-6 text-center">
        Payments are processed securely by PayMongo. You can cancel anytime.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { X, CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface PaymentModalProps {
  referenceType: 'order' | 'sale';
  referenceId: number;
  amount: number;
  description: string;
  customerName?: string;
  onClose: () => void;
  onPaymentSuccess?: (sessionId: string, method: string) => void;
}

type MethodKey = 'gcash' | 'paymaya' | 'card' | 'grab_pay';

interface PaymentMethod {
  key: MethodKey;
  label: string;
  sublabel: string;
  color: string;
  textColor: string;
  borderColor: string;
  badge: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    key: 'gcash',
    label: 'GCash',
    sublabel: 'Pay via GCash e-wallet',
    color: 'bg-[#007DFE]/10',
    textColor: 'text-[#007DFE]',
    borderColor: 'border-[#007DFE]/30',
    badge: 'G',
  },
  {
    key: 'paymaya',
    label: 'Maya',
    sublabel: 'Pay via Maya e-wallet',
    color: 'bg-[#3AC47D]/10',
    textColor: 'text-[#3AC47D]',
    borderColor: 'border-[#3AC47D]/30',
    badge: 'M',
  },
  {
    key: 'card',
    label: 'Card',
    sublabel: 'Visa, Mastercard, JCB',
    color: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    badge: '💳',
  },
  {
    key: 'grab_pay',
    label: 'GrabPay',
    sublabel: 'Pay via GrabPay wallet',
    color: 'bg-[#00B14F]/10',
    textColor: 'text-[#00B14F]',
    borderColor: 'border-[#00B14F]/30',
    badge: 'G',
  },
];

export default function PaymentModal({
  referenceType,
  referenceId,
  amount,
  description,
  customerName,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<MethodKey>('gcash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmtAmount = amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

  const handlePay = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoading(true);
    setError(null);

    const origin = window.location.origin;
    const successUrl = `${origin}/?pm_session={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/?pm_cancel=1`;

    try {
      const res = await fetch(`${API_BASE}/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference_type: referenceType,
          reference_id: referenceId,
          amount,
          description,
          customer_name: customerName,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail ?? 'Failed to create payment session.');
        return;
      }

      // Redirect to PayMongo hosted checkout
      window.location.href = data.checkout_url as string;
    } catch {
      setError('Unable to reach the payment gateway. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-primary">Online Payment</h2>
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Amount */}
          <div className="bg-surface-container rounded-xl px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Amount Due</span>
            <span className="text-2xl font-black text-primary">{fmtAmount}</span>
          </div>

          {/* Payment method selection */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => setSelectedMethod(method.key)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                    selectedMethod === method.key
                      ? `${method.color} ${method.borderColor} shadow-sm`
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                      selectedMethod === method.key
                        ? `${method.color} ${method.textColor}`
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {method.key === 'card' ? (
                      <CreditCard className="w-4 h-4" />
                    ) : (
                      method.badge
                    )}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${selectedMethod === method.key ? method.textColor : 'text-slate-700'}`}>
                      {method.label}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">{method.sublabel}</p>
                  </div>
                  {selectedMethod === method.key && (
                    <CheckCircle2 className={`w-4 h-4 ml-auto shrink-0 ${method.textColor}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info note */}
          <p className="text-xs text-slate-400 text-center">
            You will be redirected to PayMongo's secure checkout page to complete your payment.
          </p>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              `Pay ${fmtAmount}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

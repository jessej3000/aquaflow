import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Page } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type Status = 'loading' | 'success' | 'error';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function ActivatePage({ onNavigate }: Props) {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = window.location.pathname.split('/activate/')[1];
    if (!token) {
      setStatus('error');
      setMessage('Invalid activation link.');
      return;
    }

    fetch(`${API_BASE}/activate/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
          setMessage(data.message ?? 'Account activated successfully. You can now sign in.');
        } else {
          setStatus('error');
          setMessage(data.detail ?? 'Activation failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not reach the server. Please try again later.');
      });
  }, []);

  const handleSignIn = () => {
    window.history.replaceState({}, '', '/');
    onNavigate('auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-lg font-bold text-slate-800">Activating your account…</h1>
            <p className="text-sm text-slate-500 mt-2">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Account Activated!</h1>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <button
              onClick={handleSignIn}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-container transition-all active:scale-95"
            >
              Sign In
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Activation Failed</h1>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <button
              onClick={handleSignIn}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-container transition-all active:scale-95"
            >
              Go to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}

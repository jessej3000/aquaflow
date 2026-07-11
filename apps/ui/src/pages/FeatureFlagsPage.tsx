import { useEffect, useState } from 'react';
import { Loader2, Lock, Plus, Trash2, LogOut } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'ff_access_token';

interface FeatureFlag {
  id: number;
  key: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export default function FeatureFlagsPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [flagsError, setFlagsError] = useState('');
  const [loadingFlags, setLoadingFlags] = useState(false);

  const [newKey, setNewKey] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchFlags = async (authToken: string) => {
    setLoadingFlags(true);
    setFlagsError('');
    try {
      const res = await fetch(`${API_BASE}/ff/flags`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setLoginError('Session expired. Please sign in again.');
          return;
        }
        setFlagsError('Failed to load feature flags.');
        return;
      }
      const data = await res.json();
      setFlags(data.flags ?? []);
    } catch {
      setFlagsError('Failed to load feature flags.');
    } finally {
      setLoadingFlags(false);
    }
  };

  useEffect(() => {
    if (token) void fetchFlags(token);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE}/ff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = typeof body?.detail === 'string' ? body.detail : 'Invalid credentials.';
        setLoginError(msg);
        return;
      }
      const data = await res.json();
      sessionStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setPassword('');
    } catch {
      setLoginError('Could not reach the server. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setFlags([]);
  };

  const handleToggle = async (flag: FeatureFlag) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/ff/flags/${encodeURIComponent(flag.key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !flag.enabled }),
      });
      if (!res.ok) { setFlagsError('Failed to update flag.'); return; }
      await fetchFlags(token);
    } catch {
      setFlagsError('Failed to update flag.');
    }
  };

  const handleDelete = async (flag: FeatureFlag) => {
    if (!token) return;
    if (!window.confirm(`Delete feature flag "${flag.key}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/ff/flags/${encodeURIComponent(flag.key)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setFlagsError('Failed to delete flag.'); return; }
      await fetchFlags(token);
    } catch {
      setFlagsError('Failed to delete flag.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newKey.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/ff/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: newKey.trim(), description: newDescription.trim() || null, enabled: false }),
      });
      if (!res.ok) { setFlagsError('Failed to create flag.'); return; }
      setNewKey('');
      setNewDescription('');
      await fetchFlags(token);
    } catch {
      setFlagsError('Failed to create flag.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-8">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-slate-300" />
          </div>
          <h1 className="text-lg font-bold text-white mb-1">Feature Flags</h1>
          <p className="text-sm text-slate-400 mb-6">Sign in to manage feature flags.</p>

          {loginError && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-slate-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:border-slate-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Feature Flags</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {flagsError && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            {flagsError}
          </div>
        )}

        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="flag_key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:border-slate-500 outline-none"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:border-slate-500 outline-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {loadingFlags ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No feature flags yet.</div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
            {flags.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold text-white">{flag.key}</div>
                  {flag.description && (
                    <div className="text-xs text-slate-400 mt-1">{flag.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => { void handleToggle(flag); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    aria-label={flag.enabled ? 'Disable' : 'Enable'}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { void handleDelete(flag); }}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label={`Delete ${flag.key}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

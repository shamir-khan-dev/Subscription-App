import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Live Render backend (resumed)
const API = 'https://subscription-app-roow.onrender.com/api/v1';
// For local development fallback:
// const API = 'http://localhost:5500/api/v1';

// ── Category metadata ──────────────────────────────────────────────
const CATEGORY_META = {
  entertainment: { emoji: '🎬', color: 'var(--cat-entertainment)', bg: 'rgba(168,85,247,0.12)' },
  technology:    { emoji: '💻', color: 'var(--cat-technology)',    bg: 'rgba(59,130,246,0.12)'  },
  lifestyle:     { emoji: '🌿', color: 'var(--cat-lifestyle)',     bg: 'rgba(34,197,94,0.12)'   },
  sports:        { emoji: '⚡', color: 'var(--cat-sports)',        bg: 'rgba(249,115,22,0.12)'  },
  finance:       { emoji: '💰', color: 'var(--cat-finance)',       bg: 'rgba(245,166,35,0.12)'  },
  news:          { emoji: '📰', color: 'var(--cat-news)',          bg: 'rgba(6,182,212,0.12)'   },
  politics:      { emoji: '🏛️', color: 'var(--cat-politics)',      bg: 'rgba(239,68,68,0.12)'   },
  other:         { emoji: '📦', color: 'var(--cat-other)',         bg: 'rgba(139,146,181,0.12)' },
};

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£' };

// ── Monthly-equivalent price helper ──────────────────────────────
function toMonthly(price, frequency) {
  if (frequency === 'yearly')  return price / 12;
  if (frequency === 'weekly')  return price * 4.33;
  if (frequency === 'daily')   return price * 30;
  return price;
}

// ── Days until renewal ────────────────────────────────────────────
function daysUntil(date) {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Toast System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' exiting' : ''}`}>
          <span className="toast-icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span style={{ flex: 1, color: 'var(--text-primary)' }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '0 0 0 8px' }}
          >×</button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  return { toasts, addToast, removeToast };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth Page (Login + Register toggled)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setSuccess(null);
    setName(''); setEmail(''); setPassword(''); setConfirm('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/auth/sign-in`, { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('subTrackerToken', token);
      localStorage.setItem('subTrackerUser', JSON.stringify(user));
      onLogin(token, user);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. The server may be waking up — wait 30s and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/auth/sign-up`, { name, email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('subTrackerToken', token);
      localStorage.setItem('subTrackerUser', JSON.stringify(user));
      onLogin(token, user);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. The server may be waking up — wait 30s and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Brand */}
        <div className="login-logo">
          <div className="login-logo-icon">💳</div>
          <div className="login-logo-text">Sub<span>Tracker</span></div>
        </div>
        <p className="login-tagline">Your financial subscriptions. Tracked. Controlled. Optimized.</p>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: '1.5rem', border: '1px solid var(--border-sub)' }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                background: mode === m ? 'var(--bg-float)' : 'transparent',
                border: mode === m ? '1px solid var(--border-mid)' : '1px solid transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {m === 'login' ? '→ Sign In' : '+ Register'}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="error-banner" style={{ marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            <span>⚠ {error}</span>
          </div>
        )}
        {success && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--green)' }}>
            ✓ {success}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label htmlFor="login-email">Email Address</label>
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" required autoComplete="email" />
            </div>
            <div className="form-field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <button id="login-submit" type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}>
              {loading
                ? <><span className="animate-spin" style={{ display:'inline-block',width:16,height:16,border:'2px solid rgba(0,0,0,0.3)',borderTopColor:'#000',borderRadius:'50%' }} /> Signing in…</>
                : <>→ Sign In</>}
            </button>
            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              No account?{' '}
              <button type="button" onClick={() => switchMode('register')}
                style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'0.78rem',fontWeight:600,padding:0 }}>
                Create one →
              </button>
            </p>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-field">
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Shamir Khan" required minLength={2} autoComplete="name" />
            </div>
            <div className="form-field">
              <label htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" required autoComplete="email" />
            </div>
            <div className="grid-2">
              <div className="form-field">
                <label htmlFor="reg-password">Password</label>
                <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 chars" required minLength={6} autoComplete="new-password" />
              </div>
              <div className="form-field">
                <label htmlFor="reg-confirm">Confirm</label>
                <input id="reg-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password" required autoComplete="new-password"
                  style={{ borderColor: confirm && confirm !== password ? 'var(--red)' : undefined }} />
              </div>
            </div>
            {confirm && confirm !== password && (
              <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '0.75rem' }}>
                ✕ Passwords don't match
              </p>
            )}
            <button id="register-submit" type="submit" disabled={loading || (confirm && confirm !== password)} className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}>
              {loading
                ? <><span className="animate-spin" style={{ display:'inline-block',width:16,height:16,border:'2px solid rgba(0,0,0,0.3)',borderTopColor:'#000',borderRadius:'50%' }} /> Creating account…</>
                : <>+ Create Account</>}
            </button>
            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Already have one?{' '}
              <button type="button" onClick={() => switchMode('login')}
                style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'0.78rem',fontWeight:600,padding:0 }}>
                Sign in →
              </button>
            </p>
          </form>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
          🌙 Hosted on Render free tier — first request may take ~30s to wake the server.
        </p>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Stats Bar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StatsBar({ subscriptions }) {
  const active = subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = active.reduce((sum, s) => sum + toMonthly(s.price, s.frequency), 0);

  const nextRenewal = [...active]
    .filter(s => s.renewalDate)
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))[0];

  return (
    <div className="stats-bar">
      <div className="stat-card gold">
        <div className="stat-label">Monthly Spend</div>
        <div className="stat-value gold mono">${monthlyTotal.toFixed(2)}</div>
        <div className="stat-sub mono">${(monthlyTotal * 12).toFixed(0)}/yr projected</div>
      </div>
      <div className="stat-card teal">
        <div className="stat-label">Active Subs</div>
        <div className="stat-value teal mono">{active.length}</div>
        <div className="stat-sub">{subscriptions.length - active.length} inactive</div>
      </div>
      <div className="stat-card purple">
        <div className="stat-label">Next Renewal</div>
        <div className="stat-value purple mono" style={{ fontSize: '1.25rem' }}>
          {nextRenewal ? (
            daysUntil(nextRenewal.renewalDate) <= 0
              ? 'Today'
              : `${daysUntil(nextRenewal.renewalDate)}d`
          ) : '—'}
        </div>
        <div className="stat-sub">
          {nextRenewal ? nextRenewal.name : 'No upcoming renewals'}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Subscription Card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SubCard({ sub, onDelete, onCancel, onEdit, onResume, style }) {
  const meta = CATEGORY_META[sub.category] || CATEGORY_META.other;
  const currSymbol = CURRENCY_SYMBOL[sub.currency] || sub.currency;
  const monthlyEq = toMonthly(sub.price, sub.frequency);
  const renewal = sub.renewalDate ? daysUntil(sub.renewalDate) : null;

  return (
    <div className="sub-card" style={style}>
      <div className="sub-card-accent" style={{ background: meta.color }} />

      <div className="sub-card-top">
        <div className="sub-card-icon-name">
          <div className="sub-card-emoji" style={{ background: meta.bg }}>
            {meta.emoji}
          </div>
          <div>
            <div className="sub-card-name">{sub.name}</div>
            <div className="sub-card-category" style={{ color: meta.color }}>{sub.category}</div>
          </div>
        </div>
        <span className={`sub-card-badge badge-${sub.status}`}>{sub.status}</span>
      </div>

      <div className="sub-card-price-row">
        <div>
          <span className="sub-card-price mono">{currSymbol}{sub.price}</span>
          <span className="sub-card-freq mono">/{sub.frequency}</span>
        </div>
        {sub.frequency !== 'monthly' && (
          <div className="sub-card-monthly mono">
            ${monthlyEq.toFixed(2)}
            <span>/mo equiv.</span>
          </div>
        )}
      </div>

      <div className="sub-card-meta">
        <div className="sub-meta-item">
          <span>💳</span> {sub.paymentMethod}
        </div>
        <div className="sub-meta-item">
          {renewal !== null ? (
            renewal <= 0
              ? <><span>🔴</span> Renews today</>
              : renewal <= 7
              ? <><span>🟡</span> {renewal}d left</>
              : <><span>📅</span> {renewal}d left</>
          ) : (
            <><span>📅</span> {new Date(sub.startDate).toLocaleDateString()}</>
          )}
        </div>
      </div>

      <div className="sub-card-actions">
        {sub.status === 'active' ? (
          <button className="btn btn-ghost" id={`cancel-${sub._id}`} onClick={() => onCancel(sub)}>
            ⏸ Pause
          </button>
        ) : (
          <button className="btn btn-ghost" id={`resume-${sub._id}`} onClick={() => onResume(sub)} style={{ background: 'var(--green-dim)', color: 'var(--green)', borderColor: 'rgba(34,197,94,0.2)' }}>
            ▶ Resume
          </button>
        )}
        <button className="btn btn-ghost" id={`edit-${sub._id}`} onClick={() => onEdit(sub)}>
          ✏️ Edit
        </button>
        <button className="btn btn-danger" id={`delete-${sub._id}`} onClick={() => onDelete(sub)}>
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Confirm Dialog
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ConfirmDialog({ item, action, onConfirm, onCancel, loading }) {
  const isDelete = action === 'delete';
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">{isDelete ? '🗑' : '⏸'}</div>
        <div className="confirm-title">{isDelete ? 'Delete Subscription?' : 'Cancel Subscription?'}</div>
        <p className="confirm-text">
          {isDelete
            ? `This will permanently remove "${item.name}" from your tracker. This action cannot be undone.`
            : `This will mark "${item.name}" as cancelled. You can always add it again later.`}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-ghost" id="confirm-cancel-btn" onClick={onCancel}>Go Back</button>
          <button
            className={`btn ${isDelete ? 'btn-danger' : 'btn-ghost'}`}
            id="confirm-action-btn"
            onClick={onConfirm}
            disabled={loading}
            style={!isDelete ? { background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid rgba(234,179,8,0.2)' } : {}}
          >
            {loading
              ? <><span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Working…</>
              : isDelete ? 'Yes, Delete' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Add Subscription Modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BLANK_FORM = {
  name: '', price: '', currency: 'USD', frequency: 'monthly',
  category: 'entertainment', paymentMethod: '',
  startDate: new Date().toISOString().split('T')[0],
};

function SubscriptionModal({ onClose, onSuccess, token, subscription }) {
  const isEdit = !!subscription;
  const [form, setForm] = useState(() => {
    if (isEdit) {
      return {
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency || 'USD',
        frequency: subscription.frequency || 'monthly',
        category: subscription.category || 'entertainment',
        paymentMethod: subscription.paymentMethod || '',
        startDate: subscription.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };
    }
    return BLANK_FORM;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await axios.put(`${API}/subscriptions/${subscription._id}`, {
          ...form,
          price: Number(form.price),
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/subscriptions`, {
          ...form,
          price: Number(form.price),
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'save'} subscription.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Subscription' : 'Add Subscription'}</h2>
          <button className="modal-close" id="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            <span>⚠ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="sub-name">Service Name</label>
            <input
              id="sub-name"
              type="text"
              placeholder="Netflix, Spotify, GitHub Pro…"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="grid-2">
            <div className="form-field">
              <label htmlFor="sub-price">Price</label>
              <input
                id="sub-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="14.99"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="sub-currency">Currency</label>
              <select id="sub-currency" value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-field">
              <label htmlFor="sub-frequency">Billing Cycle</label>
              <select id="sub-frequency" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="sub-category">Category</label>
              <select id="sub-category" value={form.category} onChange={e => set('category', e.target.value)}>
                {Object.entries(CATEGORY_META).map(([key, m]) => (
                  <option key={key} value={key}>{m.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="sub-payment">Payment Method</label>
            <input
              id="sub-payment"
              type="text"
              placeholder="Chase Visa, PayPal, Apple Pay…"
              value={form.paymentMethod}
              onChange={e => set('paymentMethod', e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="sub-start">Start Date</label>
            <input
              id="sub-start"
              type="date"
              value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {form.price && form.frequency && (
            <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              ≈ ${toMonthly(Number(form.price), form.frequency).toFixed(2)}/mo · ${(toMonthly(Number(form.price), form.frequency) * 12).toFixed(2)}/yr
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" id="modal-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="modal-submit-btn" disabled={submitting}>
              {submitting
                ? <><span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} /> Saving…</>
                : isEdit ? 'Save Changes' : '+ Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main App
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('subTrackerToken'));
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('subTrackerUser')); } catch { return null; }
  });

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [showAdd, setShowAdd]             = useState(false);
  const [editingSub, setEditingSub]       = useState(null);
  const [confirmItem, setConfirmItem]     = useState(null); // { sub, action }
  const [actionLoading, setActionLoading] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Login
  const handleLogin = (t, u) => {
    setToken(t);
    setUser(u);
  };

  // Logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setSubscriptions([]);
    localStorage.removeItem('subTrackerToken');
    localStorage.removeItem('subTrackerUser');
  };

  // Fetch subscriptions — uses /user/:id endpoint which actually works
  const fetchSubscriptions = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/subscriptions/user/${user._id}`, authHeaders);
      setSubscriptions(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Could not reach the server. It may be waking up — please retry in 30 seconds.');
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  useEffect(() => {
    if (token && user) fetchSubscriptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // Delete
  const handleDelete = async () => {
    if (!confirmItem) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API}/subscriptions/${confirmItem.sub._id}`, authHeaders);
      setConfirmItem(null);
      addToast(`"${confirmItem.sub.name}" deleted successfully.`, 'success');
      fetchSubscriptions();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel
  const handleCancel = async () => {
    if (!confirmItem) return;
    setActionLoading(true);
    try {
      await axios.put(`${API}/subscriptions/${confirmItem.sub._id}/cancel`, {}, authHeaders);
      setConfirmItem(null);
      addToast(`"${confirmItem.sub.name}" has been paused.`, 'info');
      fetchSubscriptions();
    } catch (err) {
      addToast(err.response?.data?.message || 'Pause failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Resume / Reactivate
  const handleResume = async (sub) => {
    try {
      await axios.put(`${API}/subscriptions/${sub._id}`, { status: 'active' }, authHeaders);
      addToast(`"${sub.name}" has been reactivated.`, 'success');
      fetchSubscriptions();
    } catch (err) {
      addToast(err.response?.data?.message || 'Reactivation failed.', 'error');
    }
  };

  // ── Login Screen ──────────────────────────────────────────────
  if (!token) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────
  return (
    <>
      <div className="app-wrapper">

        {/* Header */}
        <header className="app-header">
          <div className="header-brand">
            <div className="header-brand-icon">💳</div>
            <div className="header-brand-name">Sub<span>Tracker</span></div>
          </div>

          <div className="header-greeting">
            <div className="header-greeting-name">{user?.name}</div>
            <div className="header-greeting-sub mono">{user?.email}</div>
          </div>

          <div className="header-actions">
            <button
              id="add-subscription-btn"
              className="btn btn-primary"
              onClick={() => setShowAdd(true)}
            >
              + Add New
            </button>
            <button
              id="refresh-btn"
              className="btn btn-ghost"
              onClick={fetchSubscriptions}
              disabled={loading}
              title="Refresh"
            >
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} /> : '↻'}
            </button>
            <button id="logout-btn" className="btn btn-ghost" onClick={handleLogout} title="Logout">
              ⏻
            </button>
          </div>
        </header>

        {/* Stats */}
        {subscriptions.length > 0 && !loading && (
          <StatsBar subscriptions={subscriptions} />
        )}

        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>⚠ {error}</span>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', flexShrink: 0 }} onClick={fetchSubscriptions}>
              Retry
            </button>
          </div>
        )}

        {/* Subscriptions */}
        <div>
          <div className="section-header">
            <div className="section-title">Subscriptions</div>
            {subscriptions.length > 0 && (
              <div className="section-count">{subscriptions.length} total</div>
            )}
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <div className="loading-text">Connecting to server…</div>
            </div>
          ) : (
            <div className="sub-grid">
              {subscriptions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <div className="empty-title">No subscriptions yet</div>
                  <p className="empty-sub">
                    Start tracking your digital expenses. Add your first subscription to see your spending insights.
                  </p>
                  <button className="btn btn-primary" id="empty-add-btn" onClick={() => setShowAdd(true)}>
                    + Add First Subscription
                  </button>
                </div>
              ) : (
                subscriptions.map((sub, i) => (
                  <SubCard
                    key={sub._id}
                    sub={sub}
                    style={{ animationDelay: `${i * 60}ms` }}
                    onDelete={sub => setConfirmItem({ sub, action: 'delete' })}
                    onCancel={sub => setConfirmItem({ sub, action: 'cancel' })}
                    onEdit={sub => setEditingSub(sub)}
                    onResume={handleResume}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <SubscriptionModal
          token={token}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            addToast('Subscription added successfully!', 'success');
            fetchSubscriptions();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingSub && (
        <SubscriptionModal
          token={token}
          subscription={editingSub}
          onClose={() => setEditingSub(null)}
          onSuccess={() => {
            setEditingSub(null);
            addToast('Subscription updated successfully!', 'success');
            fetchSubscriptions();
          }}
        />
      )}

      {/* Confirm Dialog */}
      {confirmItem && (
        <ConfirmDialog
          item={confirmItem.sub}
          action={confirmItem.action}
          loading={actionLoading}
          onConfirm={confirmItem.action === 'delete' ? handleDelete : handleCancel}
          onCancel={() => setConfirmItem(null)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

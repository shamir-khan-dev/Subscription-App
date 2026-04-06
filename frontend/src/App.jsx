import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, RefreshCw, Calendar, LogIn, X, LogOut, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = 'https://subscription-app-roow.onrender.com/api/v1';

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('subTrackerToken') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('subTrackerUser')) || null);
  
  // Dashboard State
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login Form Data
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // New Subscription Form Data
  const [newSub, setNewSub] = useState({
    name: '',
    price: '',
    currency: 'USD',
    frequency: 'monthly',
    category: 'entertainment',
    paymentMethod: '',
    startDate: new Date().toISOString().split('T')[0] // Defaults to today
  });

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/sign-in`, {
        email: loginEmail,
        password: loginPassword
      });
      const receivedToken = res.data.data.token;
      const receivedUser = res.data.data.user;
      
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('subTrackerToken', receivedToken);
      localStorage.setItem('subTrackerUser', JSON.stringify(receivedUser));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Make sure your email and password are correct, and the server is awake.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('subTrackerToken');
    localStorage.removeItem('subTrackerUser');
    setSubscriptions([]);
  };

  // Fetch Subscriptions
  const fetchSubscriptions = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Must pass the token Authorization header!
      const response = await axios.get(`${API_BASE_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(response.data.data || []);
    } catch (err) {
      if(err.response?.status === 401) {
        handleLogout(); // Token expired
      } else {
        setError('Could not connect to the backend server. Make sure it is awake!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Run on load or when token changes
  useEffect(() => {
    if (token) {
      fetchSubscriptions();
    }
  }, [token]);

  // Handle Create Subscription
  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/subscriptions`, {
        ...newSub,
        price: Number(newSub.price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Close modal and refresh list securely
      setIsModalOpen(false);
      setNewSub({
        name: '', price: '', currency: 'USD', frequency: 'monthly',
        category: 'entertainment', paymentMethod: '', startDate: new Date().toISOString().split('T')[0]
      });
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View: LOGIN SCREEN
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>Sub-Tracker</h1>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '2rem' }}>Welcome back. Sign in to your account.</p>
          
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #ef4444' }}>{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <LogIn size={20} />} 
              {loading ? 'Waking Server...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // View: DASHBOARD SCREEN
  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>Welcome, {user?.name}</h1>
          <p style={{ color: '#94a3b8' }}>Manage your digital expenses effortlessly.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Add New
          </button>
          <button onClick={handleLogout} style={{ background: '#334155', color: '#cbd5e1' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="glass-card" style={{ borderColor: '#ef4444', color: '#fca5a5', marginBottom: '2rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>{error}</span>
          <button onClick={fetchSubscriptions} style={{ backgroundColor: '#ef4444' }}>Retry</button>
        </div>
      )}

      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <RefreshCw className="animate-spin" size={48} color="#3b82f6" />
            <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Connecting to Backend...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {subscriptions.length === 0 ? (
              <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <CreditCard size={48} color="#3b82f6" />
                </div>
                <h2>No tracking data yet!</h2>
                <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
                  You don't have any active subscriptions. Add your first digital expense to start managing your cashflow.
                </p>
                <button onClick={() => setIsModalOpen(true)} style={{ margin: '0 auto', padding: '0.8rem 2rem' }}>
                  <Plus size={20} /> Add My First Subscription
                </button>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div key={sub._id} className="glass-card" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {sub.status}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '12px', borderRadius: '12px' }}>
                      <CheckCircle2 size={24} color="#3b82f6" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{sub.name}</h3>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', textTransform: 'capitalize' }}>{sub.category}</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Price</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {sub.currency === 'USD' ? '$' : sub.currency === 'EUR' ? '€' : '£'}
                      {sub.price}
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'normal' }}> / {sub.frequency}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={16} /> {sub.paymentMethod}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} /> {new Date(sub.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* --- ADD NEW SUBSCRIPTION MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Add Subscription</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', padding: '4px', border: 'none' }}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription}>
              <div className="form-group">
                <label>Service Name</label>
                <input type="text" placeholder="Netflix, Spotify, GitHub Pro..." value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} required minLength={2} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" min="0" placeholder="14.99" value={newSub.price} onChange={e => setNewSub({...newSub, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select value={newSub.currency} onChange={e => setNewSub({...newSub, currency: e.target.value})}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Frequency</label>
                  <select value={newSub.frequency} onChange={e => setNewSub({...newSub, frequency: e.target.value})}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={newSub.category} onChange={e => setNewSub({...newSub, category: e.target.value})}>
                    <option value="entertainment">Entertainment</option>
                    <option value="technology">Technology</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="sports">Sports</option>
                    <option value="finance">Finance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <input type="text" placeholder="Chase Visa, PayPal, Apple Pay..." value={newSub.paymentMethod} onChange={e => setNewSub({...newSub, paymentMethod: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={newSub.startDate} onChange={e => setNewSub({...newSub, startDate: e.target.value})} required max={new Date().toISOString().split('T')[0]} />
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />} 
                  {isSubmitting ? 'Saving...' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

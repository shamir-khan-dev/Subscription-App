import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Plus, RefreshCw, Calendar, Trash2 } from 'lucide-react';

const API_BASE_URL = 'https://subscription-app-roow.onrender.com/api/v1';

function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // NOTE: For now we're just checking the connection.
      // In a real app, you'd be logged in and sending a token!
      const response = await axios.get(`${API_BASE_URL}/subscriptions`);
      setSubscriptions(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Could not connect to the backend server. Make sure it is awake!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Sub-Tracker</h1>
          <p style={{ color: '#94a3b8' }}>Manage your digital expenses effortlessly.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add New
        </button>
      </header>

      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <RefreshCw className="animate-spin" size={48} color="#3b82f6" />
            <p style={{ marginTop: '1rem' }}>Waking up the server...</p>
          </div>
        ) : error ? (
          <div className="glass-card" style={{ borderColor: '#ef4444', color: '#fca5a5', textAlign: 'center' }}>
            <p>{error}</p>
            <button onClick={fetchSubscriptions} style={{ marginTop: '1rem', backgroundColor: '#ef4444' }}>Retry</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {subscriptions.length === 0 ? (
              <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>No subscriptions found. Create your first one!</p>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div key={sub._id} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ background: '#334155', padding: '10px', borderRadius: '12px' }}>
                      <CreditCard size={24} color="#3b82f6" />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>${sub.price}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>{sub.frequency}</p>
                    </div>
                  </div>
                  <h3 style={{ marginBottom: '1rem' }}>{sub.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <Calendar size={16} />
                    <span>Renew Date: {new Date(sub.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
        &copy; 2026 Shamir Dev - Sub-Tracker Pro &bull; Powered by React + Vite
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}} />
    </div>
  );
}

export default App;

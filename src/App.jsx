import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setIsVerifying(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token invalid or expired — force login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        // Backend unreachable — fallback to stored user for offline use
        console.warn('Backend unreachable, using cached session:', err.message);
        setUser(JSON.parse(storedUser));
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Show nothing while verifying to avoid flash
  if (isVerifying) {
    return (
      <div className="app-root">
        <div className="bg-grid"></div>
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="auth-page">
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
            <p>กำลังตรวจสอบเซสชัน...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="bg-grid"></div>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {!user ? (
        <div className="auth-page">
          {showRegister ? (
            <Register
              onSwitchToLogin={() => setShowRegister(false)}
              onRegisterSuccess={() => setShowRegister(false)}
            />
          ) : (
            <Login
              onSwitchToRegister={() => setShowRegister(true)}
              onLogin={(userData) => setUser(userData)}
            />
          )}
        </div>
      ) : (
        <Dashboard
          candidates={candidates}
          setCandidates={setCandidates}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app-root">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

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

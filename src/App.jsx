import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import { LogOut, User } from 'lucide-react';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Check for existing login on mount
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
    <div className="app-container relative overflow-hidden">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      
      <header className="app-header">
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div className="logo-section group cursor-pointer">
            <div className="logo-icon text-3xl group-hover:scale-110 transition-transform duration-300">🌪️</div>
            <h1 className="text-gradient font-bold tracking-tight">LLM-Powered Job Matching and Candidate Analysis System</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-secondary flex items-center gap-2"><User size={16}/> {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary text-xs" style={{ padding: '0.4rem 0.8rem' }}>
                <LogOut size={14}/> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {!user ? (
          showRegister ? (
            <Register 
              onSwitchToLogin={() => setShowRegister(false)} 
              onRegisterSuccess={() => setShowRegister(false)} 
            />
          ) : (
            <Login 
              onSwitchToRegister={() => setShowRegister(true)} 
              onLogin={(userData) => setUser(userData)} 
            />
          )
        ) : (
          <Dashboard 
            candidates={candidates} 
            setCandidates={setCandidates} 
          />
        )}
      </main>
    </div>
  );
}

export default App;

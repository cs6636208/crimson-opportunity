import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and call parent
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col items-center justify-center h-full w-full animate-fade-in" style={{ padding: '2rem', display: 'flex' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌪️</div>
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="text-secondary text-sm">Sign in to your AI HR assistant</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label mb-2 block">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3 text-secondary" />
              <input
                type="email"
                required
                className="input-field w-full pl-12"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="input-label mb-2 block">Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3 text-secondary" />
              <input
                type="password"
                required
                className="input-field w-full pl-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4 w-full justify-center"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : <><ArrowRight size={18} /> Sign In</>}
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-6 border-t border-white/10 pt-6">
          Don't have an account?{' '}
          <button
            style={{ background: 'transparent', border: 'none', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.875rem', fontWeight: 500 }}
            onClick={onSwitchToRegister}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

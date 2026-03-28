import React, { useState } from 'react';
import { User, Lock, Mail, ShieldAlert } from 'lucide-react';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onRegisterSuccess(email); // Automatically switch to login screen with email pre-filled if desired
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
          <ShieldAlert size={48} className="text-accent mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Create Account</h2>
          <p className="text-secondary text-sm">Join the AI HR Platform</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label mb-2 block">Full Name</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-3 text-secondary" />
              <input
                type="text"
                required
                className="input-field w-full pl-12"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
                minLength={6}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-6 border-t border-white/10 pt-6">
          Already have an account?{' '}
          <button
            style={{ background: 'transparent', border: 'none', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.875rem', fontWeight: 500 }}
            onClick={onSwitchToLogin}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { User, Lock, Mail, ShieldCheck } from 'lucide-react';

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
        throw new Error(data.error || 'ลงทะเบียนไม่สำเร็จ');
      }

      onRegisterSuccess(email); 
    } catch (err) {
      setError(err.message === 'User already exists' ? 'มีอีเมลนี้ในระบบแล้ว' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-brand">
        <div className="auth-brand-icon">
          <ShieldCheck size={24} style={{ color: 'var(--cyan)' }} />
        </div>
        <h2 className="text-gradient">สร้างบัญชีใหม่</h2>
        <p className="text-secondary">เข้าร่วมแพลตฟอร์มสรรหาด้วย AI</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="input-label mb-2 block">ชื่อ - นามสกุล</label>
          <div className="auth-input-wrap">
            <User size={16} className="auth-input-icon" />
            <input
              type="text"
              required
              className="input-field"
              placeholder="สมชาย ใจดี"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="input-label mb-2 block">อีเมล</label>
          <div className="auth-input-wrap">
            <Mail size={16} className="auth-input-icon" />
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="input-label mb-2 block">รหัสผ่าน</label>
          <div className="auth-input-wrap">
            <Lock size={16} className="auth-input-icon" />
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-glow w-full mt-4"
          style={{ justifyContent: 'center', padding: '0.7rem 1.25rem' }}
          disabled={loading}
        >
          {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <div className="auth-footer">
        มีบัญชีอยู่แล้ว?{' '}
        <button onClick={onSwitchToLogin}>เข้าสู่ระบบ</button>
      </div>
    </div>
  );
};

export default Register;

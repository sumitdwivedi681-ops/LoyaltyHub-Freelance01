'use client';
import { useState } from 'react';
import { authApi } from '@/services/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 400, padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Forgot Password?</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12 }}>
            <p style={{ color: '#10b981' }}>✅ Check your inbox for the reset link!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link href="/login" style={{ display: 'block', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

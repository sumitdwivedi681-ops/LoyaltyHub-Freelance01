'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

function RegisterForm() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'CUSTOMER',
    storeName: '', referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const ref = params.get('ref');
  if (ref && !form.referralCode) setForm(f => ({ ...f, referralCode: ref }));

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to LoyaltyHub 🎉');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 480, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💎</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }} className="gradient-text">
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Join LoyaltyHub today
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Role Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 12, padding: 4 }}>
            {['CUSTOMER', 'MERCHANT'].map(r => (
              <button key={r} type="button"
                onClick={() => setForm(f => ({ ...f, role: r }))}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                  background: form.role === r ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                  color: form.role === r ? '#fff' : 'var(--text-secondary)',
                }}>
                {r === 'CUSTOMER' ? '👤 Customer' : '🏪 Merchant'}
              </button>
            ))}
          </div>

          <input id="reg-name" name="name" className="input-field" placeholder="Full Name" value={form.name} onChange={handle} required />
          <input id="reg-email" name="email" type="email" className="input-field" placeholder="Email Address" value={form.email} onChange={handle} required />
          <input id="reg-password" name="password" type="password" className="input-field" placeholder="Password (min 8 chars)" value={form.password} onChange={handle} required minLength={8} />
          <input id="reg-phone" name="phone" className="input-field" placeholder="Phone Number (optional)" value={form.phone} onChange={handle} />

          {form.role === 'MERCHANT' && (
            <input id="reg-store" name="storeName" className="input-field" placeholder="Store Name" value={form.storeName} onChange={handle} required />
          )}

          <input id="reg-referral" name="referralCode" className="input-field" placeholder="Referral Code (optional)" value={form.referralCode} onChange={handle} />

          <button id="reg-submit" type="submit" className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.9rem', marginTop: 4 }}
            disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}

'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'CUSTOMER') router.push('/customer/dashboard');
      else if (user.role === 'MERCHANT') router.push('/merchant/dashboard');
      else if (user.role === 'SUPER_ADMIN') router.push('/admin/dashboard');
    }
  }, [user, loading, router]);

  return (
    <main className="auth-bg flex-col text-center">
      <div className="animate-fade-in max-w-2xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center gap-3">
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24
          }}>💎</div>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}
            className="gradient-text">LoyaltyHub</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Turn Every Purchase Into a{' '}
          <span className="gradient-text">Reward</span>
        </h1>

        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.7 }}>
          A modern loyalty management platform for customers and merchants.
          Earn points, redeem rewards, and grow your business with data-driven insights.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            🚀 Get Started Free
          </Link>
          <Link href="/login" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Sign In
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
          {['🎯 Points & Rewards', '📊 Analytics', '📱 PWA Ready', '🏆 Tier System', '🎫 QR Coupons'].map(f => (
            <span key={f} style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 999,
              padding: '0.375rem 0.875rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}>{f}</span>
          ))}
        </div>
      </div>
    </main>
  );
}

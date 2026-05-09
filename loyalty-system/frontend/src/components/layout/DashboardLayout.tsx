'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';

interface Props { children: ReactNode; allowedRoles?: string[]; }

export default function DashboardLayout({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💎</div>
        <p className="gradient-text" style={{ fontWeight: 700 }}>Loading LoyaltyHub...</p>
      </div>
    </div>
  );
  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="dashboard-layout" style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}

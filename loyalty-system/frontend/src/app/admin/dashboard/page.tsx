'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsApi } from '@/services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getPlatformStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Customers', value: stats.totalUsers, color: '#6366f1' },
    { name: 'Merchants', value: stats.totalMerchants, color: '#8b5cf6' },
  ] : [];

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Platform Overview</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>LoyaltyHub global analytics</p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: '2rem' }}>
              {[
                { label: 'Total Customers', value: stats?.totalUsers?.toLocaleString(), icon: '👥', color: '#6366f1' },
                { label: 'Total Merchants', value: stats?.totalMerchants?.toLocaleString(), icon: '🏪', color: '#8b5cf6' },
                { label: 'Transactions', value: stats?.totalTransactions?.toLocaleString(), icon: '💳', color: '#06b6d4' },
                { label: 'Points Issued', value: stats?.totalPointsIssued?.toLocaleString(), icon: '⭐', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', maxWidth: 400 }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>User Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

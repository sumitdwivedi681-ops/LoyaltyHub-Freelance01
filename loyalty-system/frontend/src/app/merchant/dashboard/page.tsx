'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsApi } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function StatCard({ label, value, icon, change }: any) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {change !== undefined && (
        <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: 6 }}>↑ {change}% this month</p>
      )}
    </div>
  );
}

export default function MerchantDashboard() {
  const [data, setData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.getMerchantDashboard(), analyticsApi.getSalesReport(30)])
      .then(([d, s]) => {
        setData(d.data);
        setSalesData(s.data.chartData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const customTooltipStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: 8, padding: '8px 12px',
  };

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {data?.merchant?.storeName || 'Merchant'} Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Last 30 days overview</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: '2rem' }}>
              <StatCard label="Total Customers" value={data?.stats?.totalCustomers} icon="👥" change={12} />
              <StatCard label="Transactions" value={data?.stats?.totalTransactions} icon="💳" change={8} />
              <StatCard label="Points Issued" value={data?.stats?.totalPointsIssued?.toLocaleString()} icon="⭐" />
              <StatCard label="Revenue" value={`₹${data?.stats?.totalRevenue?.toLocaleString() || 0}`} icon="💰" change={15} />
              <StatCard label="Active Rewards" value={data?.stats?.activeRewards} icon="🎁" />
              <StatCard label="Active Coupons" value={data?.stats?.activeCoupons} icon="🎫" />
            </div>

            {/* Revenue Chart */}
            {salesData.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Revenue & Points (Last 30 Days)</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="rgba(99,102,241,0.1)" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue (₹)" />
                    <Line yAxisId="right" type="monotone" dataKey="points" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Points" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Transaction Count Chart */}
            {salesData.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Daily Transactions</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={salesData}>
                    <CartesianGrid stroke="rgba(99,102,241,0.1)" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Transactions */}
            {data?.recentTransactions?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Transactions</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Points</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.map((tx: any) => (
                      <tr key={tx.id}>
                        <td>{tx.customer?.name}</td>
                        <td>{tx.purchaseAmount ? `₹${tx.purchaseAmount}` : '—'}</td>
                        <td><span className="points-chip">+{tx.pointsEarned}</span></td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

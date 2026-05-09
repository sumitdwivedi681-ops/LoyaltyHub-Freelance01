'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsApi } from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MerchantAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.getSalesReport(period)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [period]);

  const totalRevenue = data?.chartData?.reduce((s: number, d: any) => s + d.revenue, 0) || 0;
  const totalPoints = data?.chartData?.reduce((s: number, d: any) => s + d.points, 0) || 0;
  const totalTx = data?.chartData?.reduce((s: number, d: any) => s + d.count, 0) || 0;

  const tooltipStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 };

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Analytics</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Sales and points performance</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setPeriod(d)}
                className={period === d ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '2rem' }}>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>₹{totalRevenue.toLocaleString()}</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.8rem' }}>Total Revenue</p>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>{totalPoints.toLocaleString()}</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.8rem' }}>Points Issued</p>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalTx}</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.8rem' }}>Transactions</p>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 300 }} />
        ) : data?.chartData?.length > 0 ? (
          <>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(99,102,241,0.1)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} name="Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Points Issued Trend</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="ptsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(139,92,246,0.1)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="points" stroke="#8b5cf6" fill="url(#ptsGrad)" strokeWidth={2} name="Points" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 64 }}>📊</div>
            <p style={{ marginTop: 16 }}>No data for the selected period. Start processing transactions!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

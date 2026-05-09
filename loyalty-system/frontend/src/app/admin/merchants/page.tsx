'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsApi, merchantsApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminMerchantsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => analyticsApi.getMerchantsStats().then(r => setData(r.data));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const toggle = async (id: string, current: boolean) => {
    try {
      await merchantsApi.getAll(1); // just to check auth
      // Using admin endpoint directly
      await fetch(`/api/merchants/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive: !current }) });
      toast.success(`Merchant ${current ? 'deactivated' : 'activated'}!`);
      await load();
    } catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Merchant Management</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>All merchants on the platform</p>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Owner</th>
                  <th>Transactions</th>
                  <th>Rewards</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(data) ? data : data?.merchants || []).map((m: any) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.storeName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.owner?.name} <br /><span style={{ fontSize: '0.75rem' }}>{m.owner?.email}</span></td>
                    <td>{m._count?.transactions || 0}</td>
                    <td>{m._count?.rewards || 0}</td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem', padding: '3px 10px', borderRadius: 999, fontWeight: 700,
                        background: m.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: m.isActive ? '#10b981' : '#ef4444',
                      }}>
                        {m.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

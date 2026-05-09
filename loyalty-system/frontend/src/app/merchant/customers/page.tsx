'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { merchantsApi } from '@/services/api';

export default function MerchantCustomersPage() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p: number, s?: string) => {
    setLoading(true);
    merchantsApi.getCustomers(p, s)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const tierBadge = (tier: string) => (
    <span className={`tier-${tier.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
      {tier}
    </span>
  );

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Customer Management</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              {data?.total ?? 0} customers have visited your store
            </p>
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              className="input-field"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 250 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Search</button>
          </form>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Tier</th>
                    <th>Points</th>
                    <th>Since</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.customers?.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                      <td>{c.loyaltyPoints?.tier ? tierBadge(c.loyaltyPoints.tier) : '—'}</td>
                      <td><span className="points-chip">⭐ {c.loyaltyPoints?.points?.toLocaleString() || 0}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} onClick={() => { setPage(p => p - 1); load(page - 1, search); }} disabled={page === 1}>← Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Page {page}
                </span>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} onClick={() => { setPage(p => p + 1); load(page + 1, search); }} disabled={!data?.customers || data.customers.length < 20}>Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

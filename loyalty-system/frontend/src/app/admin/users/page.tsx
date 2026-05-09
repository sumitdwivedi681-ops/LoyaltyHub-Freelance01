'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersApi } from '@/services/api';

export default function AdminUsersPage() {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p: number) => {
    setLoading(true);
    usersApi.getAll(p).then(r => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(1); }, []);

  const roleColors: Record<string, string> = { CUSTOMER: '#6366f1', MERCHANT: '#8b5cf6', SUPER_ADMIN: '#f59e0b' };

  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>User Management</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>All registered users — {data?.total || 0} total</p>

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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users?.map((u: any) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span style={{
                          fontSize: '0.7rem', padding: '3px 8px', borderRadius: 999, fontWeight: 700,
                          background: `${roleColors[u.role]}22`, color: roleColors[u.role],
                        }}>{u.role}</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.7rem', padding: '3px 8px', borderRadius: 999, fontWeight: 700,
                          background: u.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          color: u.isActive ? '#10b981' : '#ef4444',
                        }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} onClick={() => { setPage(p => p - 1); load(page - 1); }} disabled={page === 1}>← Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Page {page}</span>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} onClick={() => { setPage(p => p + 1); load(page + 1); }} disabled={!data?.users || data.users.length < 20}>Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

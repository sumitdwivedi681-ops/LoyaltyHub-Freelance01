'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { loyaltyApi } from '@/services/api';

const TYPE_COLORS: Record<string, string> = {
  EARN: '#10b981', REDEEM: '#ef4444', REFERRAL_BONUS: '#6366f1',
  ADMIN_ADJUSTMENT: '#f59e0b', EXPIRY: '#94a3b8',
};
const TYPE_ICONS: Record<string, string> = {
  EARN: '⬆️', REDEEM: '⬇️', REFERRAL_BONUS: '🤝', ADMIN_ADJUSTMENT: '⚙️', EXPIRY: '⏰',
};

export default function WalletPage() {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p: number) => {
    setLoading(true);
    loyaltyApi.getTransactions(p, 15)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Transaction History</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>All your points activity</p>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Merchant</th>
                    <th>Purchase</th>
                    <th>Points</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.transactions?.map((tx: any) => (
                    <tr key={tx.id}>
                      <td>
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 999,
                          background: `${TYPE_COLORS[tx.type]}22`, color: TYPE_COLORS[tx.type], fontWeight: 700 }}>
                          {TYPE_ICONS[tx.type]} {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 200 }}>{tx.description || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.merchant?.storeName || '—'}</td>
                      <td>{tx.purchaseAmount ? `₹${tx.purchaseAmount}` : '—'}</td>
                      <td style={{ fontWeight: 700, color: tx.type === 'EARN' || tx.type === 'REFERRAL_BONUS' ? '#10b981' : '#ef4444' }}>
                        {tx.type === 'EARN' || tx.type === 'REFERRAL_BONUS' ? '+' : '-'}
                        {tx.pointsEarned || tx.pointsRedeemed || 0}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Page {page} of {data?.pages || 1}
                </span>
                <button className="btn-secondary" style={{ padding: '6px 14px' }} onClick={() => setPage(p => p + 1)} disabled={page >= (data?.pages || 1)}>Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

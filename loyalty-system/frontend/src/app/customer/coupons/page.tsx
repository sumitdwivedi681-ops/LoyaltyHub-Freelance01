'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { couponsApi } from '@/services/api';
import { QRCodeSVG } from 'qrcode.react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    couponsApi.getMyCoupons()
      .then(r => setCoupons(r.data))
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    ACTIVE: '#10b981', REDEEMED: '#94a3b8', EXPIRED: '#ef4444',
  };

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Coupons</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your redeemed rewards and coupons</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 64 }}>🎫</div>
            <p style={{ marginTop: 16 }}>No coupons yet. Redeem rewards to earn coupons!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {coupons.map((c: any) => (
              <div key={c.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <code style={{
                      background: 'rgba(99,102,241,0.15)', border: '1px solid var(--border-color)',
                      borderRadius: 8, padding: '4px 12px', fontSize: '0.9rem', fontWeight: 800,
                      color: 'var(--color-primary)', letterSpacing: 1,
                    }}>{c.code}</code>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 10px', borderRadius: 999, fontWeight: 700,
                      background: `${statusColors[c.status]}22`, color: statusColors[c.status],
                    }}>{c.status}</span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.reward?.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    🏪 {c.merchant?.storeName}
                    {c.expiryDate && ` · Expires ${new Date(c.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>

                {c.status === 'ACTIVE' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    {showQR === c.code ? (
                      <div style={{ background: 'white', padding: 12, borderRadius: 12 }}>
                        <QRCodeSVG value={c.code} size={120} />
                      </div>
                    ) : (
                      <button
                        id={`show-qr-${c.code}`}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        onClick={() => setShowQR(c.code)}
                      >
                        📷 Show QR
                      </button>
                    )}
                    {showQR === c.code && (
                      <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        onClick={() => setShowQR(null)}>Hide</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

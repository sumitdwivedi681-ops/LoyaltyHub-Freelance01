'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { promotionsApi } from '@/services/api';

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promotionsApi.getPersonalized()
      .then(r => setOffers(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Personalized Offers</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Exclusive deals just for you 🔥</p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
          </div>
        ) : offers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 64 }}>🔥</div>
            <p style={{ marginTop: 16 }}>No offers available right now. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {offers.map((offer: any) => (
              <div key={offer.id} className="glass-card" style={{
                padding: '1.5rem', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                  borderRadius: '50%', background: 'rgba(245,158,11,0.1)',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{offer.title}</h3>
                  <span style={{
                    background: 'rgba(245,158,11,0.2)', color: '#f59e0b',
                    border: '1px solid rgba(245,158,11,0.4)', borderRadius: 999,
                    padding: '4px 12px', fontSize: '0.875rem', fontWeight: 800, flexShrink: 0,
                  }}>{offer.discount}% OFF</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 12 }}>
                  {offer.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>🏪 {offer.merchant?.storeName}</span>
                  {offer.expiryDate && (
                    <span>Expires: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                  )}
                </div>
                {offer.bonusPoints > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <span className="points-chip">+{offer.bonusPoints} bonus pts</span>
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

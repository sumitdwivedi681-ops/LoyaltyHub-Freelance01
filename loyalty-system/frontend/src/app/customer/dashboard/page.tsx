'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { loyaltyApi, promotionsApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [tierInfo, setTierInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loyaltyApi.getWallet(),
      loyaltyApi.getTransactions(1, 5),
      promotionsApi.getPersonalized(),
      loyaltyApi.getTiers(),
    ]).then(([w, t, o, ti]) => {
      setWallet(w.data);
      setTransactions(t.data.transactions || []);
      setOffers(o.data.slice(0, 3));
      setTierInfo(ti.data.tiers || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tier = wallet?.tier || 'BRONZE';
  const tierColors: Record<string, string> = { BRONZE: '#cd7f32', SILVER: '#c0c0c0', GOLD: '#ffd700', PLATINUM: '#e8e8e8' };
  const tierColor = tierColors[tier] || '#6366f1';

  // Progress to next tier
  const currentTierData = tierInfo.find(t => t.name === tier);
  const nextTierData = tierInfo.find(t => t.minPoints > (currentTierData?.minPoints ?? 0));
  const progress = nextTierData
    ? Math.min(100, ((wallet?.lifetimePoints ?? 0) - (currentTierData?.minPoints ?? 0)) / (nextTierData.minPoints - (currentTierData?.minPoints ?? 0)) * 100)
    : 100;

  if (loading) return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Here&apos;s your loyalty overview
          </p>
        </div>

        {/* Wallet Hero Card */}
        <div style={{
          background: `linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))`,
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 20, padding: '2rem', marginBottom: '1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 4 }}>Available Points</p>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }} className="gradient-text">
              {(wallet?.points ?? 0).toLocaleString()}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.875rem' }}>
              Lifetime: {(wallet?.lifetimePoints ?? 0).toLocaleString()} pts
            </p>

            {/* Tier Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <span className={`tier-${tier.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: 999, fontWeight: 700 }}>
                {tier === 'BRONZE' ? '🥉' : tier === 'SILVER' ? '🥈' : tier === 'GOLD' ? '🥇' : '💎'} {tier}
              </span>
              {nextTierData && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {(nextTierData.minPoints - (wallet?.lifetimePoints ?? 0)).toLocaleString()} pts to {nextTierData.name}
                </span>
              )}
            </div>

            {/* Tier Progress */}
            <div style={{ marginTop: 12 }}>
              <div className="progress-bar" style={{ maxWidth: 300 }}>
                <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tierColor}, #6366f1)` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: '2rem' }}>
          <StatCard label="Total Points" value={(wallet?.points ?? 0).toLocaleString()} icon="⭐" color="var(--color-primary)" />
          <StatCard label="Lifetime Earned" value={(wallet?.lifetimePoints ?? 0).toLocaleString()} icon="🏆" color="#ffd700" />
          <StatCard label="Badges Earned" value={wallet?.badges?.length ?? 0} icon="🎖️" color="#10b981" />
          <StatCard label="Active Offers" value={offers.length} icon="🔥" color="#f59e0b" />
        </div>

        {/* Two Column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Recent Transactions */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No transactions yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {transactions.map((tx: any) => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{tx.description || tx.type}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: '0.875rem',
                      color: tx.type === 'EARN' ? '#10b981' : '#ef4444',
                    }}>
                      {tx.type === 'EARN' ? '+' : '-'}{tx.pointsEarned || tx.pointsRedeemed} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Offers */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Active Offers</h2>
            {offers.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No offers right now</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {offers.map((offer: any) => (
                  <div key={offer.id} style={{
                    background: 'rgba(99,102,241,0.08)', borderRadius: 12,
                    padding: '0.875rem', border: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{offer.title}</p>
                      <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.8rem' }}>
                        {offer.discount}% OFF
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {offer.merchant?.storeName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        {wallet?.badges?.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Badges</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {wallet.badges.map((badge: any) => (
                <div key={badge.id} style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid var(--border-color)',
                  borderRadius: 12, padding: '0.75rem 1rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 28 }}>{badge.icon}</div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

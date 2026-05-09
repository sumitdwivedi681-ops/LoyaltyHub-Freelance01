'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { rewardsApi, loyaltyApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([rewardsApi.getAll(), loyaltyApi.getWallet()])
      .then(([r, w]) => { setRewards(r.data); setWallet(w.data); })
      .finally(() => setLoading(false));
  }, []);

  const redeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      await loyaltyApi.redeemReward(rewardId);
      toast.success('🎉 Reward redeemed! Check your coupons.');
      const [r, w] = await Promise.all([rewardsApi.getAll(), loyaltyApi.getWallet()]);
      setRewards(r.data); setWallet(w.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rewards Catalog</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Redeem your points for amazing rewards</p>
          </div>
          {wallet && (
            <div className="points-chip" style={{ fontSize: '1rem', padding: '8px 16px' }}>
              ⭐ {wallet.points?.toLocaleString()} pts available
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}
          </div>
        ) : rewards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎁</div>
            <p>No rewards available right now</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {rewards.map((reward: any) => {
              const canRedeem = wallet && wallet.points >= reward.requiredPoints;
              return (
                <div key={reward.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}>
                    {reward.imageUrl ? '🖼️' : '🎁'}
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{reward.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                    {reward.description}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    🏪 {reward.merchant?.storeName}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="points-chip">⭐ {reward.requiredPoints?.toLocaleString()} pts</span>
                    <button
                      id={`redeem-${reward.id}`}
                      onClick={() => redeem(reward.id)}
                      disabled={!canRedeem || redeeming === reward.id}
                      className={canRedeem ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: canRedeem ? 1 : 0.5 }}
                    >
                      {redeeming === reward.id ? '...' : canRedeem ? 'Redeem' : 'Need more pts'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

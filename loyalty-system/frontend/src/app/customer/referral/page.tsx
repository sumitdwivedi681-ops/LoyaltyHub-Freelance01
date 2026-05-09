'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getReferral()
      .then(r => setReferral(r.data))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referral?.referralLink || '');
    toast.success('Referral link copied! 🔗');
  };

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Referral Program</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Invite friends and earn bonus points!</p>

        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : (
          <>
            {/* Hero Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '2rem',
              textAlign: 'center', marginBottom: '2rem',
            }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🤝</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Earn 100 Points Per Referral!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Share your unique link. When a friend joins, you both get rewarded!
              </p>

              <div style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto' }}>
                <input
                  readOnly
                  value={referral?.referralLink || ''}
                  className="input-field"
                  style={{ flex: 1, fontSize: '0.8rem' }}
                />
                <button id="copy-referral" className="btn-primary" onClick={copyLink} style={{ flexShrink: 0 }}>
                  📋 Copy
                </button>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <span style={{
                  background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 999, padding: '6px 16px', fontSize: '0.875rem', fontWeight: 700,
                }}>
                  Your Code: {referral?.referralCode}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: '2rem' }}>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900 }} className="gradient-text">
                  {referral?.totalReferrals ?? 0}
                </div>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Friends Referred</p>
              </div>
              <div className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981' }}>
                  {(referral?.totalReferrals ?? 0) * 100}
                </div>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Points Earned</p>
              </div>
            </div>

            {/* Referral list */}
            {referral?.referrals?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Referred Friends</h2>
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
                  <tbody>
                    {referral.referrals.map((r: any) => (
                      <tr key={r.id}>
                        <td>{r.referee?.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.referee?.email}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(r.referee?.createdAt).toLocaleDateString()}</td>
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

'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { couponsApi, rewardsApi } from '@/services/api';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function MerchantCouponsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [codeToVerify, setCodeToVerify] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [genForm, setGenForm] = useState({ customerId: '', rewardId: '' });
  const [generated, setGenerated] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rewardsApi.getAll().then(r => setRewards(r.data));
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await couponsApi.generate(genForm);
      setGenerated(res.data);
      toast.success('Coupon generated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (!codeToVerify.trim()) return;
    try {
      const res = await couponsApi.verify(codeToVerify.trim());
      setVerifyResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid');
      setVerifyResult(null);
    }
  };

  const redeem = async (code: string) => {
    try {
      await couponsApi.redeem(code);
      toast.success('Coupon redeemed!');
      setVerifyResult(null);
      setCodeToVerify('');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Coupon Management</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Generate and verify customer coupons</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Generate Coupon */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>🎫 Generate Coupon</h2>
            <form onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                className="input-field" placeholder="Customer ID (User UUID)"
                value={genForm.customerId} onChange={e => setGenForm(f => ({ ...f, customerId: e.target.value }))} required
              />
              <select
                className="input-field"
                value={genForm.rewardId}
                onChange={e => setGenForm(f => ({ ...f, rewardId: e.target.value }))}
                required
              >
                <option value="">Select Reward</option>
                {rewards.map(r => <option key={r.id} value={r.id}>{r.name} ({r.requiredPoints} pts)</option>)}
              </select>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Generating...' : '🎫 Generate'}
              </button>
            </form>

            {generated && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ background: 'white', display: 'inline-block', padding: 12, borderRadius: 12, marginBottom: 12 }}>
                  <QRCodeSVG value={generated.code} size={150} />
                </div>
                <p style={{ fontWeight: 700 }}>Code: <code style={{ color: 'var(--color-primary)' }}>{generated.code}</code></p>
              </div>
            )}
          </div>

          {/* Verify & Redeem */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>✅ Verify & Redeem</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
              <input
                className="input-field" placeholder="Enter coupon code..."
                value={codeToVerify} onChange={e => setCodeToVerify(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
              />
              <button className="btn-primary" onClick={verify} style={{ flexShrink: 0, padding: '8px 16px' }}>
                Verify
              </button>
            </div>

            {verifyResult && (
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12 }}>
                <p style={{ color: '#10b981', fontWeight: 700, marginBottom: 8 }}>✅ Valid Coupon</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Customer:</span>
                    <span>{verifyResult.coupon?.customer?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Reward:</span>
                    <span>{verifyResult.coupon?.reward?.name}</span>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                  onClick={() => redeem(verifyResult.coupon?.code)}>
                  ✅ Mark as Redeemed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

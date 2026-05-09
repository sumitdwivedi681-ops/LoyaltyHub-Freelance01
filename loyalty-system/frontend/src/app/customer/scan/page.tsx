'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { couponsApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await couponsApi.verify(code.trim());
      setResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid coupon code');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>QR Scanner</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Scan or enter a coupon code to verify</p>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 80, marginBottom: '1rem' }}>📷</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Camera QR scanning requires the html5-qrcode library integration.
            For now, enter the coupon code manually below.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="scan-input"
              className="input-field"
              placeholder="Enter coupon code (e.g. LH-1234-ABCDE)"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verify()}
            />
            <button id="scan-verify" className="btn-primary" onClick={verify} disabled={loading || !code.trim()}>
              {loading ? '...' : 'Verify'}
            </button>
          </div>
        </div>

        {result && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              padding: '1rem', background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12,
            }}>
              <span style={{ fontSize: 32 }}>✅</span>
              <div>
                <p style={{ fontWeight: 700, color: '#10b981' }}>Valid Coupon!</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ready to use</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Reward</span>
                <span style={{ fontWeight: 700 }}>{result.coupon?.reward?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Customer</span>
                <span style={{ fontWeight: 600 }}>{result.coupon?.customer?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Code</span>
                <code style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{result.coupon?.code}</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

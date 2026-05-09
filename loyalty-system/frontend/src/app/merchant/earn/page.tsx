'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { loyaltyApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function EarnPointsPage() {
  const [form, setForm] = useState({ customerId: '', purchaseAmount: '', description: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loyaltyApi.earnPoints({
        customerId: form.customerId,
        purchaseAmount: Number(form.purchaseAmount),
        description: form.description,
      });
      setResult(res.data);
      toast.success(`✅ ${res.data.pointsEarned} points awarded!`);
      setForm({ customerId: '', purchaseAmount: '', description: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to award points');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Award Points</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Add loyalty points for a customer purchase</p>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Customer ID</label>
              <input id="earn-customerId" name="customerId" className="input-field" placeholder="Paste customer UUID" value={form.customerId} onChange={handle} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Purchase Amount (₹)</label>
              <input id="earn-amount" name="purchaseAmount" type="number" className="input-field" placeholder="e.g. 500" value={form.purchaseAmount} onChange={handle} required min={1} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description (optional)</label>
              <input name="description" className="input-field" placeholder="e.g. Dine-in purchase" value={form.description} onChange={handle} />
            </div>
            <button id="earn-submit" type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.875rem' }} disabled={loading}>
              {loading ? 'Processing...' : '⭐ Award Points'}
            </button>
          </form>
        </div>

        {result && (
          <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>+{result.pointsEarned}</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Points Awarded</p>
            <div style={{ marginTop: 12, padding: '0.75rem', background: 'rgba(99,102,241,0.1)', borderRadius: 12 }}>
              <p style={{ fontSize: '0.875rem' }}>Customer Balance: <strong>{result.newBalance?.toLocaleString()} pts</strong></p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

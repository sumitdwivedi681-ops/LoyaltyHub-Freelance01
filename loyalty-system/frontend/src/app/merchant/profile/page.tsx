'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { merchantsApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function MerchantProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    merchantsApi.getProfile().then(r => {
      setProfile(r.data);
      setForm({
        storeName: r.data.storeName || '',
        description: r.data.description || '',
        address: r.data.address || '',
        city: r.data.city || '',
        website: r.data.website || '',
        pointsPerRupee: r.data.pointsPerRupee || 1,
      });
    }).finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await merchantsApi.updateProfile(form);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Store Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your store information and settings</p>

        {loading ? <div className="skeleton" style={{ height: 400 }} /> : (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Store Name</label>
                <input name="storeName" className="input-field" value={form.storeName} onChange={handle} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea name="description" className="input-field" value={form.description} onChange={handle as any} rows={3} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Address</label>
                  <input name="address" className="input-field" value={form.address} onChange={handle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>City</label>
                  <input name="city" className="input-field" value={form.city} onChange={handle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Website</label>
                <input name="website" className="input-field" placeholder="https://yourstore.com" value={form.website} onChange={handle} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Points Per ₹ Spent
                  <span style={{ marginLeft: 8, color: 'var(--color-primary)', fontWeight: 700 }}>{form.pointsPerRupee} pts/₹</span>
                </label>
                <input name="pointsPerRupee" type="number" step="0.1" min="0.1" className="input-field" value={form.pointsPerRupee} onChange={handle} />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>

            {/* Stats */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>STORE STATS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Transactions', val: profile?._count?.transactions },
                  { label: 'Rewards', val: profile?._count?.rewards },
                  { label: 'Promotions', val: profile?._count?.promotions },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(99,102,241,0.08)', borderRadius: 12 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.val || 0}</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { rewardsApi } from '@/services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', requiredPoints: '', stock: '', expiryDate: '' };

export default function MerchantRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => rewardsApi.getAll().then(r => setRewards(r.data));

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        requiredPoints: Number(form.requiredPoints),
        stock: form.stock ? Number(form.stock) : undefined,
        expiryDate: form.expiryDate || undefined,
      };
      if (editId) {
        await rewardsApi.update(editId, payload);
        toast.success('Reward updated!');
      } else {
        await rewardsApi.create(payload);
        toast.success('Reward created!');
      }
      setShowForm(false); setEditId(null); setForm({ ...EMPTY_FORM });
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteReward = async (id: string) => {
    if (!confirm('Delete this reward?')) return;
    try {
      await rewardsApi.delete(id);
      toast.success('Deleted');
      await load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Rewards Management</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{rewards.length} rewards in catalog</p>
          </div>
          <button id="add-reward-btn" className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }); }}>
            + New Reward
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>{editId ? 'Edit Reward' : 'Create Reward'}</h2>
            <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input name="name" className="input-field" placeholder="Reward Name" value={form.name} onChange={handle} required style={{ gridColumn: '1/-1' }} />
              <textarea name="description" className="input-field" placeholder="Description" value={form.description} onChange={handle as any} rows={2} style={{ gridColumn: '1/-1', resize: 'none' }} />
              <input name="requiredPoints" type="number" className="input-field" placeholder="Required Points" value={form.requiredPoints} onChange={handle} required min={1} />
              <input name="stock" type="number" className="input-field" placeholder="Stock (optional)" value={form.stock} onChange={handle} min={0} />
              <input name="expiryDate" type="date" className="input-field" value={form.expiryDate} onChange={handle} />
              <div style={{ display: 'flex', gap: 8, gridColumn: '1/-1' }}>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Reward'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Rewards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {rewards.map((r: any) => (
              <div key={r.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontWeight: 700 }}>{r.name}</h3>
                  <span className={r.isActive ? 'points-chip' : ''} style={{ fontSize: '0.7rem', color: r.isActive ? undefined : '#ef4444' }}>
                    {r.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{r.description}</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className="points-chip">⭐ {r.requiredPoints?.toLocaleString()} pts</span>
                  {r.stock !== null && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock: {r.stock}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                    onClick={() => { setEditId(r.id); setShowForm(true); setForm({ name: r.name, description: r.description || '', requiredPoints: r.requiredPoints, stock: r.stock || '', expiryDate: r.expiryDate ? r.expiryDate.split('T')[0] : '' }); }}>
                    ✏️ Edit
                  </button>
                  <button className="btn-danger" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                    onClick={() => deleteReward(r.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { promotionsApi } from '@/services/api';
import toast from 'react-hot-toast';

const EMPTY = { title: '', description: '', discount: '', bonusPoints: '', minPurchase: '', expiryDate: '' };

export default function MerchantPromotionsPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => promotionsApi.getMerchant().then(r => setPromos(r.data));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discount: Number(form.discount),
        bonusPoints: form.bonusPoints ? Number(form.bonusPoints) : 0,
        minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
        expiryDate: form.expiryDate || undefined,
      };
      if (editId) { await promotionsApi.update(editId, payload); toast.success('Updated!'); }
      else { await promotionsApi.create(payload); toast.success('Created!'); }
      setShowForm(false); setEditId(null); setForm({ ...EMPTY });
      await load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout allowedRoles={['MERCHANT']}>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Promotions & Campaigns</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{promos.length} active campaigns</p>
          </div>
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY }); }}>
            + New Promotion
          </button>
        </div>

        {showForm && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>{editId ? 'Edit Promotion' : 'Create Promotion'}</h2>
            <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input name="title" className="input-field" placeholder="Promotion Title" value={form.title} onChange={handle} required style={{ gridColumn: '1/-1' }} />
              <textarea name="description" className="input-field" placeholder="Description" value={form.description} onChange={handle as any} rows={2} style={{ gridColumn: '1/-1', resize: 'none' }} />
              <input name="discount" type="number" className="input-field" placeholder="Discount %" value={form.discount} onChange={handle} min={0} max={100} required />
              <input name="bonusPoints" type="number" className="input-field" placeholder="Bonus Points" value={form.bonusPoints} onChange={handle} min={0} />
              <input name="minPurchase" type="number" className="input-field" placeholder="Min Purchase (₹)" value={form.minPurchase} onChange={handle} min={0} />
              <input name="expiryDate" type="date" className="input-field" value={form.expiryDate} onChange={handle} />
              <div style={{ display: 'flex', gap: 8, gridColumn: '1/-1' }}>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {promos.map((p: any) => (
              <div key={p.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ fontWeight: 700 }}>{p.title}</h3>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>{p.discount}% OFF</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{p.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {p.bonusPoints > 0 && <span className="points-chip">+{p.bonusPoints} pts</span>}
                  {p.minPurchase > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min: ₹{p.minPurchase}</span>}
                  {p.expiryDate && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exp: {new Date(p.expiryDate).toLocaleDateString()}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                    onClick={() => { setEditId(p.id); setShowForm(true); setForm({ title: p.title, description: p.description || '', discount: p.discount, bonusPoints: p.bonusPoints || '', minPurchase: p.minPurchase || '', expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '' }); }}>
                    ✏️ Edit
                  </button>
                  <button className="btn-danger" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                    onClick={async () => { if (!confirm('Delete?')) return; await promotionsApi.delete(p.id); load(); }}>
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

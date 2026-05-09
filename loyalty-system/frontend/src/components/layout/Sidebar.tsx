'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const customerLinks = [
  { href: '/customer/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/customer/wallet', icon: '💰', label: 'My Wallet' },
  { href: '/customer/rewards', icon: '🎁', label: 'Rewards' },
  { href: '/customer/offers', icon: '🔥', label: 'Offers' },
  { href: '/customer/coupons', icon: '🎫', label: 'My Coupons' },
  { href: '/customer/referral', icon: '🤝', label: 'Referral' },
  { href: '/customer/scan', icon: '📷', label: 'QR Scanner' },
];

const merchantLinks = [
  { href: '/merchant/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/merchant/customers', icon: '👥', label: 'Customers' },
  { href: '/merchant/rewards', icon: '🎁', label: 'Rewards' },
  { href: '/merchant/promotions', icon: '📢', label: 'Promotions' },
  { href: '/merchant/coupons', icon: '🎫', label: 'Coupons' },
  { href: '/merchant/earn', icon: '⭐', label: 'Award Points' },
  { href: '/merchant/analytics', icon: '📈', label: 'Analytics' },
  { href: '/merchant/profile', icon: '🏪', label: 'Store Profile' },
];

const adminLinks = [
  { href: '/admin/dashboard', icon: '🌐', label: 'Platform Stats' },
  { href: '/admin/merchants', icon: '🏪', label: 'Merchants' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'MERCHANT' ? merchantLinks
    : user?.role === 'SUPER_ADMIN' ? adminLinks
    : customerLinks;

  const roleLabel = user?.role === 'MERCHANT' ? '🏪 Merchant'
    : user?.role === 'SUPER_ADMIN' ? '👑 Super Admin'
    : '👤 Customer';

  const tierClass = user?.loyaltyPoints?.tier?.toLowerCase() || 'bronze';

  return (
    <>
      {/* Mobile hamburger */}
      <button
        id="sidebar-toggle"
        onClick={() => setMobileOpen(o => !o)}
        style={{
          display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 50,
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: 'white',
          fontSize: 20,
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 39,
          display: 'none',
        }} className="mobile-overlay" />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>💎</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }} className="gradient-text">LoyaltyHub</span>
        </div>

        {/* User Info */}
        <div style={{
          background: 'rgba(99,102,241,0.1)', border: '1px solid var(--border-color)',
          borderRadius: 12, padding: '0.75rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{roleLabel}</p>
            </div>
          </div>
          {user?.role === 'CUSTOMER' && user?.loyaltyPoints && (
            <div style={{ marginTop: 8 }}>
              <span className={`tier-${tierClass}`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                {user.loyaltyPoints.tier} • {user.loyaltyPoints.points.toLocaleString()} pts
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
            >
              <span style={{ fontSize: 18 }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          id="sidebar-logout"
          onClick={logout}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
        >
          🚪 Sign Out
        </button>
      </aside>
    </>
  );
}

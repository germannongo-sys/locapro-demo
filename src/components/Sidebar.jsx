import React from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { isAdmin } from '../utils/helpers.js';

export default function Sidebar({ current, onChange, mobileOpen, onCloseMobile }) {
  const { cfg, data, alerts } = useStore();
  const tenant = data.tenant;
  const supportsDuo = tenant?.sectors?.length > 1;

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'assets', label: cfg.asset.plural, icon: cfg.asset.icon },
    { id: 'reservations', label: 'Réservations', icon: '📅', badge: alerts.filter(a => a.id.startsWith('res-')).length },
    { id: 'contracts', label: 'Devis & Contrats', icon: '📋' },
    { id: 'invoices', label: 'Factures', icon: '🧾' },
    { id: 'expenses', label: 'Charges', icon: '💰' },
    { id: 'parties', label: 'Tiers', icon: '👥' },
    { id: 'owners', label: 'Propriétaires', icon: '🏠' },
    { id: 'tickets', label: 'Support', icon: '🎧' },
  ];

  const adminItems = [
    { id: 'audit', label: 'Journal d\'audit', icon: '📜' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-60 flex-shrink-0 flex flex-col z-50 transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo / Brand */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            {tenant?.logo ? (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ background: 'white', padding: '4px' }}
              >
                <img src={tenant.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
                style={{ background: 'var(--accent)' }}
              >
                {tenant?.name ? tenant.name.charAt(0).toUpperCase() : 'LP'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-base leading-tight truncate">
                {tenant?.name || 'LocaPro'}
              </div>
              <div
                className="text-[10px] font-mono mt-0.5 flex items-center gap-1"
                style={{ color: 'var(--text3)' }}
              >
                {cfg.icon} {cfg.label.toUpperCase()}
                {supportsDuo && <span style={{ color: 'var(--gold)' }}> · DUO</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider"
            style={{ color: 'var(--text3)' }}
          >
            Navigation
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className={`nav-link ${current === item.id ? 'active' : ''}`}
              onClick={() => {
                onChange(item.id);
                onCloseMobile();
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'var(--gold)', color: '#1a1a1a' }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          {isAdmin(data.user) && (
            <>
              <div
                className="px-4 py-2 mt-3 text-[10px] font-mono uppercase tracking-wider"
                style={{ color: 'var(--text3)' }}
              >
                Administration
              </div>
              {adminItems.map((item) => (
                <div
                  key={item.id}
                  className={`nav-link ${current === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onChange(item.id);
                    onCloseMobile();
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div
            className="flex items-center gap-2.5 p-2 rounded-lg"
            style={{ background: 'var(--surface)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: 'var(--accent)' }}
            >
              {data.user?.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{data.user?.name}</div>
              <div
                className="text-[10px] truncate"
                style={{ color: 'var(--text3)' }}
              >
                {data.user?.role === 'super_admin' ? 'Super Admin' : data.user?.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

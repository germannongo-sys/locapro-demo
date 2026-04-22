import React from 'react';
import { useStore } from '../store/StoreContext.jsx';

export default function Sidebar({ current, onChange, mobileOpen, onCloseMobile }) {
  const { cfg, data } = useStore();

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'assets', label: cfg.asset.plural, icon: cfg.asset.icon },
    { id: 'contracts', label: 'Devis & Contrats', icon: '📋' },
    { id: 'invoices', label: 'Factures', icon: '🧾' },
    { id: 'expenses', label: 'Charges', icon: '💰' },
    { id: 'parties', label: 'Tiers', icon: '👥' },
    { id: 'owners', label: 'Propriétaires', icon: '🏠' },
    { id: 'tickets', label: 'Support', icon: '🎧' },
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
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
              style={{ background: 'var(--accent)' }}
            >
              LP
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none">
                Loca<span style={{ color: 'var(--accent)' }}>Pro</span>
              </div>
              <div
                className="text-[10px] font-mono mt-0.5"
                style={{ color: 'var(--text3)' }}
              >
                {cfg.label.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

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
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

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
                {data.user?.email}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

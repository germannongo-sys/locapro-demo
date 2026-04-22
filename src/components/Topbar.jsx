import React from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { sectorConfig } from '../data/sectorConfig.js';

export default function Topbar({ title, onLogout, onMenuClick }) {
  const { data, updateData, showToast, reset } = useStore();

  const toggleSector = () => {
    const newSector = data.sector === 'real_estate' ? 'fleet' : 'real_estate';
    updateData((d) => ({ ...d, sector: newSector }));
    showToast(`Mode ${sectorConfig[newSector].label} activé`);
  };

  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <button className="lg:hidden btn btn-ghost btn-sm" onClick={onMenuClick}>
          ☰
        </button>
        <h1 className="font-display font-bold text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-sm" onClick={toggleSector} title="Changer de secteur">
          {data.sector === 'real_estate' ? '🏢 Immobilier' : '🚗 Parc Auto'}
          <span style={{ color: 'var(--text3)', fontSize: '10px' }}>↻</span>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={reset} title="Réinitialiser les données">
          ↻ Reset
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

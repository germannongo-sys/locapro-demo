import React, { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { sectorConfig } from '../data/sectorConfig.js';
import GlobalSearch from './GlobalSearch.jsx';
import AlertsPanel from './AlertsPanel.jsx';

export default function Topbar({ title, onMenuClick, onNavigate }) {
  const { data, updateData, showToast, logout, trialStatus, alerts } = useStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const tenant = data.tenant;
  const supportsDuo = tenant?.sectors?.length > 1;

  const toggleSector = () => {
    if (!supportsDuo) {
      showToast('Votre formule ne couvre qu\'un seul secteur. Mettez à niveau pour le mode Duo.', 'error');
      return;
    }
    const newSector = data.sector === 'real_estate' ? 'fleet' : 'real_estate';
    updateData((d) => ({ ...d, sector: newSector }));
    showToast(`Mode ${sectorConfig[newSector].label} activé`);
  };

  return (
    <>
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button className="lg:hidden btn btn-ghost btn-sm" onClick={onMenuClick}>
            ☰
          </button>
          <h1 className="font-display font-bold text-xl truncate">{title}</h1>
          {trialStatus && !trialStatus.expired && (
            <span
              className="tag hidden md:inline-flex"
              style={{
                background: trialStatus.ending ? 'rgba(240,180,41,0.15)' : 'rgba(34,201,122,0.15)',
                color: trialStatus.ending ? 'var(--gold)' : 'var(--green)',
              }}
            >
              🎁 {trialStatus.daysLeft} j d'essai
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowSearch(true)}
            title="Recherche globale (Ctrl+K)"
          >
            🔍 <span className="hidden md:inline">Rechercher</span>
          </button>
          <button
            className="btn btn-ghost btn-sm relative"
            onClick={() => setShowAlerts(!showAlerts)}
            title="Alertes"
          >
            🔔
            {alerts.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'var(--red)', color: 'white' }}
              >
                {alerts.length}
              </span>
            )}
          </button>
          {supportsDuo && (
            <button
              className="btn btn-ghost btn-sm hidden md:inline-flex"
              onClick={toggleSector}
              title="Changer de secteur"
            >
              {data.sector === 'real_estate' ? '🏢 Immo' : '🚗 Auto'}
              <span style={{ color: 'var(--text3)', fontSize: '10px' }}>↻</span>
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            ⏻ <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      {showAlerts && (
        <AlertsPanel
          onClose={() => setShowAlerts(false)}
          onNavigate={(page) => {
            setShowAlerts(false);
            onNavigate?.(page);
          }}
        />
      )}
      {showSearch && (
        <GlobalSearch
          onClose={() => setShowSearch(false)}
          onNavigate={(page) => {
            setShowSearch(false);
            onNavigate?.(page);
          }}
        />
      )}
    </>
  );
}

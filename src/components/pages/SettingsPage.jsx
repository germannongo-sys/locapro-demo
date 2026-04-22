import React from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { sectorConfig } from '../../data/sectorConfig.js';

export default function SettingsPage() {
  const { data, updateData, showToast, reset } = useStore();

  return (
    <div className="p-6 max-w-3xl">
      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-4">🎛️ Mode sectoriel</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
          Sélectionnez le secteur d'activité de votre organisation. Cette configuration adapte
          automatiquement les libellés, formulaires et vues de la plateforme.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {['real_estate', 'fleet'].map((sec) => (
            <div
              key={sec}
              onClick={() => {
                updateData((d) => ({ ...d, sector: sec }));
                showToast(`Mode ${sectorConfig[sec].label} activé`);
              }}
              className="card cursor-pointer transition"
              style={{
                borderColor: data.sector === sec ? 'var(--accent)' : 'var(--border)',
                background: data.sector === sec ? 'rgba(79,124,255,0.08)' : 'var(--surface)',
              }}
            >
              <div className="text-3xl mb-2">{sectorConfig[sec].icon}</div>
              <div className="font-display font-semibold">{sectorConfig[sec].label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                Gestion {sec === 'real_estate' ? 'de biens locatifs' : 'de flotte automobile'}
              </div>
              {data.sector === sec && (
                <div className="mt-2 text-xs font-mono" style={{ color: 'var(--accent)' }}>
                  ● ACTIF
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-4">👤 Utilisateur connecté</h3>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
            style={{ background: 'var(--accent)' }}
          >
            {data.user?.initials}
          </div>
          <div>
            <div className="font-semibold">{data.user?.name}</div>
            <div className="text-xs" style={{ color: 'var(--text2)' }}>
              {data.user?.email}
            </div>
            <span className="tag tag-purple mt-1 inline-block">Super Administrateur</span>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-4">📊 Statistiques système</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--accent)' }}>
              {data.assets.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              Actifs
            </div>
          </div>
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--gold)' }}>
              {data.contracts.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              Contrats
            </div>
          </div>
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--green)' }}>
              {data.parties.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              Tiers
            </div>
          </div>
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--purple)' }}>
              {data.tickets.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              Tickets
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: 'rgba(255,91,91,0.3)' }}>
        <h3
          className="font-display font-semibold text-base mb-2"
          style={{ color: 'var(--red)' }}
        >
          ⚠️ Zone dangereuse
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
          Réinitialise toutes les données de la démonstration et restaure le jeu de données initial.
        </p>
        <button className="btn btn-danger" onClick={reset}>
          ↻ Réinitialiser la démo
        </button>
      </div>
    </div>
  );
}

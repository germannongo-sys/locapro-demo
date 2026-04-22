import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/StoreContext.jsx';

export default function GlobalSearch({ onClose, onNavigate }) {
  const { data } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const out = [];
    data.assets.forEach((a) => {
      if (`${a.name} ${a.refCode}`.toLowerCase().includes(q)) {
        out.push({
          type: 'Actif',
          icon: '🏢',
          title: a.name,
          subtitle: a.refCode,
          page: 'assets',
        });
      }
    });
    data.parties.forEach((p) => {
      if (`${p.fullName} ${p.email}`.toLowerCase().includes(q)) {
        out.push({
          type: 'Tiers',
          icon: '👤',
          title: p.fullName,
          subtitle: p.email,
          page: 'parties',
        });
      }
    });
    (data.reservations || []).forEach((r) => {
      if (r.number.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q)) {
        out.push({
          type: 'Réservation',
          icon: '📅',
          title: r.number,
          subtitle: r.notes || `${r.startDate} → ${r.endDate}`,
          page: 'reservations',
        });
      }
    });
    data.invoices.forEach((i) => {
      if (i.number.toLowerCase().includes(q)) {
        out.push({
          type: 'Facture',
          icon: '🧾',
          title: i.number,
          subtitle: `${i.amountTtc} FCFA`,
          page: 'invoices',
        });
      }
    });
    data.contracts.forEach((c) => {
      if (c.number.toLowerCase().includes(q)) {
        out.push({
          type: 'Contrat',
          icon: '📋',
          title: c.number,
          subtitle: c.startDate,
          page: 'contracts',
        });
      }
    });
    return out.slice(0, 10);
  }, [query, data]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ alignSelf: 'flex-start', marginTop: '10vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <input
            autoFocus
            className="input"
            placeholder="🔍 Rechercher partout (actifs, tiers, factures, réservations...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none' }}
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {!query.trim() ? (
            <div className="empty text-sm">Tapez pour rechercher</div>
          ) : results.length === 0 ? (
            <div className="empty text-sm">Aucun résultat pour "{query}"</div>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer transition border-b"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => onNavigate(r.page)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'var(--bg3)' }}
                >
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text3)' }}>
                    {r.subtitle}
                  </div>
                </div>
                <div className="tag tag-grey">{r.type}</div>
              </div>
            ))
          )}
        </div>
        <div
          className="px-4 py-2 text-[11px] font-mono"
          style={{ color: 'var(--text3)', borderTop: '1px solid var(--border)' }}
        >
          ESC pour fermer
        </div>
      </div>
    </div>
  );
}

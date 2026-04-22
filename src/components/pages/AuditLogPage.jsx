import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmtDateTime, isAdmin } from '../../utils/helpers.js';

const actionLabels = {
  'asset.create': { tag: 'tag-green', label: 'Création actif' },
  'asset.update': { tag: 'tag-blue', label: 'Modification actif' },
  'asset.delete': { tag: 'tag-red', label: 'Suppression actif' },
  'invoice.create': { tag: 'tag-green', label: 'Création facture' },
  'invoice.update': { tag: 'tag-blue', label: 'Modification facture' },
  'invoice.delete': { tag: 'tag-red', label: 'Suppression facture' },
  'reservation.create': { tag: 'tag-green', label: 'Création réservation' },
  'reservation.update': { tag: 'tag-blue', label: 'Modification réservation' },
  'reservation.delete': { tag: 'tag-red', label: 'Suppression réservation' },
  'party.create': { tag: 'tag-green', label: 'Création tiers' },
  'party.update': { tag: 'tag-blue', label: 'Modification tiers' },
  'party.delete': { tag: 'tag-red', label: 'Suppression tiers' },
  'party.validate': { tag: 'tag-purple', label: 'Validation tiers' },
  'expense.create': { tag: 'tag-green', label: 'Création charge' },
  'expense.update': { tag: 'tag-blue', label: 'Modification charge' },
  'expense.delete': { tag: 'tag-red', label: 'Suppression charge' },
  'category.create': { tag: 'tag-green', label: 'Création catégorie' },
  'category.update': { tag: 'tag-blue', label: 'Modification catégorie' },
  'category.delete': { tag: 'tag-red', label: 'Suppression catégorie' },
  'tenant.update': { tag: 'tag-purple', label: 'Modification organisation' },
  'subscription.activate': { tag: 'tag-purple', label: 'Activation abonnement' },
};

export default function AuditLogPage() {
  const { data } = useStore();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  if (!isAdmin(data.user)) {
    return (
      <div className="p-6">
        <div className="card empty">
          <div className="text-3xl mb-2">🛡️</div>
          <div className="text-base">Accès réservé aux administrateurs</div>
        </div>
      </div>
    );
  }

  const logs = data.auditLog || [];
  const uniqueUsers = useMemo(() => [...new Set(logs.map((l) => l.user))], [logs]);
  const uniqueActions = useMemo(() => [...new Set(logs.map((l) => l.action))], [logs]);

  const filtered = logs.filter((l) => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    if (userFilter !== 'all' && l.user !== userFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !`${l.user} ${l.target} ${l.details} ${l.action}`
          .toLowerCase()
          .includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-5">
        <p className="text-sm" style={{ color: 'var(--text2)' }}>
          Traçabilité complète des actions sensibles effectuées sur la plateforme.
          {' '}
          <span style={{ color: 'var(--text3)' }}>
            ({logs.length} entrée{logs.length > 1 ? 's' : ''})
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="input"
          style={{ maxWidth: '300px' }}
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: '220px' }}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="all">Toutes actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {actionLabels[a]?.label || a}
            </option>
          ))}
        </select>
        <select
          className="input"
          style={{ maxWidth: '180px' }}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="all">Tous utilisateurs</option>
          {uniqueUsers.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="text-3xl mb-2">📜</div>
            Aucune action enregistrée
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & heure</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Cible</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const meta = actionLabels[log.action] || {
                  tag: 'tag-grey',
                  label: log.action,
                };
                return (
                  <tr key={log.id}>
                    <td className="text-xs font-mono" style={{ color: 'var(--text2)' }}>
                      {fmtDateTime(log.timestamp)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                          style={{
                            background: 'rgba(79,124,255,0.15)',
                            color: 'var(--accent2)',
                          }}
                        >
                          {log.user
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <span className="text-sm">{log.user}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${meta.tag}`}>{meta.label}</span>
                    </td>
                    <td className="font-mono text-xs">{log.target || '—'}</td>
                    <td className="text-sm" style={{ color: 'var(--text2)' }}>
                      {log.details || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-[11px] mt-3 font-mono" style={{ color: 'var(--text3)' }}>
        ℹ️ Les 200 dernières actions sont conservées
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { uid } from '../../utils/helpers.js';

export default function PartiesPage({ filterType }) {
  const { data, updateData, cfg, showToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(filterType || 'all');

  useEffect(() => {
    setTypeFilter(filterType || 'all');
  }, [filterType]);

  const filtered = data.parties.filter((p) => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = (party) => {
    if (editing) {
      updateData((d) => ({
        ...d,
        parties: d.parties.map((p) => (p.id === editing.id ? { ...p, ...party } : p)),
      }));
      showToast('Tiers modifié');
    } else {
      updateData((d) => ({ ...d, parties: [...d.parties, { id: uid(), ...party }] }));
      showToast('Tiers créé');
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer ce tiers ?')) return;
    updateData((d) => ({ ...d, parties: d.parties.filter((p) => p.id !== id) }));
    showToast('Tiers supprimé');
  };

  const partyTypeLabel = {
    tenant: cfg.client.singular,
    owner: 'Propriétaire',
    partner: 'Partenaire',
  };
  const partyTypeTag = { tenant: 'tag-blue', owner: 'tag-gold', partner: 'tag-purple' };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="text-xs" style={{ color: 'var(--text3)' }}>
          {filtered.length} tiers
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Nouveau tiers
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="input"
          style={{ maxWidth: '300px' }}
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!filterType && (
          <select
            className="input"
            style={{ maxWidth: '200px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous types</option>
            <option value="tenant">{cfg.client.plural}</option>
            <option value="owner">Propriétaires</option>
            <option value="partner">Partenaires</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const contracts = data.contracts.filter((c) => c.partyId === p.id).length;
          return (
            <div key={p.id} className="card">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                  style={{ background: 'rgba(79,124,255,0.15)', color: 'var(--accent2)' }}
                >
                  {p.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold truncate">{p.fullName}</div>
                  <div className="flex gap-1 mt-1">
                    <span className={`tag ${partyTypeTag[p.type]}`}>{partyTypeLabel[p.type]}</span>
                    <span className="tag tag-grey">
                      {p.entityType === 'company' ? 'Société' : 'Particulier'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs space-y-1.5" style={{ color: 'var(--text2)' }}>
                <div>📧 {p.email || '—'}</div>
                <div>📞 {p.phone || '—'}</div>
                <div className="line-clamp-1">📍 {p.address || '—'}</div>
                <div>📋 {contracts} contrat(s)</div>
              </div>
              {p.notes && (
                <div
                  className="text-xs mt-3 pt-3 border-t italic"
                  style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}
                >
                  {p.notes}
                </div>
              )}
              <div
                className="flex gap-1 mt-3 pt-3 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  className="btn btn-ghost btn-sm flex-1 justify-center"
                  onClick={() => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                >
                  ✎ Modifier
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(p.id)}
                  style={{ color: 'var(--red)' }}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="card empty mt-4">Aucun tiers trouvé.</div>}

      {showForm && (
        <PartyForm
          party={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          defaultType={filterType}
        />
      )}
    </div>
  );
}

function PartyForm({ party, onSave, onClose, defaultType }) {
  const [form, setForm] = useState(
    party || {
      type: defaultType || 'tenant',
      entityType: 'individual',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    }
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg">
            {party ? 'Modifier' : 'Nouveau'} tiers
          </h3>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="form-grid form-grid-2">
            <div>
              <label className="form-label">Type *</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="tenant">Locataire / Client</option>
                <option value="owner">Propriétaire</option>
                <option value="partner">Partenaire</option>
              </select>
            </div>
            <div>
              <label className="form-label">Entité *</label>
              <select
                className="input"
                value={form.entityType}
                onChange={(e) => setForm({ ...form, entityType: e.target.value })}
              >
                <option value="individual">Particulier</option>
                <option value="company">Société</option>
              </select>
            </div>
          </div>
          <div className="form-row mt-3">
            <label className="form-label">
              {form.entityType === 'company' ? 'Raison sociale' : 'Nom complet'} *
            </label>
            <input
              className="input"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div className="form-grid form-grid-2">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Téléphone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row mt-3">
            <label className="form-label">Adresse</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Notes internes</label>
            <textarea
              className="input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            ></textarea>
          </div>
        </div>
        <div
          className="flex justify-end gap-2 p-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(form)}
            disabled={!form.fullName}
          >
            {party ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

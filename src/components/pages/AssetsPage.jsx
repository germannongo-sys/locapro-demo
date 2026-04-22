import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmt, fmtDate, statusColors, uid } from '../../utils/helpers.js';

export default function AssetsPage() {
  const { data, updateData, cfg, showToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState(null);

  const sectorAssets = data.assets.filter((a) => a.sector === data.sector);
  const filtered = sectorAssets.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search && !`${a.name} ${a.refCode}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = (asset) => {
    if (editing) {
      updateData((d) => ({
        ...d,
        assets: d.assets.map((a) => (a.id === editing.id ? { ...a, ...asset } : a)),
      }));
      showToast(`${cfg.asset.singular} modifié`);
    } else {
      const nextNum = sectorAssets.length + 1;
      const prefix = data.sector === 'real_estate' ? 'IMMO' : 'AUTO';
      updateData((d) => ({
        ...d,
        assets: [
          ...d.assets,
          {
            id: uid(),
            refCode: `${prefix}-${String(nextNum).padStart(3, '0')}`,
            sector: data.sector,
            photos: [],
            ...asset,
          },
        ],
      }));
      showToast(`${cfg.asset.singular} créé`);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm(`Supprimer ce ${cfg.asset.singular.toLowerCase()} ?`)) return;
    updateData((d) => ({ ...d, assets: d.assets.filter((a) => a.id !== id) }));
    showToast(`${cfg.asset.singular} supprimé`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>
            {filtered.length} sur {sectorAssets.length} {cfg.asset.plural.toLowerCase()}
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Nouveau {cfg.asset.singular.toLowerCase()}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="input"
          style={{ maxWidth: '300px' }}
          placeholder="🔍 Rechercher par nom ou référence..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="available">Disponible</option>
          <option value="rented">Loué</option>
          <option value="maintenance">Maintenance</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty">
          <div className="text-4xl mb-2">{cfg.asset.icon}</div>
          <div className="text-base mb-2">Aucun {cfg.asset.singular.toLowerCase()} trouvé</div>
          <button className="btn btn-primary mt-3" onClick={() => setShowForm(true)}>
            Créer le premier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="card cursor-pointer transition hover:border-blue-500"
              style={{ padding: '0', overflow: 'hidden' }}
              onClick={() => setViewing(asset)}
            >
              <div
                className="flex items-center justify-center text-5xl"
                style={{
                  height: '120px',
                  background:
                    'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(167,139,250,0.04))',
                }}
              >
                {cfg.asset.icon}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
                      {asset.refCode}
                    </div>
                    <div className="font-display font-semibold text-sm mt-0.5">{asset.name}</div>
                  </div>
                  <span className={`tag ${statusColors[asset.status].tag}`}>
                    {statusColors[asset.status].label}
                  </span>
                </div>
                <div className="text-xs mb-3" style={{ color: 'var(--text2)' }}>
                  {data.sector === 'real_estate'
                    ? asset.metadata?.address
                    : `${asset.metadata?.brand} ${asset.metadata?.model} · ${asset.metadata?.plate}`}
                </div>
                <div
                  className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="font-display font-bold text-base" style={{ color: 'var(--accent)' }}>
                    {fmt(asset.basePrice)}
                    <span className="text-xs ml-1" style={{ color: 'var(--text3)' }}>
                      {cfg.priceUnit}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(asset);
                        setShowForm(true);
                      }}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      style={{ color: 'var(--red)' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AssetForm
          asset={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      {viewing && <AssetDetailModal asset={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function AssetForm({ asset, onSave, onClose }) {
  const { cfg, data } = useStore();
  const [form, setForm] = useState(
    asset || {
      name: '',
      status: 'available',
      basePrice: 0,
      ownerId: '',
      metadata: {},
    }
  );

  const handleField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleMeta = (key, value) =>
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [key]: value } }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg">
            {asset ? 'Modifier' : 'Nouveau'} {cfg.asset.singular.toLowerCase()}
          </h3>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="form-grid form-grid-2">
            <div>
              <label className="form-label">Nom / Libellé *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => handleField('name', e.target.value)}
                required
                placeholder={
                  data.sector === 'real_estate' ? 'Appartement Voltaire 4B' : 'BMW X3 — Diesel'
                }
              />
            </div>
            <div>
              <label className="form-label">Statut</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => handleField('status', e.target.value)}
              >
                <option value="available">Disponible</option>
                <option value="rented">Loué</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div>
              <label className="form-label">Tarif de base ({cfg.priceUnit}) *</label>
              <input
                type="number"
                className="input"
                value={form.basePrice}
                onChange={(e) => handleField('basePrice', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <label className="form-label">Propriétaire</label>
              <select
                className="input"
                value={form.ownerId || ''}
                onChange={(e) => handleField('ownerId', e.target.value)}
              >
                <option value="">— Aucun —</option>
                {data.parties
                  .filter((p) => p.type === 'owner')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div
            className="mt-4 mb-2 text-xs font-mono uppercase tracking-wider"
            style={{ color: 'var(--text3)' }}
          >
            Caractéristiques
          </div>
          <div className="form-grid form-grid-2">
            {cfg.fields.map((field) => (
              <div key={field.key}>
                <label className="form-label">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="input"
                    value={form.metadata?.[field.key] || ''}
                    onChange={(e) => handleMeta(field.key, e.target.value)}
                  >
                    <option value="">—</option>
                    {field.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="input"
                    placeholder={field.placeholder || ''}
                    value={form.metadata?.[field.key] || ''}
                    onChange={(e) =>
                      handleMeta(
                        field.key,
                        field.type === 'number' ? parseFloat(e.target.value) : e.target.value
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex justify-end gap-2 p-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.name}>
            {asset ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetDetailModal({ asset, onClose }) {
  const { data, cfg } = useStore();
  const owner = data.parties.find((p) => p.id === asset.ownerId);
  const contracts = data.contracts.filter((c) => c.assetId === asset.id);
  const invoices = data.invoices.filter((i) => contracts.some((c) => c.id === i.contractId));
  const expenses = data.expenses.filter((e) => e.assetId === asset.id);
  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + i.amountTtc, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
              {asset.refCode}
            </div>
            <h3 className="font-display font-bold text-lg">{asset.name}</h3>
          </div>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="kpi-card green">
              <div
                className="text-[10px] font-mono uppercase tracking-wider"
                style={{ color: 'var(--text3)' }}
              >
                Revenus
              </div>
              <div
                className="font-display font-bold text-lg mt-1"
                style={{ color: 'var(--green)' }}
              >
                {fmt(totalRevenue)}
              </div>
            </div>
            <div className="kpi-card gold">
              <div
                className="text-[10px] font-mono uppercase tracking-wider"
                style={{ color: 'var(--text3)' }}
              >
                Charges
              </div>
              <div
                className="font-display font-bold text-lg mt-1"
                style={{ color: 'var(--gold)' }}
              >
                {fmt(totalExpense)}
              </div>
            </div>
            <div className="kpi-card">
              <div
                className="text-[10px] font-mono uppercase tracking-wider"
                style={{ color: 'var(--text3)' }}
              >
                Net
              </div>
              <div
                className="font-display font-bold text-lg mt-1"
                style={{
                  color: totalRevenue - totalExpense >= 0 ? 'var(--accent)' : 'var(--red)',
                }}
              >
                {fmt(totalRevenue - totalExpense)}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Caractéristiques
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cfg.fields.map((f) => (
                <div key={f.key} className="text-sm">
                  <span style={{ color: 'var(--text3)' }}>{f.label}: </span>
                  <span className="font-medium">{asset.metadata?.[f.key] || '—'}</span>
                </div>
              ))}
              <div className="text-sm">
                <span style={{ color: 'var(--text3)' }}>Propriétaire: </span>
                <span className="font-medium">{owner?.fullName || '—'}</span>
              </div>
              <div className="text-sm">
                <span style={{ color: 'var(--text3)' }}>Statut: </span>
                <span className={`tag ${statusColors[asset.status].tag}`}>
                  {statusColors[asset.status].label}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Historique des locations ({contracts.length})
            </div>
            {contracts.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--text3)' }}>
                Aucune location
              </div>
            ) : (
              <table
                className="data-table"
                style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}
              >
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Client</th>
                    <th>Période</th>
                    <th className="text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => {
                    const party = data.parties.find((p) => p.id === c.partyId);
                    return (
                      <tr key={c.id}>
                        <td className="font-mono text-xs">{c.number}</td>
                        <td>{party?.fullName}</td>
                        <td className="text-xs" style={{ color: 'var(--text2)' }}>
                          {fmtDate(c.startDate)} → {fmtDate(c.endDate)}
                        </td>
                        <td className="text-right font-medium">{fmt(c.amountHt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Charges enregistrées ({expenses.length})
            </div>
            {expenses.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--text3)' }}>
                Aucune charge
              </div>
            ) : (
              <table
                className="data-table"
                style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}
              >
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Catégorie</th>
                    <th>Description</th>
                    <th className="text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="text-xs">{fmtDate(e.date)}</td>
                      <td>
                        <span className="tag tag-grey">{e.category}</span>
                      </td>
                      <td className="text-xs">{e.description}</td>
                      <td className="text-right font-medium" style={{ color: 'var(--gold)' }}>
                        {fmt(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmt, fmtDate, contractStatuses, uid } from '../../utils/helpers.js';

export default function ContractsPage() {
  const { data, updateData, cfg, showToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const sectorAssetIds = data.assets.filter((a) => a.sector === data.sector).map((a) => a.id);
  const sectorContracts = data.contracts.filter((c) => sectorAssetIds.includes(c.assetId));
  const filtered = sectorContracts.filter((c) => statusFilter === 'all' || c.status === statusFilter);

  const handleSave = (contract) => {
    updateData((d) => ({
      ...d,
      contracts: [
        ...d.contracts,
        {
          ...contract,
          id: uid(),
          number: `DEV-2025-${String(d.contracts.length + 1).padStart(3, '0')}`,
        },
      ],
    }));
    showToast('Devis créé');
    setShowForm(false);
  };

  const convertToInvoice = (contract) => {
    const taxRate = 20;
    const amountTtc = contract.amountHt * 1.2;
    updateData((d) => ({
      ...d,
      contracts: d.contracts.map((c) =>
        c.id === contract.id ? { ...c, status: 'active', type: 'invoice' } : c
      ),
      invoices: [
        ...d.invoices,
        {
          id: uid(),
          contractId: contract.id,
          number: `FAC-2025-${String(d.invoices.length + 1).padStart(3, '0')}`,
          status: 'issued',
          dueDate: contract.endDate,
          amountHt: contract.amountHt,
          taxRate,
          amountTtc,
          amountPaid: 0,
        },
      ],
    }));
    showToast('Facture générée depuis le devis');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer ce contrat ?')) return;
    updateData((d) => ({
      ...d,
      contracts: d.contracts.filter((c) => c.id !== id),
      invoices: d.invoices.filter((i) => i.contractId !== id),
    }));
    showToast('Contrat supprimé');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center gap-3 mb-5 flex-wrap">
        <div className="text-xs" style={{ color: 'var(--text3)' }}>
          {filtered.length} devis & contrats
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nouveau devis
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          className="input"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(contractStatuses).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty">Aucun contrat.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Type</th>
                <th>{cfg.client.singular}</th>
                <th>{cfg.asset.singular}</th>
                <th>Période</th>
                <th className="text-right">Montant HT</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const party = data.parties.find((p) => p.id === c.partyId);
                const asset = data.assets.find((a) => a.id === c.assetId);
                return (
                  <tr key={c.id}>
                    <td className="font-mono text-xs font-medium">{c.number}</td>
                    <td>
                      <span className={`tag ${c.type === 'invoice' ? 'tag-green' : 'tag-blue'}`}>
                        {c.type === 'invoice' ? 'Contrat' : 'Devis'}
                      </span>
                    </td>
                    <td>{party?.fullName}</td>
                    <td>{asset?.name}</td>
                    <td className="text-xs" style={{ color: 'var(--text2)' }}>
                      {fmtDate(c.startDate)} → {fmtDate(c.endDate)}
                    </td>
                    <td className="text-right font-medium">{fmt(c.amountHt)}</td>
                    <td>
                      <span className={`tag ${contractStatuses[c.status].tag}`}>
                        {contractStatuses[c.status].label}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        {c.type === 'quote' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Convertir en facture"
                            onClick={() => convertToInvoice(c)}
                          >
                            → 🧾
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(c.id)}
                          style={{ color: 'var(--red)' }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <ContractForm onSave={handleSave} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ContractForm({ onSave, onClose }) {
  const { data, cfg } = useStore();
  const [form, setForm] = useState({
    type: 'quote',
    status: 'draft',
    assetId: '',
    partyId: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    discount: 0,
  });

  const asset = data.assets.find((a) => a.id === form.assetId);
  const days =
    form.startDate && form.endDate
      ? Math.max(
          0,
          Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24))
        )
      : 0;
  const months = days / 30;
  const baseAmount = asset
    ? data.sector === 'fleet'
      ? asset.basePrice * days
      : asset.basePrice * Math.max(1, months)
    : 0;
  const discount = form.discount || 0;
  const amountHt = Math.round(baseAmount * (1 - discount / 100));

  const handleSubmit = () => {
    if (!form.assetId || !form.partyId || !form.endDate) return;
    onSave({ ...form, amountHt });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg">Nouveau devis</h3>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="form-row">
            <label className="form-label">{cfg.client.singular} *</label>
            <select
              className="input"
              value={form.partyId}
              onChange={(e) => setForm({ ...form, partyId: e.target.value })}
            >
              <option value="">— Sélectionner —</option>
              {data.parties
                .filter((p) => p.type === 'tenant' || p.type === 'partner')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">{cfg.asset.singular} *</label>
            <select
              className="input"
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            >
              <option value="">— Sélectionner —</option>
              {data.assets
                .filter((a) => a.sector === data.sector && a.status !== 'archived')
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.refCode} — {a.name} ({fmt(a.basePrice)} {cfg.priceUnit})
                  </option>
                ))}
            </select>
          </div>
          <div className="form-grid form-grid-2">
            <div>
              <label className="form-label">Date début *</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Date fin *</label>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row mt-3">
            <label className="form-label">Remise (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="input"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {asset && days > 0 && (
            <div
              className="card mt-4"
              style={{ background: 'var(--bg3)', borderColor: 'rgba(79,124,255,0.3)' }}
            >
              <div
                className="text-xs font-mono uppercase tracking-wider mb-2"
                style={{ color: 'var(--text3)' }}
              >
                Récapitulatif
              </div>
              <div className="flex justify-between text-sm py-1">
                <span style={{ color: 'var(--text2)' }}>Durée</span>
                <span>
                  {days} jours
                  {data.sector === 'real_estate' && months >= 1
                    ? ` (≈ ${months.toFixed(1)} mois)`
                    : ''}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span style={{ color: 'var(--text2)' }}>Tarif</span>
                <span>
                  {fmt(asset.basePrice)} {cfg.priceUnit}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span style={{ color: 'var(--text2)' }}>Sous-total</span>
                <span>{fmt(baseAmount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm py-1" style={{ color: 'var(--gold)' }}>
                  <span>Remise {discount}%</span>
                  <span>−{fmt(baseAmount - amountHt)}</span>
                </div>
              )}
              <div
                className="flex justify-between font-display font-bold text-base pt-2 mt-2 border-t"
                style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
              >
                <span>Total HT</span>
                <span>{fmt(amountHt)}</span>
              </div>
            </div>
          )}
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
            onClick={handleSubmit}
            disabled={!form.assetId || !form.partyId || !form.endDate}
          >
            Créer le devis
          </button>
        </div>
      </div>
    </div>
  );
}

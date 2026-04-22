import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmt, fmtDate, uid } from '../../utils/helpers.js';

export default function ExpensesPage() {
  const { data, updateData, cfg, showToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const sectorAssetIds = data.assets.filter((a) => a.sector === data.sector).map((a) => a.id);
  const sectorExpenses = data.expenses.filter((e) => sectorAssetIds.includes(e.assetId));
  const filtered = sectorExpenses.filter((e) => filter === 'all' || e.category === filter);

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const byCategory = {};
  sectorExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const handleSave = (expense) => {
    updateData((d) => ({ ...d, expenses: [...d.expenses, { id: uid(), ...expense }] }));
    showToast('Dépense enregistrée');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    updateData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
    showToast('Dépense supprimée');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="text-xs" style={{ color: 'var(--text3)' }}>
          {filtered.length} dépense(s) · Total:{' '}
          <span style={{ color: 'var(--gold)' }}>{fmt(total)}</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nouvelle dépense
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {Object.entries(byCategory)
          .slice(0, 4)
          .map(([cat, amt]) => (
            <div key={cat} className="kpi-card gold">
              <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
                {cat}
              </div>
              <div
                className="font-display font-bold text-lg mt-1"
                style={{ color: 'var(--gold)' }}
              >
                {fmt(amt)}
              </div>
            </div>
          ))}
      </div>

      <div className="flex gap-2 mb-4">
        <select
          className="input"
          style={{ maxWidth: '220px' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Toutes catégories</option>
          {cfg.expenseCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty">Aucune dépense.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>{cfg.asset.singular}</th>
                <th>Description</th>
                <th className="text-right">Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((e) => {
                  const asset = data.assets.find((a) => a.id === e.assetId);
                  return (
                    <tr key={e.id}>
                      <td className="text-xs">{fmtDate(e.date)}</td>
                      <td>
                        <span className="tag tag-grey">{e.category}</span>
                      </td>
                      <td className="text-sm">{asset?.name}</td>
                      <td className="text-sm" style={{ color: 'var(--text2)' }}>
                        {e.description}
                      </td>
                      <td className="text-right font-medium" style={{ color: 'var(--gold)' }}>
                        {fmt(e.amount)}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(e.id)}
                          style={{ color: 'var(--red)' }}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <ExpenseForm onSave={handleSave} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ExpenseForm({ onSave, onClose }) {
  const { data, cfg } = useStore();
  const [form, setForm] = useState({
    assetId: '',
    category: cfg.expenseCategories[0],
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg">Nouvelle dépense</h3>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="form-row">
            <label className="form-label">{cfg.asset.singular} *</label>
            <select
              className="input"
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            >
              <option value="">— Sélectionner —</option>
              {data.assets
                .filter((a) => a.sector === data.sector)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.refCode} — {a.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-grid form-grid-2">
            <div>
              <label className="form-label">Catégorie *</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {cfg.expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row mt-3">
            <label className="form-label">Montant (€) *</label>
            <input
              type="number"
              className="input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Description</label>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Détail de la dépense..."
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
            disabled={!form.assetId || !form.amount}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

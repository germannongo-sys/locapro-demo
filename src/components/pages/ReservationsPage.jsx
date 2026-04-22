import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import {
  fmt,
  fmtDate,
  reservationStatuses,
  uid,
  daysBetween,
  daysFromToday,
  buildWhatsAppLink,
  buildMailtoLink,
} from '../../utils/helpers.js';

export default function ReservationsPage() {
  const { data, updateData, cfg, showToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const sectorAssetIds = data.assets.filter((a) => a.sector === data.sector).map((a) => a.id);
  const sectorReservations = (data.reservations || []).filter((r) =>
    sectorAssetIds.includes(r.assetId)
  );

  const filtered = sectorReservations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const asset = data.assets.find((a) => a.id === r.assetId);
      const party = data.parties.find((p) => p.id === r.partyId);
      const haystack = `${r.number} ${asset?.name || ''} ${party?.fullName || ''} ${
        r.notes || ''
      }`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // KPIs
  const activeCount = sectorReservations.filter((r) => r.status === 'active').length;
  const pendingCount = sectorReservations.filter((r) => r.status === 'pending').length;
  const totalRevenue = sectorReservations.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalPaid = sectorReservations.reduce((s, r) => s + (r.paidAmount || 0), 0);

  const handleSave = (reservation) => {
    if (editing) {
      updateData(
        (d) => ({
          ...d,
          reservations: d.reservations.map((r) =>
            r.id === editing.id ? { ...r, ...reservation } : r
          ),
        }),
        {
          action: 'reservation.update',
          target: editing.number,
          details: `Modification réservation`,
        }
      );
      showToast('Réservation modifiée');
    } else {
      const number = `RES-2025-${String(sectorReservations.length + 1).padStart(3, '0')}`;
      const newId = uid();
      // Create reservation + auto-create invoice + auto-update asset status if active
      updateData(
        (d) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = new Date(reservation.startDate);
          start.setHours(0, 0, 0, 0);
          const isActive = today >= start && today <= new Date(reservation.endDate);
          const newReservation = {
            id: newId,
            number,
            createdAt: new Date().toISOString().slice(0, 10),
            invoiceIds: [],
            ...reservation,
            status: isActive ? 'active' : reservation.status || 'confirmed',
          };

          // Auto-create initial invoice
          const invoiceNumber = `FAC-2025-${String(d.invoices.length + 1).padStart(3, '0')}`;
          const newInvoice = {
            id: uid(),
            contractId: null,
            reservationId: newId,
            number: invoiceNumber,
            status: reservation.paidAmount > 0 ? (reservation.paidAmount >= reservation.totalAmount ? 'paid' : 'partial') : 'issued',
            dueDate: reservation.endDate,
            amountHt: reservation.totalAmount,
            taxRate: 0,
            amountTtc: reservation.totalAmount,
            amountPaid: reservation.paidAmount || 0,
            createdAt: new Date().toISOString().slice(0, 10),
          };
          newReservation.invoiceIds = [newInvoice.id];

          // Auto-update asset status if becoming active
          let updatedAssets = d.assets;
          if (isActive) {
            updatedAssets = d.assets.map((a) =>
              a.id === reservation.assetId && a.status === 'available' ? { ...a, status: 'rented' } : a
            );
          }

          return {
            ...d,
            reservations: [...(d.reservations || []), newReservation],
            invoices: [...d.invoices, newInvoice],
            assets: updatedAssets,
          };
        },
        {
          action: 'reservation.create',
          target: number,
          details: `Nouvelle réservation - ${fmt(reservation.totalAmount)}`,
        }
      );
      showToast('Réservation créée + facture générée');
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (reservation) => {
    if (data.user?.role !== 'super_admin' && data.user?.role !== 'admin') {
      showToast('Seul un administrateur peut supprimer une réservation', 'error');
      return;
    }
    if (!window.confirm(`Supprimer la réservation ${reservation.number} ?`)) return;
    updateData(
      (d) => ({
        ...d,
        reservations: d.reservations.filter((r) => r.id !== reservation.id),
        invoices: d.invoices.filter((i) => !reservation.invoiceIds?.includes(i.id)),
      }),
      {
        action: 'reservation.delete',
        target: reservation.number,
        details: `Suppression réservation`,
      }
    );
    showToast('Réservation supprimée');
  };

  const addAcompte = (reservation, amount) => {
    updateData(
      (d) => {
        const newPaid = (reservation.paidAmount || 0) + amount;
        const updatedReservation = { ...reservation, paidAmount: newPaid };

        // Add a new invoice for the acompte
        const invoiceNumber = `FAC-2025-${String(d.invoices.length + 1).padStart(3, '0')}`;
        const acompteInvoice = {
          id: uid(),
          contractId: null,
          reservationId: reservation.id,
          number: invoiceNumber,
          status: 'paid',
          dueDate: new Date().toISOString().slice(0, 10),
          amountHt: amount,
          taxRate: 0,
          amountTtc: amount,
          amountPaid: amount,
          createdAt: new Date().toISOString().slice(0, 10),
          isAcompte: true,
        };
        updatedReservation.invoiceIds = [...(reservation.invoiceIds || []), acompteInvoice.id];

        // Update existing main invoice status
        const updatedInvoices = d.invoices.map((i) => {
          if (reservation.invoiceIds?.includes(i.id) && !i.isAcompte) {
            const newAmount = i.amountPaid + amount;
            const newStatus =
              newAmount >= i.amountTtc ? 'paid' : newAmount > 0 ? 'partial' : 'issued';
            return { ...i, amountPaid: newAmount, status: newStatus };
          }
          return i;
        });

        return {
          ...d,
          reservations: d.reservations.map((r) =>
            r.id === reservation.id ? updatedReservation : r
          ),
          invoices: [...updatedInvoices, acompteInvoice],
        };
      },
      {
        action: 'invoice.create',
        target: reservation.number,
        details: `Acompte de ${fmt(amount)} enregistré`,
      }
    );
    showToast(`Acompte de ${fmt(amount)} enregistré`);
  };

  return (
    <div className="p-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="kpi-card">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            Réservations actives
          </div>
          <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--accent)' }}>
            {activeCount}
          </div>
        </div>
        <div className="kpi-card gold">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            En attente
          </div>
          <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--gold)' }}>
            {pendingCount}
          </div>
        </div>
        <div className="kpi-card green">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            Total facturé
          </div>
          <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--green)' }}>
            {fmt(totalRevenue)}
          </div>
        </div>
        <div className="kpi-card purple">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            Encaissé
          </div>
          <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--purple)' }}>
            {fmt(totalPaid)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <div className="text-xs" style={{ color: 'var(--text3)' }}>
          {filtered.length} réservation(s)
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + Nouvelle réservation
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          className="input"
          style={{ maxWidth: '300px' }}
          placeholder="🔍 Rechercher (n°, client, bien, notes...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous statuts</option>
          {Object.entries(reservationStatuses).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty">Aucune réservation.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>{cfg.client.singular}</th>
                  <th>{cfg.asset.singular}</th>
                  <th>Période</th>
                  <th>Restant</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Réglé</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const party = data.parties.find((p) => p.id === r.partyId);
                  const asset = data.assets.find((a) => a.id === r.assetId);
                  const remaining = (r.totalAmount || 0) - (r.paidAmount || 0);
                  const daysLeft = daysFromToday(r.endDate);
                  const isEndingSoon = r.status === 'active' && daysLeft >= 0 && daysLeft <= 1;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="font-mono text-xs font-medium">{r.number}</div>
                      </td>
                      <td>
                        <div className="text-sm font-medium">{party?.fullName}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text3)' }}>
                          {party?.phone}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">{asset?.name}</div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--text3)' }}>
                          {asset?.refCode}
                        </div>
                      </td>
                      <td className="text-xs">
                        <div>{fmtDate(r.startDate)}</div>
                        <div style={{ color: 'var(--text3)' }}>→ {fmtDate(r.endDate)}</div>
                      </td>
                      <td>
                        {r.status === 'active' && (
                          <span
                            className={`tag ${
                              isEndingSoon ? 'tag-red' : daysLeft <= 7 ? 'tag-gold' : 'tag-blue'
                            }`}
                          >
                            {isEndingSoon ? '⚠ ' : ''}
                            {daysLeft <= 0 ? 'Aujourd\'hui' : `${daysLeft}j restants`}
                          </span>
                        )}
                        {r.status === 'pending' && <span className="tag tag-grey">—</span>}
                      </td>
                      <td className="text-right font-medium">{fmt(r.totalAmount)}</td>
                      <td className="text-right">
                        <div
                          className="font-medium"
                          style={{
                            color:
                              r.paidAmount >= r.totalAmount ? 'var(--green)' : 'var(--text2)',
                          }}
                        >
                          {fmt(r.paidAmount)}
                        </div>
                        {remaining > 0 && (
                          <div className="text-[10px]" style={{ color: 'var(--gold)' }}>
                            Reste {fmt(remaining)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`tag ${reservationStatuses[r.status].tag}`}>
                          {reservationStatuses[r.status].label}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1 justify-end">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setViewing(r)}
                            title="Détails"
                          >
                            👁
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(r)}
                            style={{ color: 'var(--red)' }}
                            title="Supprimer"
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
          </div>
        )}
      </div>

      {showForm && (
        <ReservationForm
          reservation={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      {viewing && (
        <ReservationDetail
          reservation={viewing}
          onClose={() => setViewing(null)}
          onAcompte={addAcompte}
        />
      )}
    </div>
  );
}

// ───────── FORM ─────────
function ReservationForm({ reservation, onSave, onClose }) {
  const { data, cfg, showToast } = useStore();
  const [form, setForm] = useState(
    reservation || {
      assetId: '',
      partyId: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      dailyRate: 0,
      totalAmount: 0,
      paidAmount: 0,
      notes: '',
      status: 'confirmed',
      manualPrice: false,
    }
  );

  const asset = data.assets.find((a) => a.id === form.assetId);
  const days = daysBetween(form.startDate, form.endDate);

  // Auto-update price when asset/dates change unless manualPrice is set
  React.useEffect(() => {
    if (!form.manualPrice && asset && days > 0) {
      setForm((prev) => ({
        ...prev,
        dailyRate: asset.basePrice,
        totalAmount: asset.basePrice * days,
      }));
    }
  }, [form.assetId, form.startDate, form.endDate, days, asset, form.manualPrice]);

  const handleSubmit = () => {
    if (!form.assetId || !form.partyId || !form.endDate) {
      showToast('Tous les champs sont requis', 'error');
      return;
    }
    if (form.totalAmount <= 0) {
      showToast('Le montant total doit être supérieur à 0', 'error');
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg">
            {reservation ? 'Modifier' : 'Nouvelle'} réservation
          </h3>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="form-grid form-grid-2">
            <div>
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
                      {p.fullName} ({p.phone})
                    </option>
                  ))}
              </select>
            </div>
            <div>
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

          {asset && days > 0 && (
            <>
              <div
                className="card mt-4"
                style={{ background: 'var(--bg3)', borderColor: 'rgba(79,124,255,0.3)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: 'var(--text3)' }}
                  >
                    Tarification
                  </div>
                  <label
                    className="text-xs flex items-center gap-2 cursor-pointer"
                    style={{ color: 'var(--text2)' }}
                  >
                    <input
                      type="checkbox"
                      checked={form.manualPrice}
                      onChange={(e) =>
                        setForm({ ...form, manualPrice: e.target.checked })
                      }
                    />
                    Saisie manuelle
                  </label>
                </div>

                <div className="form-grid form-grid-2">
                  <div>
                    <label className="form-label">Tarif journalier (FCFA)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.dailyRate}
                      disabled={!form.manualPrice}
                      onChange={(e) => {
                        const newRate = parseFloat(e.target.value) || 0;
                        setForm({
                          ...form,
                          dailyRate: newRate,
                          totalAmount: newRate * days,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Montant total (FCFA)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.totalAmount}
                      disabled={!form.manualPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          totalAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm mt-3 py-1">
                  <span style={{ color: 'var(--text2)' }}>Durée</span>
                  <span className="font-medium">{days} jour(s)</span>
                </div>
                <div
                  className="flex justify-between font-display font-bold text-base pt-2 mt-2 border-t"
                  style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                >
                  <span>Total</span>
                  <span>{fmt(form.totalAmount)}</span>
                </div>
              </div>

              <div className="form-row mt-4">
                <label className="form-label">Acompte initial (optionnel)</label>
                <input
                  type="number"
                  className="input"
                  value={form.paidAmount || 0}
                  onChange={(e) =>
                    setForm({ ...form, paidAmount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
                {form.paidAmount > 0 && form.paidAmount < form.totalAmount && (
                  <div className="text-xs mt-1" style={{ color: 'var(--gold)' }}>
                    Reste à payer : {fmt(form.totalAmount - form.paidAmount)}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-row mt-3">
            <label className="form-label">Notes / Observations</label>
            <textarea
              className="input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Modalités particulières, conditions..."
            />
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
            onClick={handleSubmit}
            disabled={!form.assetId || !form.partyId || !form.endDate || form.totalAmount <= 0}
          >
            {reservation ? 'Modifier' : 'Créer la réservation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── DETAIL VIEW ─────────
function ReservationDetail({ reservation, onClose, onAcompte }) {
  const { data, cfg, showToast } = useStore();
  const [acompteAmount, setAcompteAmount] = useState('');
  const party = data.parties.find((p) => p.id === reservation.partyId);
  const asset = data.assets.find((a) => a.id === reservation.assetId);
  const invoices = data.invoices.filter((i) => reservation.invoiceIds?.includes(i.id));
  const remaining = (reservation.totalAmount || 0) - (reservation.paidAmount || 0);
  const tenant = data.tenant;

  const buildSummary = () => {
    return `Bonjour ${party?.fullName || ''},

Voici le récapitulatif de votre réservation chez ${tenant?.name || 'LocaPro'} :

📅 N° ${reservation.number}
🏠 ${asset?.name || ''} (${asset?.refCode || ''})
📆 Du ${fmtDate(reservation.startDate)} au ${fmtDate(reservation.endDate)}
💰 Total : ${fmt(reservation.totalAmount)}
✅ Réglé : ${fmt(reservation.paidAmount)}
${remaining > 0 ? `⚠️ Reste à payer : ${fmt(remaining)}` : '✓ Soldé'}

${reservation.notes ? `Notes : ${reservation.notes}` : ''}

Cordialement.`;
  };

  const sendWhatsApp = () => {
    if (!party?.phone) {
      showToast('Numéro de téléphone manquant pour ce client', 'error');
      return;
    }
    window.open(buildWhatsAppLink(party.phone, buildSummary()), '_blank');
  };

  const sendEmail = () => {
    if (!party?.email) {
      showToast('Email manquant pour ce client', 'error');
      return;
    }
    window.location.href = buildMailtoLink(
      party.email,
      `Réservation ${reservation.number} - ${tenant?.name || 'LocaPro'}`,
      buildSummary()
    );
  };

  const printQuote = () => {
    const html = `
      <html>
      <head><title>${reservation.number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { color: #4f7cff; }
        .section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td, th { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
        .total { font-size: 20px; color: #4f7cff; font-weight: bold; }
      </style>
      </head>
      <body>
        <h1>${tenant?.name || 'LocaPro'}</h1>
        <p style="color:#666;">DEVIS / RÉSERVATION ${reservation.number}</p>
        <div class="section">
          <h3>Client</h3>
          <p>${party?.fullName}<br>${party?.email || ''}<br>${party?.phone || ''}<br>${party?.address || ''}</p>
        </div>
        <div class="section">
          <h3>${cfg.asset.singular}</h3>
          <p>${asset?.name} (${asset?.refCode})</p>
        </div>
        <table>
          <tr><th>Description</th><th>Période</th><th>Tarif</th><th>Total</th></tr>
          <tr>
            <td>${asset?.name}</td>
            <td>${fmtDate(reservation.startDate)} → ${fmtDate(reservation.endDate)}</td>
            <td>${fmt(reservation.dailyRate)} / jour</td>
            <td>${fmt(reservation.totalAmount)}</td>
          </tr>
        </table>
        <p>Réglé : ${fmt(reservation.paidAmount)}<br>
        ${remaining > 0 ? `Reste à payer : <span class="total">${fmt(remaining)}</span>` : '<span class="total">SOLDÉ</span>'}</p>
        ${reservation.notes ? `<p><em>${reservation.notes}</em></p>` : ''}
        <p style="text-align:center; margin-top:40px; color:#999; font-size:12px;">Merci de votre confiance — ${tenant?.name || 'LocaPro'}</p>
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const handleAcompte = () => {
    const amt = parseFloat(acompteAmount);
    if (!amt || amt <= 0) {
      showToast('Montant invalide', 'error');
      return;
    }
    if (amt > remaining) {
      showToast(`L'acompte dépasse le restant dû (${fmt(remaining)})`, 'error');
      return;
    }
    onAcompte(reservation, amt);
    setAcompteAmount('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <div className="font-mono text-xs" style={{ color: 'var(--text3)' }}>
              {reservation.number}
            </div>
            <h3 className="font-display font-bold text-lg">
              Réservation — {asset?.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="btn btn-primary btn-sm" onClick={sendWhatsApp}>
              💬 WhatsApp
            </button>
            <button className="btn btn-ghost btn-sm" onClick={sendEmail}>
              ✉️ Email
            </button>
            <button className="btn btn-ghost btn-sm" onClick={printQuote}>
              🖨 Imprimer
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="kpi-card">
              <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
                Total
              </div>
              <div className="font-display font-bold text-base mt-1">
                {fmt(reservation.totalAmount)}
              </div>
            </div>
            <div className="kpi-card green">
              <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
                Réglé
              </div>
              <div
                className="font-display font-bold text-base mt-1"
                style={{ color: 'var(--green)' }}
              >
                {fmt(reservation.paidAmount)}
              </div>
            </div>
            <div className="kpi-card gold">
              <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
                Restant
              </div>
              <div
                className="font-display font-bold text-base mt-1"
                style={{ color: remaining > 0 ? 'var(--gold)' : 'var(--green)' }}
              >
                {fmt(remaining)}
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="card mb-4" style={{ background: 'var(--bg3)' }}>
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Client
            </div>
            <div className="text-sm font-medium">{party?.fullName}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
              {party?.email && <div>📧 {party.email}</div>}
              {party?.phone && <div>📞 {party.phone}</div>}
            </div>
          </div>

          {/* Period */}
          <div className="card mb-4" style={{ background: 'var(--bg3)' }}>
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Période & Tarification
            </div>
            <div className="text-sm">
              {fmtDate(reservation.startDate)} → {fmtDate(reservation.endDate)} (
              {daysBetween(reservation.startDate, reservation.endDate)} jours)
            </div>
            <div className="text-sm mt-1">
              Tarif : <span className="font-medium">{fmt(reservation.dailyRate)}</span>
              {' / jour'}
            </div>
            {reservation.notes && (
              <div className="text-xs mt-2 italic" style={{ color: 'var(--text2)' }}>
                {reservation.notes}
              </div>
            )}
          </div>

          {/* Add acompte */}
          {remaining > 0 && (
            <div
              className="card mb-4"
              style={{ borderColor: 'rgba(240,180,41,0.3)', background: 'rgba(240,180,41,0.05)' }}
            >
              <div
                className="text-xs font-mono uppercase tracking-wider mb-2"
                style={{ color: 'var(--gold)' }}
              >
                💰 Enregistrer un acompte
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input flex-1"
                  placeholder={`Maximum ${fmt(remaining)}`}
                  value={acompteAmount}
                  onChange={(e) => setAcompteAmount(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleAcompte}>
                  + Ajouter
                </button>
              </div>
              <div className="text-[10px] mt-2" style={{ color: 'var(--text3)' }}>
                Génère automatiquement une facture mise à jour
              </div>
            </div>
          )}

          {/* Invoices */}
          {invoices.length > 0 && (
            <div>
              <div
                className="text-xs font-mono uppercase tracking-wider mb-2"
                style={{ color: 'var(--text3)' }}
              >
                Factures liées ({invoices.length})
              </div>
              <table
                className="data-table"
                style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}
              >
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="text-right">Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id}>
                      <td className="font-mono text-xs">{i.number}</td>
                      <td className="text-xs">{fmtDate(i.createdAt)}</td>
                      <td>
                        <span className={`tag ${i.isAcompte ? 'tag-gold' : 'tag-blue'}`}>
                          {i.isAcompte ? 'Acompte' : 'Facture'}
                        </span>
                      </td>
                      <td className="text-right font-medium">{fmt(i.amountTtc)}</td>
                      <td>
                        <span
                          className={`tag ${
                            i.status === 'paid'
                              ? 'tag-green'
                              : i.status === 'partial'
                              ? 'tag-gold'
                              : 'tag-red'
                          }`}
                        >
                          {i.status === 'paid'
                            ? 'Payée'
                            : i.status === 'partial'
                            ? 'Acompte'
                            : 'Impayée'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

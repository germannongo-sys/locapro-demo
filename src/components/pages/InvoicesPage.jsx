import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmt, fmtDate, invoiceStatuses, isAdmin } from '../../utils/helpers.js';

export default function InvoicesPage() {
  const { data, updateData, showToast, cfg } = useStore();
  const userIsAdmin = isAdmin(data.user);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  const sectorAssetIds = data.assets.filter((a) => a.sector === data.sector).map((a) => a.id);
  const sectorContractIds = data.contracts
    .filter((c) => sectorAssetIds.includes(c.assetId))
    .map((c) => c.id);
  const sectorInvoices = data.invoices.filter((i) => sectorContractIds.includes(i.contractId));
  const filtered = sectorInvoices.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const contract = data.contracts.find((c) => c.id === i.contractId);
      const party = data.parties.find((p) => p.id === contract?.partyId);
      if (!`${i.number} ${party?.fullName || ''}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalAmount = filtered.reduce((s, i) => s + i.amountTtc, 0);
  const totalPaid = filtered.reduce((s, i) => s + (i.amountPaid || 0), 0);

  const markPaid = (inv) => {
    updateData(
      (d) => ({
        ...d,
        invoices: d.invoices.map((i) =>
          i.id === inv.id ? { ...i, status: 'paid', amountPaid: i.amountTtc } : i
        ),
      }),
      { action: 'invoice.update', target: inv.number, details: 'Marquée comme payée' }
    );
    showToast('Facture marquée comme payée');
  };

  const handleDelete = (inv) => {
    if (!userIsAdmin) {
      showToast('🛡️ Seul un administrateur peut supprimer une facture', 'error');
      return;
    }
    if (!window.confirm(`Supprimer définitivement la facture ${inv.number} ?`)) return;
    updateData(
      (d) => ({ ...d, invoices: d.invoices.filter((i) => i.id !== inv.id) }),
      { action: 'invoice.delete', target: inv.number, details: `Suppression facture ${fmt(inv.amountTtc)}` }
    );
    showToast('Facture supprimée');
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="kpi-card">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            Total facturé
          </div>
          <div className="font-display font-bold text-lg mt-1">{fmt(totalAmount)}</div>
        </div>
        <div className="kpi-card green">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            Encaissé
          </div>
          <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--green)' }}>
            {fmt(totalPaid)}
          </div>
        </div>
        <div className="kpi-card gold">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            En attente
          </div>
          <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--gold)' }}>
            {fmt(totalAmount - totalPaid)}
          </div>
        </div>
        <div className="kpi-card purple">
          <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
            Nb factures
          </div>
          <div className="font-display font-bold text-lg mt-1">{filtered.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="input"
          style={{ maxWidth: '300px' }}
          placeholder="🔍 Rechercher par n° ou client..."
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
          {Object.entries(invoiceStatuses).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty">Aucune facture.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>{cfg.asset.singular}</th>
                <th>Échéance</th>
                <th className="text-right">Total TTC</th>
                <th className="text-right">Réglé</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const contract = data.contracts.find((c) => c.id === inv.contractId);
                const party = data.parties.find((p) => p.id === contract?.partyId);
                const asset = data.assets.find((a) => a.id === contract?.assetId);
                return (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs font-medium">{inv.number}</td>
                    <td>{party?.fullName}</td>
                    <td className="text-xs" style={{ color: 'var(--text2)' }}>
                      {asset?.name}
                    </td>
                    <td className="text-xs">{fmtDate(inv.dueDate)}</td>
                    <td className="text-right font-medium">{fmt(inv.amountTtc)}</td>
                    <td
                      className="text-right"
                      style={{
                        color: inv.amountPaid >= inv.amountTtc ? 'var(--green)' : 'var(--text2)',
                      }}
                    >
                      {fmt(inv.amountPaid)}
                    </td>
                    <td>
                      <span className={`tag ${invoiceStatuses[inv.status].tag}`}>
                        {invoiceStatuses[inv.status].label}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewing(inv)}>
                          👁
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => markPaid(inv)}
                            style={{ color: 'var(--green)' }}
                            title="Marquer payée"
                          >
                            ✓
                          </button>
                        )}
                        {userIsAdmin && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(inv)}
                            style={{ color: 'var(--red)' }}
                            title="Supprimer (admin)"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {viewing && <InvoiceDetailModal invoice={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function InvoiceDetailModal({ invoice, onClose }) {
  const { data } = useStore();
  const contract = data.contracts.find((c) => c.id === invoice.contractId);
  const party = data.parties.find((p) => p.id === contract?.partyId);
  const asset = data.assets.find((a) => a.id === contract?.assetId);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg">Facture {invoice.number}</h3>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5">
          <div
            className="card"
            style={{
              background: 'white',
              color: '#1a1a1a',
              padding: '32px',
              fontFamily: 'serif',
            }}
          >
            <div className="flex justify-between mb-6">
              <div>
                <div className="font-display font-bold text-2xl text-blue-600">LocaPro</div>
                <div className="text-xs text-gray-500 mt-1">Gestion locative professionnelle</div>
              </div>
              <div className="text-right">
                <div className="font-bold">FACTURE</div>
                <div className="text-sm">{invoice.number}</div>
                <div className="text-xs text-gray-500">Échéance: {fmtDate(invoice.dueDate)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Émetteur</div>
                <div className="font-bold">LocaPro Démo</div>
                <div>123 Avenue de la République</div>
                <div>75011 Paris, France</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Destinataire
                </div>
                <div className="font-bold">{party?.fullName}</div>
                <div>{party?.address}</div>
                <div>{party?.email}</div>
              </div>
            </div>
            <table
              className="w-full text-sm mb-4 border-t border-b"
              style={{ borderColor: '#e5e7eb' }}
            >
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t" style={{ borderColor: '#f3f4f6' }}>
                  <td className="py-3">
                    <div>{asset?.name}</div>
                    <div className="text-xs text-gray-500">
                      Période: {fmtDate(contract?.startDate)} → {fmtDate(contract?.endDate)}
                    </div>
                  </td>
                  <td className="text-right py-3">{fmt(invoice.amountHt)}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-64 text-sm">
                <div className="flex justify-between py-1">
                  <span>Total HT</span>
                  <span>{fmt(invoice.amountHt)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>TVA ({invoice.taxRate}%)</span>
                  <span>{fmt(invoice.amountTtc - invoice.amountHt)}</span>
                </div>
                <div
                  className="flex justify-between py-2 border-t font-bold text-lg"
                  style={{ borderColor: '#e5e7eb', color: '#2563eb' }}
                >
                  <span>Total TTC</span>
                  <span>{fmt(invoice.amountTtc)}</span>
                </div>
                {invoice.amountPaid > 0 && (
                  <div className="flex justify-between py-1 text-green-600">
                    <span>Réglé</span>
                    <span>{fmt(invoice.amountPaid)}</span>
                  </div>
                )}
              </div>
            </div>
            <div
              className="text-xs text-gray-500 text-center mt-8 pt-4 border-t"
              style={{ borderColor: '#e5e7eb' }}
            >
              Merci de votre confiance — LocaPro Démo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

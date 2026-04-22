import React, { useRef, useEffect } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmt, fmtDate, statusColors } from '../../utils/helpers.js';
import Chart from 'chart.js/auto';

export default function Dashboard({ onNavigate }) {
  const { data, cfg, alerts } = useStore();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const donutRef = useRef(null);
  const donutInstance = useRef(null);

  const sectorAssets = data.assets.filter((a) => a.sector === data.sector);
  const sectorContractIds = data.contracts
    .filter((c) => sectorAssets.some((a) => a.id === c.assetId))
    .map((c) => c.id);
  const sectorInvoices = data.invoices.filter((i) => sectorContractIds.includes(i.contractId));

  const totalRevenue = sectorInvoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + i.amountTtc, 0);
  const totalPaid = sectorInvoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalOutstanding = sectorInvoices.reduce(
    (s, i) => s + (i.amountTtc - (i.amountPaid || 0)),
    0
  );
  const totalExpenses = data.expenses
    .filter((e) => sectorAssets.some((a) => a.id === e.assetId))
    .reduce((s, e) => s + e.amount, 0);
  const occupancy =
    sectorAssets.length === 0
      ? 0
      : Math.round((sectorAssets.filter((a) => a.status === 'rented').length / sectorAssets.length) * 100);
  const pendingInvoices = sectorInvoices.filter(
    (i) => i.status === 'unpaid' || i.status === 'partial' || i.status === 'issued'
  ).length;

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    const months = ['Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'];
    const baseRevenue = totalRevenue / 8 || 2000;
    const revenueData = months.map((_, i) =>
      Math.round(baseRevenue * (0.7 + Math.random() * 0.6) * (1 + i * 0.05))
    );
    const expenseData = months.map(() =>
      Math.round((totalExpenses / 8 || 500) * (0.6 + Math.random() * 0.8))
    );

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Revenus',
            data: revenueData,
            backgroundColor: 'rgba(79,124,255,0.8)',
            borderRadius: 4,
            barThickness: 20,
          },
          {
            label: 'Charges',
            data: expenseData,
            backgroundColor: 'rgba(240,180,41,0.6)',
            borderRadius: 4,
            barThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#8a95ae', font: { family: 'DM Sans', size: 12 }, usePointStyle: true },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(42,51,72,0.5)' },
            ticks: { color: '#8a95ae', font: { family: 'JetBrains Mono', size: 10 } },
          },
          y: {
            grid: { color: 'rgba(42,51,72,0.5)' },
            ticks: { color: '#8a95ae', font: { family: 'JetBrains Mono', size: 10 } },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data.sector, totalRevenue, totalExpenses]);

  useEffect(() => {
    if (!donutRef.current) return;
    if (donutInstance.current) donutInstance.current.destroy();

    const statusCounts = { available: 0, rented: 0, maintenance: 0, archived: 0 };
    sectorAssets.forEach((a) => statusCounts[a.status]++);

    donutInstance.current = new Chart(donutRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Disponible', 'Loué', 'Maintenance', 'Archivé'],
        datasets: [
          {
            data: [
              statusCounts.available,
              statusCounts.rented,
              statusCounts.maintenance,
              statusCounts.archived,
            ],
            backgroundColor: ['#22c97a', '#4f7cff', '#f0b429', '#556080'],
            borderColor: '#1a2030',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#8a95ae',
              font: { family: 'DM Sans', size: 11 },
              usePointStyle: true,
              padding: 14,
            },
          },
        },
      },
    });
    return () => {
      if (donutInstance.current) donutInstance.current.destroy();
    };
  }, [data.sector, sectorAssets.length]);

  const topAssets = sectorAssets
    .map((a) => {
      const contracts = data.contracts.filter((c) => c.assetId === a.id);
      const revenue = data.invoices
        .filter((i) => contracts.some((c) => c.id === i.contractId) && i.status === 'paid')
        .reduce((s, i) => s + i.amountTtc, 0);
      return { ...a, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="p-6">
      {/* Alerts banner */}
      {alerts.length > 0 && (
        <div className="mb-5 space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-lg flex items-start gap-3 cursor-pointer transition"
              style={{
                background:
                  alert.type === 'error'
                    ? 'rgba(255,91,91,0.08)'
                    : 'rgba(240,180,41,0.08)',
                border: `1px solid ${
                  alert.type === 'error'
                    ? 'rgba(255,91,91,0.3)'
                    : 'rgba(240,180,41,0.3)'
                }`,
              }}
              onClick={() => alert.reservationId && onNavigate?.('reservations')}
            >
              <span className="text-lg">{alert.type === 'error' ? '⚠️' : '⏰'}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{alert.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                  {alert.message}
                </div>
              </div>
              {alert.reservationId && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.('reservations');
                  }}
                >
                  Voir →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div
            className="text-[10px] font-mono uppercase tracking-wider mb-2"
            style={{ color: 'var(--text3)' }}
          >
            Revenus encaissés
          </div>
          <div className="font-display font-bold text-2xl" style={{ color: 'var(--accent)' }}>
            {fmt(totalPaid)}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--green)' }}>
            ↑ Total facturé
          </div>
        </div>
        <div className="kpi-card green">
          <div
            className="text-[10px] font-mono uppercase tracking-wider mb-2"
            style={{ color: 'var(--text3)' }}
          >
            {cfg.occupancy}
          </div>
          <div className="font-display font-bold text-2xl" style={{ color: 'var(--green)' }}>
            {occupancy}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
            {sectorAssets.filter((a) => a.status === 'rented').length}/{sectorAssets.length}{' '}
            {cfg.asset.plural.toLowerCase()}
          </div>
        </div>
        <div className="kpi-card gold">
          <div
            className="text-[10px] font-mono uppercase tracking-wider mb-2"
            style={{ color: 'var(--text3)' }}
          >
            Encours impayés
          </div>
          <div className="font-display font-bold text-2xl" style={{ color: 'var(--gold)' }}>
            {fmt(totalOutstanding)}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
            {pendingInvoices} factures en attente
          </div>
        </div>
        <div className="kpi-card purple">
          <div
            className="text-[10px] font-mono uppercase tracking-wider mb-2"
            style={{ color: 'var(--text3)' }}
          >
            Charges totales
          </div>
          <div className="font-display font-bold text-2xl" style={{ color: 'var(--purple)' }}>
            {fmt(totalExpenses)}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
            Rentabilité : {fmt(totalPaid - totalExpenses)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base">Revenus & Charges (8 mois)</h3>
          </div>
          <div style={{ height: '280px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base">
              Statut {cfg.asset.plural.toLowerCase()}
            </h3>
          </div>
          <div style={{ height: '280px' }}>
            <canvas ref={donutRef}></canvas>
          </div>
        </div>
      </div>

      {/* Active reservations */}
      <ActiveReservationsCard data={data} cfg={cfg} onNavigate={onNavigate} />

      <div className="card mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base">
            Top {cfg.asset.plural.toLowerCase()} par revenus
          </h3>
        </div>
        {topAssets.length === 0 ? (
          <div className="empty">Aucun {cfg.asset.singular.toLowerCase()} dans ce mode.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Statut</th>
                <th className="text-right">Tarif {cfg.priceUnit}</th>
                <th className="text-right">Revenus encaissés</th>
              </tr>
            </thead>
            <tbody>
              {topAssets.map((a) => (
                <tr key={a.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--text3)' }}>
                    {a.refCode}
                  </td>
                  <td className="font-medium">{a.name}</td>
                  <td>
                    <span className={`tag ${statusColors[a.status].tag}`}>
                      {statusColors[a.status].label}
                    </span>
                  </td>
                  <td className="text-right">{fmt(a.basePrice)}</td>
                  <td className="text-right font-medium" style={{ color: 'var(--green)' }}>
                    {fmt(a.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Active reservations section
function ActiveReservationsCard({ data, cfg, onNavigate }) {
  const sectorAssetIds = data.assets.filter((a) => a.sector === data.sector).map((a) => a.id);
  const activeReservations = (data.reservations || [])
    .filter((r) => sectorAssetIds.includes(r.assetId) && r.status === 'active')
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    .slice(0, 5);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base">
          📅 Réservations en cours ({activeReservations.length})
        </h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onNavigate?.('reservations')}
        >
          Tout voir →
        </button>
      </div>
      {activeReservations.length === 0 ? (
        <div className="empty">
          <div className="text-3xl mb-2">📅</div>
          Aucune réservation en cours pour ce secteur.
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>{cfg.asset.singular}</th>
              <th>Client</th>
              <th>Période</th>
              <th>Fin dans</th>
              <th className="text-right">Restant à payer</th>
            </tr>
          </thead>
          <tbody>
            {activeReservations.map((r) => {
              const asset = data.assets.find((a) => a.id === r.assetId);
              const party = data.parties.find((p) => p.id === r.partyId);
              const daysLeft = Math.ceil(
                (new Date(r.endDate) - new Date()) / (1000 * 60 * 60 * 24)
              );
              const remaining = (r.totalAmount || 0) - (r.paidAmount || 0);
              return (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.number}</td>
                  <td>{asset?.name || '—'}</td>
                  <td>{party?.fullName || '—'}</td>
                  <td className="text-xs" style={{ color: 'var(--text2)' }}>
                    {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                  </td>
                  <td>
                    <span
                      className={`tag ${
                        daysLeft <= 1
                          ? 'tag-red'
                          : daysLeft <= 3
                          ? 'tag-gold'
                          : 'tag-blue'
                      }`}
                    >
                      {daysLeft <= 0 ? 'Aujourd\'hui' : `${daysLeft} j`}
                    </span>
                  </td>
                  <td
                    className="text-right font-medium"
                    style={{ color: remaining > 0 ? 'var(--gold)' : 'var(--green)' }}
                  >
                    {remaining > 0 ? fmt(remaining) : '✓ Soldé'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

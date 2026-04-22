import React from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmt, statusColors } from '../../utils/helpers.js';

export default function OwnersPage() {
  const { data, cfg } = useStore();
  const owners = data.parties.filter((p) => p.type === 'owner');

  return (
    <div className="p-6">
      <div className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
        {owners.length} propriétaires
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {owners.map((owner) => {
          const ownerAssets = data.assets.filter((a) => a.ownerId === owner.id);
          const sectorOwnerAssets = ownerAssets.filter((a) => a.sector === data.sector);
          const contractIds = data.contracts
            .filter((c) => sectorOwnerAssets.some((a) => a.id === c.assetId))
            .map((c) => c.id);
          const totalRevenue = data.invoices
            .filter((i) => contractIds.includes(i.contractId) && i.status === 'paid')
            .reduce((s, i) => s + i.amountTtc, 0);
          const totalExpense = data.expenses
            .filter((e) => sectorOwnerAssets.some((a) => a.id === e.assetId))
            .reduce((s, e) => s + e.amount, 0);

          return (
            <div key={owner.id} className="card">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
                  style={{ background: 'rgba(240,180,41,0.15)', color: 'var(--gold)' }}
                >
                  {owner.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold">{owner.fullName}</div>
                  <div className="text-xs" style={{ color: 'var(--text2)' }}>
                    {owner.email} · {owner.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 rounded" style={{ background: 'var(--bg3)' }}>
                  <div
                    className="text-[10px] font-mono uppercase"
                    style={{ color: 'var(--text3)' }}
                  >
                    {cfg.asset.plural}
                  </div>
                  <div className="font-display font-bold text-base">{sectorOwnerAssets.length}</div>
                </div>
                <div className="p-2 rounded" style={{ background: 'var(--bg3)' }}>
                  <div
                    className="text-[10px] font-mono uppercase"
                    style={{ color: 'var(--text3)' }}
                  >
                    Revenus
                  </div>
                  <div
                    className="font-display font-bold text-base"
                    style={{ color: 'var(--green)' }}
                  >
                    {fmt(totalRevenue)}
                  </div>
                </div>
                <div className="p-2 rounded" style={{ background: 'var(--bg3)' }}>
                  <div
                    className="text-[10px] font-mono uppercase"
                    style={{ color: 'var(--text3)' }}
                  >
                    Net
                  </div>
                  <div
                    className="font-display font-bold text-base"
                    style={{
                      color: totalRevenue - totalExpense >= 0 ? 'var(--accent)' : 'var(--red)',
                    }}
                  >
                    {fmt(totalRevenue - totalExpense)}
                  </div>
                </div>
              </div>

              <div
                className="text-xs font-mono uppercase tracking-wider mb-2"
                style={{ color: 'var(--text3)' }}
              >
                {cfg.asset.plural} rattachés
              </div>
              {sectorOwnerAssets.length === 0 ? (
                <div className="text-xs italic" style={{ color: 'var(--text3)' }}>
                  Aucun {cfg.asset.singular.toLowerCase()} dans ce mode
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sectorOwnerAssets.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-sm py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs" style={{ color: 'var(--text3)' }}>
                          {a.refCode}
                        </span>
                        <span>{a.name}</span>
                      </div>
                      <span className={`tag ${statusColors[a.status].tag}`}>
                        {statusColors[a.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

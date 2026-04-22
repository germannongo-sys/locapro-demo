import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmt, fmtDate, statusColors, uid, fileToBase64 } from '../../utils/helpers.js';

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
    if (search) {
      const q = search.toLowerCase();
      const meta = Object.values(a.metadata || {}).join(' ').toLowerCase();
      if (!`${a.name} ${a.refCode} ${meta}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleSave = (asset) => {
    if (editing) {
      updateData(
        (d) => ({
          ...d,
          assets: d.assets.map((a) => (a.id === editing.id ? { ...a, ...asset } : a)),
        }),
        { action: 'asset.update', target: editing.refCode, details: `Modification de ${asset.name}` }
      );
      showToast(`${cfg.asset.singular} modifié`);
    } else {
      const nextNum = sectorAssets.length + 1;
      const prefix = data.sector === 'real_estate' ? 'IMMO' : 'AUTO';
      const refCode = `${prefix}-${String(nextNum).padStart(3, '0')}`;
      updateData(
        (d) => ({
          ...d,
          assets: [
            ...d.assets,
            {
              id: uid(),
              refCode,
              sector: data.sector,
              photos: [],
              ...asset,
            },
          ],
        }),
        { action: 'asset.create', target: refCode, details: `Création ${asset.name}` }
      );
      showToast(`${cfg.asset.singular} créé`);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (asset) => {
    if (data.user?.role !== 'super_admin' && data.user?.role !== 'admin') {
      showToast('Seul un administrateur peut supprimer un actif', 'error');
      return;
    }
    if (!window.confirm(`Supprimer ce ${cfg.asset.singular.toLowerCase()} ?`)) return;
    updateData(
      (d) => ({ ...d, assets: d.assets.filter((a) => a.id !== asset.id) }),
      { action: 'asset.delete', target: asset.refCode, details: `Suppression ${asset.name}` }
    );
    showToast(`${cfg.asset.singular} supprimé`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="text-xs" style={{ color: 'var(--text3)' }}>
          {filtered.length} sur {sectorAssets.length} {cfg.asset.plural.toLowerCase()}
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
          placeholder="🔍 Rechercher (nom, ref, adresse, marque...)"
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
          <option value="rented">Occupé</option>
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
              {asset.photos?.length > 0 ? (
                <div
                  className="relative"
                  style={{
                    height: '140px',
                    backgroundImage: `url(${asset.photos[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {asset.photos.length > 1 && (
                    <div
                      className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs font-mono"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
                    >
                      📷 {asset.photos.length}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-center justify-center text-5xl"
                  style={{
                    height: '140px',
                    background:
                      'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(167,139,250,0.04))',
                  }}
                >
                  {cfg.asset.icon}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
                      {asset.refCode}
                    </div>
                    <div className="font-display font-semibold text-sm mt-0.5 truncate">
                      {asset.name}
                    </div>
                  </div>
                  <span className={`tag ${statusColors[asset.status].tag}`}>
                    {statusColors[asset.status].label}
                  </span>
                </div>
                <div className="text-xs mb-3 truncate" style={{ color: 'var(--text2)' }}>
                  {data.sector === 'real_estate'
                    ? asset.metadata?.address
                    : `${asset.metadata?.brand} ${asset.metadata?.model} · ${asset.metadata?.plate}`}
                </div>
                <div
                  className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="font-display font-bold text-sm" style={{ color: 'var(--accent)' }}>
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
                        handleDelete(asset);
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
  const { cfg, data, showToast } = useStore();
  const [form, setForm] = useState(
    asset || {
      name: '',
      status: 'available',
      basePrice: 0,
      ownerId: '',
      metadata: {},
      photos: [],
    }
  );

  const handleField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleMeta = (key, value) =>
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [key]: value } }));

  const handlePhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if ((form.photos?.length || 0) + files.length > 10) {
      showToast('Maximum 10 photos par ' + cfg.asset.singular.toLowerCase(), 'error');
      return;
    }
    const tooBig = files.some((f) => f.size > 2 * 1024 * 1024);
    if (tooBig) {
      showToast('Une image dépasse 2 Mo', 'error');
      return;
    }
    const base64s = await Promise.all(files.map(fileToBase64));
    setForm((prev) => ({ ...prev, photos: [...(prev.photos || []), ...base64s] }));
  };

  const removePhoto = (idx) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const validOwners = data.parties.filter((p) => p.type === 'owner' && p.validated);
  const canSave = form.name && form.ownerId && form.basePrice > 0;

  const handleSubmit = () => {
    if (!form.ownerId) {
      showToast('⚠️ Le propriétaire est obligatoire', 'error');
      return;
    }
    if (!form.basePrice || form.basePrice <= 0) {
      showToast('Le tarif doit être supérieur à 0', 'error');
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
                  data.sector === 'real_estate' ? 'Appartement Avenue de Gaulle 4B' : 'Toyota Hilux Diesel'
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
                <option value="rented">Occupé</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div>
              <label className="form-label">Tarif journalier (FCFA) *</label>
              <input
                type="number"
                className="input"
                value={form.basePrice}
                onChange={(e) => handleField('basePrice', parseFloat(e.target.value) || 0)}
                required
                placeholder="25000"
              />
            </div>
            <div>
              <label className="form-label">
                Propriétaire * <span style={{ color: 'var(--red)' }}>(obligatoire)</span>
              </label>
              <select
                className="input"
                value={form.ownerId || ''}
                onChange={(e) => handleField('ownerId', e.target.value)}
                required
                style={{ borderColor: !form.ownerId ? 'var(--red)' : 'var(--border)' }}
              >
                <option value="">— Sélectionner un propriétaire validé —</option>
                {validOwners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName}
                  </option>
                ))}
              </select>
              {validOwners.length === 0 && (
                <div className="text-xs mt-1" style={{ color: 'var(--gold)' }}>
                  ⚠ Aucun propriétaire validé. Créez-en un dans le menu Tiers.
                </div>
              )}
            </div>
          </div>

          {/* PHOTOS */}
          <div className="mt-5">
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Photos ({form.photos?.length || 0}/10)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {(form.photos || []).map((src, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden group"
                  style={{
                    aspectRatio: '1',
                    background: `url(${src}) center/cover`,
                    border: '1px solid var(--border)',
                  }}
                >
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {(form.photos?.length || 0) < 10 && (
                <label
                  className="cursor-pointer rounded-lg flex flex-col items-center justify-center text-center"
                  style={{
                    aspectRatio: '1',
                    background: 'var(--bg3)',
                    border: '2px dashed var(--border2)',
                  }}
                >
                  <div className="text-2xl">📷</div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text3)' }}>
                    Ajouter
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotos}
                  />
                </label>
              )}
            </div>
            <div className="text-[10px] mt-2" style={{ color: 'var(--text3)' }}>
              Importez jusqu'à 10 photos depuis votre PC (JPG, PNG · max 2 Mo/image)
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
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSave}>
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
  const reservations = (data.reservations || []).filter((r) => r.assetId === asset.id);
  const expenses = data.expenses.filter((e) => e.assetId === asset.id);
  const totalRevenue = reservations.reduce((s, r) => s + (r.paidAmount || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const [photoIdx, setPhotoIdx] = useState(0);

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
          {/* Photo gallery */}
          {asset.photos?.length > 0 && (
            <div className="mb-4">
              <div
                className="rounded-lg overflow-hidden mb-2"
                style={{
                  aspectRatio: '16/9',
                  background: `url(${asset.photos[photoIdx]}) center/cover`,
                }}
              />
              {asset.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {asset.photos.map((src, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPhotoIdx(idx)}
                      className="cursor-pointer rounded flex-shrink-0"
                      style={{
                        width: '64px',
                        height: '64px',
                        background: `url(${src}) center/cover`,
                        border: idx === photoIdx ? '2px solid var(--accent)' : '2px solid transparent',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="kpi-card green">
              <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
                Revenus
              </div>
              <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--green)' }}>
                {fmt(totalRevenue)}
              </div>
            </div>
            <div className="kpi-card gold">
              <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
                Charges
              </div>
              <div className="font-display font-bold text-lg mt-1" style={{ color: 'var(--gold)' }}>
                {fmt(totalExpense)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="text-[10px] font-mono uppercase" style={{ color: 'var(--text3)' }}>
                Net
              </div>
              <div
                className="font-display font-bold text-lg mt-1"
                style={{ color: totalRevenue - totalExpense >= 0 ? 'var(--accent)' : 'var(--red)' }}
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
                <span style={{ color: 'var(--text3)' }}>Tarif: </span>
                <span className="font-medium" style={{ color: 'var(--accent)' }}>
                  {fmt(asset.basePrice)} {cfg.priceUnit}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Historique des locations ({reservations.length})
            </div>
            {reservations.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--text3)' }}>
                Aucune réservation
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
                  {reservations.map((r) => {
                    const party = data.parties.find((p) => p.id === r.partyId);
                    return (
                      <tr key={r.id}>
                        <td className="font-mono text-xs">{r.number}</td>
                        <td>{party?.fullName}</td>
                        <td className="text-xs" style={{ color: 'var(--text2)' }}>
                          {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                        </td>
                        <td className="text-right font-medium">{fmt(r.totalAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

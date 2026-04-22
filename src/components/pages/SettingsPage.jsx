import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { sectorConfig } from '../../data/sectorConfig.js';
import { fmt, fmtDate, fileToBase64, isAdmin, PLANS, uid } from '../../utils/helpers.js';

export default function SettingsPage() {
  const { data, updateData, showToast, reset, trialStatus } = useStore();
  const [tab, setTab] = useState('organization');
  const userIsAdmin = isAdmin(data.user);
  const tenant = data.tenant;
  const supportsDuo = tenant?.sectors?.length > 1;

  const tabs = [
    { id: 'organization', label: '🏢 Organisation', icon: '🏢' },
    { id: 'subscription', label: '💳 Abonnement', icon: '💳' },
    { id: 'sector', label: '🎛️ Secteur', icon: '🎛️' },
    { id: 'categories', label: '🏷️ Catégories de charges', icon: '🏷️' },
    { id: 'system', label: '⚙️ Système', icon: '⚙️' },
  ];

  return (
    <div className="p-6">
      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition"
            style={{
              color: tab === t.id ? 'var(--accent2)' : 'var(--text2)',
              borderBottom: `2px solid ${
                tab === t.id ? 'var(--accent)' : 'transparent'
              }`,
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {tab === 'organization' && <OrganizationTab tenant={tenant} userIsAdmin={userIsAdmin} updateData={updateData} showToast={showToast} />}
        {tab === 'subscription' && <SubscriptionTab tenant={tenant} trialStatus={trialStatus} userIsAdmin={userIsAdmin} updateData={updateData} showToast={showToast} />}
        {tab === 'sector' && <SectorTab data={data} supportsDuo={supportsDuo} updateData={updateData} showToast={showToast} />}
        {tab === 'categories' && <CategoriesTab data={data} updateData={updateData} showToast={showToast} userIsAdmin={userIsAdmin} />}
        {tab === 'system' && <SystemTab data={data} reset={reset} userIsAdmin={userIsAdmin} />}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// ORGANIZATION TAB - Branding, logo, name
// ──────────────────────────────────────────────
function OrganizationTab({ tenant, userIsAdmin, updateData, showToast }) {
  const [name, setName] = useState(tenant?.name || '');
  const [logo, setLogo] = useState(tenant?.logo || null);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast('Logo trop volumineux (max 1 Mo)', 'error');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      showToast('Format non supporté (PNG, JPG, SVG, WebP)', 'error');
      return;
    }
    const base64 = await fileToBase64(file);
    setLogo(base64);
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Le nom de l\'entreprise est requis', 'error');
      return;
    }
    setSaving(true);
    updateData(
      (d) => ({
        ...d,
        tenant: { ...d.tenant, name: name.trim(), logo },
      }),
      {
        action: 'tenant.update',
        target: name,
        details: 'Mise à jour identité visuelle',
      }
    );
    setTimeout(() => {
      setSaving(false);
      showToast('Identité visuelle mise à jour ✓');
    }, 300);
  };

  return (
    <>
      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-1">🎨 Identité visuelle</h3>
        <p className="text-xs mb-5" style={{ color: 'var(--text3)' }}>
          Personnalisez l'apparence de votre espace LocaPro avec votre marque.
        </p>

        {!userIsAdmin && (
          <div
            className="p-3 rounded mb-4 text-xs"
            style={{
              background: 'rgba(240,180,41,0.1)',
              color: 'var(--gold)',
              border: '1px solid rgba(240,180,41,0.3)',
            }}
          >
            🛡️ Seul un administrateur peut modifier l'identité visuelle.
          </div>
        )}

        <div className="form-row">
          <label className="form-label">Nom de l'entreprise *</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!userIsAdmin}
            placeholder="Ma société de gestion"
          />
        </div>

        <div className="form-row">
          <label className="form-label">Logo</label>
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{
                width: '80px',
                height: '80px',
                background: logo ? 'white' : 'var(--bg3)',
                border: '1px solid var(--border)',
                padding: logo ? '8px' : '0',
              }}
            >
              {logo ? (
                <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-2xl" style={{ color: 'var(--text3)' }}>🏢</span>
              )}
            </div>
            <div className="flex-1">
              {userIsAdmin && (
                <>
                  <label
                    className="btn btn-ghost btn-sm cursor-pointer"
                    style={{ display: 'inline-flex' }}
                  >
                    📤 {logo ? 'Changer' : 'Importer'} le logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {logo && (
                    <button
                      className="btn btn-ghost btn-sm ml-2"
                      onClick={() => setLogo(null)}
                      style={{ color: 'var(--red)' }}
                    >
                      🗑 Retirer
                    </button>
                  )}
                </>
              )}
              <div className="text-[11px] mt-2" style={{ color: 'var(--text3)' }}>
                PNG, JPG, SVG ou WebP · max 1 Mo · idéal 256×256 px
              </div>
            </div>
          </div>
        </div>

        {userIsAdmin && (
          <div className="flex justify-end mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || (!name.trim() && !logo)}
            >
              {saving ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="card">
        <h3 className="font-display font-semibold text-base mb-3">👁️ Aperçu</h3>
        <div
          className="p-4 rounded-lg flex items-center gap-3"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          {logo ? (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
              style={{ background: 'white', padding: '4px' }}
            >
              <img src={logo} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-display font-bold"
              style={{ background: 'var(--accent)' }}
            >
              {(name || 'L').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-display font-bold text-base">{name || 'Mon entreprise'}</div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text3)' }}>
              ESPACE DE GESTION LOCATIVE
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// SUBSCRIPTION TAB
// ──────────────────────────────────────────────
function SubscriptionTab({ tenant, trialStatus, userIsAdmin, updateData, showToast }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const currentPlan = PLANS[tenant?.plan];

  const activateSubscription = (planId) => {
    if (!userIsAdmin) return;
    if (!window.confirm(`Activer l'abonnement ${PLANS[planId].label} à ${fmt(PLANS[planId].price)}/mois ?`))
      return;
    updateData(
      (d) => ({
        ...d,
        tenant: {
          ...d.tenant,
          plan: planId,
          sectors: PLANS[planId].sectors,
          subscribed: true,
          subscribedAt: new Date().toISOString(),
        },
      }),
      { action: 'subscription.activate', target: planId, details: `Abonnement ${PLANS[planId].label}` }
    );
    showToast(`Abonnement ${PLANS[planId].label} activé ✓`);
    setShowUpgrade(false);
  };

  return (
    <>
      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-3">💳 Mon abonnement</h3>

        {/* Current plan */}
        <div
          className="p-4 rounded-lg mb-4"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentPlan?.icon || '📦'}</div>
              <div>
                <div className="font-display font-bold text-lg">
                  Formule {currentPlan?.label || '—'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text2)' }}>
                  {currentPlan?.description}
                </div>
              </div>
            </div>
            {tenant?.subscribed ? (
              <span className="tag tag-green">● Actif</span>
            ) : trialStatus?.expired ? (
              <span className="tag tag-red">● Expiré</span>
            ) : (
              <span className="tag tag-gold">⏱ Essai</span>
            )}
          </div>
        </div>

        {/* Trial / Subscription status */}
        {!tenant?.subscribed && trialStatus && (
          <div
            className="p-4 rounded-lg mb-4"
            style={{
              background: trialStatus.expired
                ? 'rgba(255,91,91,0.08)'
                : trialStatus.ending
                ? 'rgba(240,180,41,0.08)'
                : 'rgba(34,201,122,0.08)',
              border: `1px solid ${
                trialStatus.expired
                  ? 'rgba(255,91,91,0.3)'
                  : trialStatus.ending
                  ? 'rgba(240,180,41,0.3)'
                  : 'rgba(34,201,122,0.3)'
              }`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {trialStatus.expired ? '⚠️' : trialStatus.ending ? '⏰' : '🎁'}
              </span>
              <span className="font-semibold">
                {trialStatus.expired
                  ? 'Période d\'essai terminée'
                  : `Essai gratuit · ${trialStatus.daysLeft} jour${trialStatus.daysLeft > 1 ? 's' : ''} restant${trialStatus.daysLeft > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="text-xs" style={{ color: 'var(--text2)' }}>
              {trialStatus.expired
                ? 'Activez votre abonnement pour continuer à utiliser LocaPro.'
                : `Fin de l'essai le ${fmtDate(tenant.trialEndsAt)}. Activez votre abonnement avant cette date.`}
            </div>
          </div>
        )}

        {tenant?.subscribed && (
          <div className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
            <div>💰 Tarif mensuel : <strong>{fmt(currentPlan?.price)}</strong></div>
            <div className="mt-1">📅 Activé le : {fmtDate(tenant.subscribedAt)}</div>
          </div>
        )}

        {userIsAdmin && (
          <div className="flex gap-2 justify-end pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button className="btn btn-primary" onClick={() => setShowUpgrade(true)}>
              {tenant?.subscribed ? '🔄 Changer de formule' : '✨ Activer mon abonnement'}
            </button>
          </div>
        )}
      </div>

      {/* Available plans */}
      <div className="card">
        <h3 className="font-display font-semibold text-base mb-3">📋 Formules disponibles</h3>
        <div className="space-y-3">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-lg flex items-center justify-between"
              style={{
                background: tenant?.plan === plan.id ? 'rgba(79,124,255,0.08)' : 'var(--bg3)',
                border: `1px solid ${tenant?.plan === plan.id ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{plan.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-display font-semibold">{plan.label}</div>
                    {plan.badge && <span className="tag tag-gold text-[10px]">⭐ {plan.badge}</span>}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text2)' }}>
                    {plan.description}
                  </div>
                  {plan.save && (
                    <div className="text-[11px] mt-1" style={{ color: 'var(--green)' }}>
                      💸 {plan.save}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-base">{fmt(plan.price)}</div>
                <div className="text-[10px]" style={{ color: 'var(--text3)' }}>par mois</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade modal */}
      {showUpgrade && (
        <div className="modal-backdrop" onClick={() => setShowUpgrade(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-display font-bold text-lg">Choisir une formule</h3>
              <button onClick={() => setShowUpgrade(false)} className="text-xl px-2" style={{ color: 'var(--text3)' }}>×</button>
            </div>
            <div className="p-5 space-y-3">
              {Object.values(PLANS).map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => activateSubscription(plan.id)}
                  className="p-4 rounded-lg cursor-pointer transition"
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(79,124,255,0.08)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg3)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{plan.icon}</span>
                      <div>
                        <div className="font-semibold">{plan.label}</div>
                        <div className="text-xs" style={{ color: 'var(--text2)' }}>{plan.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold">{fmt(plan.price)}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text3)' }}>/mois</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-[11px] text-center pt-2" style={{ color: 'var(--text3)' }}>
                💡 Tarifs en FCFA · simulation, aucun paiement réel
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────
// SECTOR TAB
// ──────────────────────────────────────────────
function SectorTab({ data, supportsDuo, updateData, showToast }) {
  const tenant = data.tenant;

  return (
    <>
      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-3">🎛️ Mode sectoriel actif</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
          {supportsDuo
            ? 'Votre formule Duo vous permet de basculer librement entre les deux secteurs.'
            : 'Votre formule actuelle ne couvre qu\'un seul secteur. Pour activer le Duo, modifiez votre formule dans l\'onglet Abonnement.'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {['real_estate', 'fleet'].map((sec) => {
            const allowed = tenant?.sectors?.includes(sec);
            return (
              <div
                key={sec}
                onClick={() => {
                  if (!allowed) {
                    showToast('Ce secteur n\'est pas inclus dans votre formule', 'error');
                    return;
                  }
                  updateData((d) => ({ ...d, sector: sec }));
                  showToast(`Mode ${sectorConfig[sec].label} activé`);
                }}
                className="card transition"
                style={{
                  borderColor: data.sector === sec ? 'var(--accent)' : 'var(--border)',
                  background: data.sector === sec ? 'rgba(79,124,255,0.08)' : 'var(--surface)',
                  cursor: allowed ? 'pointer' : 'not-allowed',
                  opacity: allowed ? 1 : 0.5,
                }}
              >
                <div className="text-3xl mb-2">{sectorConfig[sec].icon}</div>
                <div className="font-display font-semibold">{sectorConfig[sec].label}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                  {sec === 'real_estate' ? 'Gestion de biens locatifs' : 'Gestion de flotte automobile'}
                </div>
                {data.sector === sec && (
                  <div className="mt-2 text-xs font-mono" style={{ color: 'var(--accent)' }}>
                    ● ACTIF
                  </div>
                )}
                {!allowed && (
                  <div className="mt-2 text-[10px] font-mono" style={{ color: 'var(--red)' }}>
                    🔒 NON INCLUS
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// CATEGORIES TAB - CRUD on expense categories
// ──────────────────────────────────────────────
function CategoriesTab({ data, updateData, showToast, userIsAdmin }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('blue');
  const [editSector, setEditSector] = useState(data.sector);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState(data.sector);
  const [newColor, setNewColor] = useState('blue');

  const colors = [
    { id: 'blue', label: 'Bleu', tag: 'tag-blue' },
    { id: 'green', label: 'Vert', tag: 'tag-green' },
    { id: 'gold', label: 'Or', tag: 'tag-gold' },
    { id: 'red', label: 'Rouge', tag: 'tag-red' },
    { id: 'purple', label: 'Violet', tag: 'tag-purple' },
  ];

  const cats = data.expenseCategories || [];
  const sectorCats = cats.filter((c) => c.sector === data.sector);

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditSector(cat.sector);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    updateData(
      (d) => ({
        ...d,
        expenseCategories: d.expenseCategories.map((c) =>
          c.id === editingId
            ? { ...c, name: editName.trim(), color: editColor, sector: editSector }
            : c
        ),
      }),
      { action: 'category.update', target: editName, details: 'Modification catégorie' }
    );
    showToast('Catégorie modifiée');
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    updateData(
      (d) => ({
        ...d,
        expenseCategories: [
          ...d.expenseCategories,
          { id: uid(), name: newName.trim(), sector: newSector, color: newColor },
        ],
      }),
      { action: 'category.create', target: newName, details: `Nouvelle catégorie ${newSector}` }
    );
    showToast('Catégorie créée');
    setNewName('');
    setShowAdd(false);
  };

  const handleDelete = (cat) => {
    if (!userIsAdmin) {
      showToast('Seul un administrateur peut supprimer une catégorie', 'error');
      return;
    }
    // Check if used in expenses
    const used = data.expenses.filter((e) => e.category === cat.name).length;
    if (used > 0) {
      if (!window.confirm(`Cette catégorie est utilisée par ${used} dépense(s). La supprimer ?`))
        return;
    } else {
      if (!window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) return;
    }
    updateData(
      (d) => ({ ...d, expenseCategories: d.expenseCategories.filter((c) => c.id !== cat.id) }),
      { action: 'category.delete', target: cat.name, details: 'Suppression catégorie' }
    );
    showToast('Catégorie supprimée');
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-base">🏷️ Catégories de charges</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            Personnalisez les catégories utilisées pour classer vos dépenses · {sectorCats.length} catégorie(s) actives
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Ajouter</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div
          className="p-3 mb-3 rounded-lg"
          style={{
            background: 'rgba(79,124,255,0.06)',
            border: '1px solid rgba(79,124,255,0.3)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="form-label">Nom de la catégorie *</label>
              <input
                className="input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ex: Honoraires"
                autoFocus
              />
            </div>
            <div>
              <label className="form-label">Secteur</label>
              <select
                className="input"
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
              >
                <option value="real_estate">🏢 Immobilier</option>
                <option value="fleet">🚗 Parc Auto</option>
              </select>
            </div>
            <div>
              <label className="form-label">Couleur</label>
              <select
                className="input"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              >
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowAdd(false); setNewName(''); }}>Annuler</button>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!newName.trim()}>Créer</button>
          </div>
        </div>
      )}

      {/* Sector tabs */}
      <div className="flex gap-2 mb-3 text-xs font-mono">
        <span className="tag tag-grey">
          {data.sector === 'real_estate' ? '🏢 Immobilier' : '🚗 Parc Auto'} ({sectorCats.length})
        </span>
        <span style={{ color: 'var(--text3)' }}>
          (Affichage du secteur actif. Pour voir l'autre, basculez via l'onglet Secteur.)
        </span>
      </div>

      {/* Categories list */}
      {sectorCats.length === 0 ? (
        <div className="empty">
          <div className="text-3xl mb-2">🏷️</div>
          <div>Aucune catégorie pour ce secteur</div>
        </div>
      ) : (
        <div className="space-y-2">
          {sectorCats.map((cat) => {
            const used = data.expenses.filter((e) => e.category === cat.name).length;
            const isEditing = editingId === cat.id;
            return (
              <div
                key={cat.id}
                className="p-3 rounded-lg"
                style={{
                  background: isEditing ? 'rgba(79,124,255,0.06)' : 'var(--bg3)',
                  border: '1px solid var(--border)',
                }}
              >
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div className="md:col-span-2">
                      <input
                        className="input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <select className="input" value={editSector} onChange={(e) => setEditSector(e.target.value)}>
                      <option value="real_estate">🏢 Immobilier</option>
                      <option value="fleet">🚗 Parc Auto</option>
                    </select>
                    <div className="flex gap-1">
                      <select className="input" value={editColor} onChange={(e) => setEditColor(e.target.value)}>
                        {colors.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                      </select>
                    </div>
                    <div className="md:col-span-4 flex justify-end gap-1">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Annuler</button>
                      <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={!editName.trim()}>Enregistrer</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`tag tag-${cat.color}`}>{cat.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text3)' }}>
                        {used} dépense{used !== 1 ? 's' : ''} · {cat.sector === 'real_estate' ? 'Immobilier' : 'Parc Auto'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(cat)}>✎</button>
                      {userIsAdmin && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat)} style={{ color: 'var(--red)' }}>🗑</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// SYSTEM TAB
// ──────────────────────────────────────────────
function SystemTab({ data, reset, userIsAdmin }) {
  return (
    <>
      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-3">📊 Statistiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--accent)' }}>
              {data.assets.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>Actifs</div>
          </div>
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--gold)' }}>
              {(data.reservations || []).length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>Réservations</div>
          </div>
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--green)' }}>
              {data.parties.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>Tiers</div>
          </div>
          <div className="text-center p-3 rounded" style={{ background: 'var(--bg3)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--purple)' }}>
              {data.invoices.length}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>Factures</div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h3 className="font-display font-semibold text-base mb-3">👤 Utilisateur connecté</h3>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
            style={{ background: 'var(--accent)' }}
          >
            {data.user?.initials}
          </div>
          <div>
            <div className="font-semibold">{data.user?.name}</div>
            <div className="text-xs" style={{ color: 'var(--text2)' }}>{data.user?.email}</div>
            <span className="tag tag-purple mt-1 inline-block">
              {data.user?.role === 'super_admin' ? 'Super Administrateur' : data.user?.role}
            </span>
          </div>
        </div>
      </div>

      {userIsAdmin && (
        <div className="card" style={{ borderColor: 'rgba(255,91,91,0.3)' }}>
          <h3 className="font-display font-semibold text-base mb-2" style={{ color: 'var(--red)' }}>
            ⚠️ Zone dangereuse
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
            Réinitialise toutes les données et redirige vers l'écran de connexion.
            Cette action est irréversible.
          </p>
          <button className="btn btn-danger" onClick={reset}>
            ↻ Réinitialiser la démo
          </button>
        </div>
      )}
    </>
  );
}

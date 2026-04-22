import React, { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { PLANS, TRIAL_DAYS, fmt, fileToBase64 } from '../utils/helpers.js';

export default function SignupPage({ onBack }) {
  const { updateData, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    plan: '',
    logo: null,
  });

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast('Logo trop volumineux (max 1 Mo)', 'error');
      return;
    }
    const base64 = await fileToBase64(file);
    setForm({ ...form, logo: base64 });
  };

  const handleSubmit = () => {
    const plan = PLANS[form.plan];
    if (!plan) return;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    const initials = form.fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    updateData((d) => ({
      ...d,
      tenant: {
        name: form.companyName,
        plan: plan.id,
        sectors: plan.sectors,
        trialEndsAt: trialEnd.toISOString(),
        createdAt: new Date().toISOString(),
        logo: form.logo,
        subscribed: false,
      },
      sector: plan.sectors[0],
      user: {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        role: 'super_admin',
        initials,
      },
    }));
    showToast(`Bienvenue ! ${TRIAL_DAYS} jours d'essai gratuits activés 🎉`);
  };

  const canNext1 = form.companyName && form.fullName && form.email && form.password.length >= 4;
  const canNext2 = !!form.plan;

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg"
            style={{ background: 'var(--accent)' }}
          >
            LP
          </div>
          <div className="font-display font-bold text-3xl">
            Loca<span style={{ color: 'var(--accent)' }}>Pro</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition`}
                style={{
                  background: step >= s ? 'var(--accent)' : 'var(--surface)',
                  color: step >= s ? 'white' : 'var(--text3)',
                }}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className="h-0.5 w-12 transition"
                  style={{ background: step > s ? 'var(--accent)' : 'var(--border)' }}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="card" style={{ padding: '36px' }}>
          {/* STEP 1: Account info */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h1 className="font-display font-bold text-2xl mb-1">Créer votre compte</h1>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  Étape 1 sur 3 — Informations entreprise
                </p>
              </div>
              <div className="form-grid form-grid-2">
                <div>
                  <label className="form-label">Nom de l'entreprise *</label>
                  <input
                    className="input"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Ma Société SARL"
                  />
                </div>
                <div>
                  <label className="form-label">Votre nom complet *</label>
                  <input
                    className="input"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Jean Mavoungou"
                  />
                </div>
              </div>
              <div className="form-grid form-grid-2 mt-3">
                <div>
                  <label className="form-label">Email professionnel *</label>
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@entreprise.cg"
                  />
                </div>
                <div>
                  <label className="form-label">Téléphone (WhatsApp)</label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+242 06 000 00 00"
                  />
                </div>
              </div>
              <div className="form-row mt-3">
                <label className="form-label">Mot de passe * (min. 4 caractères)</label>
                <input
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-between mt-6">
                <button className="btn btn-ghost" onClick={onBack}>
                  ← Déjà un compte
                </button>
                <button className="btn btn-primary" onClick={next} disabled={!canNext1}>
                  Continuer →
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Plan selection */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h1 className="font-display font-bold text-2xl mb-1">Choisir votre formule</h1>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  Étape 2 sur 3 — Sélectionnez votre domaine d'activité ·{' '}
                  <span style={{ color: 'var(--green)' }}>
                    {TRIAL_DAYS} jours d'essai gratuit
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.values(PLANS).map((plan) => {
                  const selected = form.plan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setForm({ ...form, plan: plan.id })}
                      className="card cursor-pointer transition relative"
                      style={{
                        borderColor: selected ? 'var(--accent)' : 'var(--border)',
                        background: selected
                          ? 'rgba(79,124,255,0.08)'
                          : 'var(--surface)',
                      }}
                    >
                      {plan.badge && (
                        <div
                          className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider"
                          style={{
                            background: 'var(--gold)',
                            color: '#1a1a1a',
                            fontWeight: 700,
                          }}
                        >
                          {plan.badge}
                        </div>
                      )}
                      <div className="text-3xl mb-2">{plan.icon}</div>
                      <div className="font-display font-bold text-lg">{plan.label}</div>
                      <div
                        className="text-xs mb-3 mt-1"
                        style={{ color: 'var(--text2)', minHeight: '32px' }}
                      >
                        {plan.description}
                      </div>
                      <div
                        className="font-display font-bold text-2xl"
                        style={{ color: 'var(--accent)' }}
                      >
                        {fmt(plan.price)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text3)' }}>
                        / mois après essai
                      </div>
                      {plan.save && (
                        <div className="text-xs mt-2" style={{ color: 'var(--green)' }}>
                          💰 {plan.save}
                        </div>
                      )}
                      {selected && (
                        <div
                          className="mt-3 text-xs font-mono"
                          style={{ color: 'var(--accent)' }}
                        >
                          ● SÉLECTIONNÉ
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                className="card mt-4"
                style={{ background: 'var(--bg3)', borderColor: 'rgba(34,201,122,0.3)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎁</div>
                  <div className="text-sm">
                    <strong style={{ color: 'var(--green)' }}>
                      Période d'essai gratuite de {TRIAL_DAYS} jours
                    </strong>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                      Aucune carte bancaire requise. Annulez à tout moment.
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button className="btn btn-ghost" onClick={prev}>
                  ← Retour
                </button>
                <button className="btn btn-primary" onClick={next} disabled={!canNext2}>
                  Continuer →
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Logo + confirm */}
          {step === 3 && (
            <>
              <div className="mb-6">
                <h1 className="font-display font-bold text-2xl mb-1">Personnalisation</h1>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>
                  Étape 3 sur 3 — Ajoutez votre logo (optionnel)
                </p>
              </div>

              <div className="text-center mb-5">
                {form.logo ? (
                  <div>
                    <img
                      src={form.logo}
                      alt="Logo"
                      className="w-24 h-24 mx-auto rounded-xl object-contain"
                      style={{ background: 'white', padding: '8px' }}
                    />
                    <button
                      className="btn btn-ghost btn-sm mt-3"
                      onClick={() => setForm({ ...form, logo: null })}
                    >
                      Retirer le logo
                    </button>
                  </div>
                ) : (
                  <label
                    className="block cursor-pointer mx-auto rounded-xl p-8"
                    style={{
                      background: 'var(--bg3)',
                      border: '2px dashed var(--border2)',
                      maxWidth: '300px',
                    }}
                  >
                    <div className="text-4xl mb-2">📤</div>
                    <div className="text-sm font-medium">Importer votre logo</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                      PNG, JPG ou SVG · max 1 Mo
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogo}
                    />
                  </label>
                )}
              </div>

              {/* Recap */}
              <div
                className="card"
                style={{ background: 'var(--bg3)', borderColor: 'rgba(79,124,255,0.3)' }}
              >
                <div
                  className="text-xs font-mono uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text3)' }}
                >
                  Récapitulatif
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text2)' }}>Entreprise</span>
                    <span className="font-medium">{form.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text2)' }}>Compte admin</span>
                    <span className="font-medium">{form.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text2)' }}>Formule</span>
                    <span className="font-medium">
                      {PLANS[form.plan]?.icon} {PLANS[form.plan]?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text2)' }}>Tarif après essai</span>
                    <span className="font-medium" style={{ color: 'var(--accent)' }}>
                      {fmt(PLANS[form.plan]?.price || 0)} / mois
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-2 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span style={{ color: 'var(--text2)' }}>Période d'essai</span>
                    <span className="font-medium" style={{ color: 'var(--green)' }}>
                      {TRIAL_DAYS} jours gratuits
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button className="btn btn-ghost" onClick={prev}>
                  ← Retour
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  🚀 Démarrer mon essai gratuit
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-xs font-mono" style={{ color: 'var(--text3)' }}>
          LocaPro v1.0 · Plateforme SaaS de gestion locative
        </div>
      </div>
    </div>
  );
}

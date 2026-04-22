import React, { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';
import { TRIAL_DAYS } from '../utils/helpers.js';
import { initialData } from '../data/initialData.js';

export default function LoginPage({ onSignup }) {
  const { data, updateData, showToast } = useStore();
  const [email, setEmail] = useState(data.tenant ? data.user?.email || '' : '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Demo shortcut
      if (email === 'demo@locapro.com' && password === 'demo') {
        // Quick demo: load full preset data + set tenant
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
        updateData(() => ({
          ...initialData,
          tenant: {
            name: 'LocaPro Démo',
            plan: 'duo',
            sectors: ['real_estate', 'fleet'],
            trialEndsAt: trialEnd.toISOString(),
            createdAt: new Date().toISOString(),
            logo: null,
            subscribed: false,
          },
          sector: 'real_estate',
          user: {
            name: 'Marc Robert',
            email: 'demo@locapro.com',
            phone: '+242 06 000 00 00',
            role: 'super_admin',
            initials: 'MR',
          },
        }));
        showToast('Bienvenue en mode démo 👋');
      }
      // Existing tenant login
      else if (data.tenant && data.user && email === data.user.email && password.length >= 4) {
        updateData((d) => ({ ...d, user: { ...d.user, email } }));
        showToast(`Bon retour ${data.user.name} 👋`);
      } else {
        showToast('Identifiants incorrects ou compte inexistant', 'error');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
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

        <div className="card" style={{ padding: '36px' }}>
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-2xl mb-2">Connexion</h1>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>
              Accédez à votre espace de gestion locative
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-row">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.cg"
                required
              />
            </div>
            <div className="form-row">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full justify-center mt-2"
              disabled={loading}
              style={{ padding: '12px' }}
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <div
            className="mt-6 pt-6 border-t text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="text-sm" style={{ color: 'var(--text2)' }}>
              Pas encore de compte ?
            </div>
            <button
              className="btn btn-ghost mt-2 w-full justify-center"
              onClick={onSignup}
              type="button"
            >
              ✨ Créer mon compte — {TRIAL_DAYS} jours gratuits
            </button>
          </div>

          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Compte démo
            </div>
            <div className="text-sm" style={{ color: 'var(--text2)' }}>
              <div>📧 demo@locapro.com</div>
              <div>🔑 demo</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs font-mono" style={{ color: 'var(--text3)' }}>
          LocaPro v1.0 — Plateforme SaaS multi-sectorielle
        </div>
      </div>
    </div>
  );
}

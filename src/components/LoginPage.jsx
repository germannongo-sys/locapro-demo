import React, { useState } from 'react';
import { useStore } from '../store/StoreContext.jsx';

export default function LoginPage() {
  const { updateData, showToast } = useStore();
  const [email, setEmail] = useState('admin@locapro.com');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (
        (email === 'admin@locapro.com' && password === 'demo') ||
        (email === 'demo' && password === 'demo')
      ) {
        updateData((d) => ({
          ...d,
          user: { name: 'Marc Robert', email, role: 'super_admin', initials: 'MR' },
        }));
        showToast('Bienvenue dans LocaPro 👋');
      } else {
        showToast('Identifiants incorrects', 'error');
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
                placeholder="vous@entreprise.com"
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

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div
              className="text-xs font-mono uppercase tracking-wider mb-2"
              style={{ color: 'var(--text3)' }}
            >
              Compte démo
            </div>
            <div className="text-sm" style={{ color: 'var(--text2)' }}>
              <div>📧 admin@locapro.com</div>
              <div>🔑 demo</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs font-mono" style={{ color: 'var(--text3)' }}>
          LocaPro v1.0 — Démo interactive
        </div>
      </div>
    </div>
  );
}

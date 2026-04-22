# LocaPro — Démo Frontend

Plateforme de gestion locative modulaire et multi-sectorielle (Immobilier ↔ Parc Auto).

## 🚀 Stack technique production

- **Vite 5** — bundler & dev server ultra rapide
- **React 18** — UI library
- **Tailwind CSS 3.4** — installé en tant que plugin PostCSS (pas de CDN)
- **PostCSS + Autoprefixer** — compatibilité navigateurs
- **Chart.js 4** — graphiques du dashboard

## 📦 Installation

Prérequis : **Node.js ≥ 18** et **npm** (ou pnpm / yarn).

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

L'application s'ouvre automatiquement sur **http://localhost:5173**.

## 🔑 Compte de démonstration

| Champ | Valeur |
|-------|--------|
| Email | `admin@locapro.com` |
| Mot de passe | `demo` |

## 📜 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre Vite en mode développement avec hot-reload |
| `npm run build` | Build de production optimisé dans `dist/` |
| `npm run preview` | Prévisualise le build de production en local |

## 🏗️ Structure du projet

```
locapro-demo/
├── index.html              # Point d'entrée HTML
├── package.json            # Dépendances et scripts
├── vite.config.js          # Configuration Vite
├── tailwind.config.js      # Configuration Tailwind (theme étendu)
├── postcss.config.js       # PostCSS avec plugins tailwindcss + autoprefixer
└── src/
    ├── main.jsx            # Bootstrap React
    ├── App.jsx             # Routeur principal
    ├── index.css           # Tailwind directives + thème global
    ├── store/
    │   └── StoreContext.jsx    # State global + persistence localStorage
    ├── data/
    │   ├── sectorConfig.js     # Mapping immobilier ↔ parc auto
    │   └── initialData.js      # Données mock
    ├── utils/
    │   └── helpers.js          # Formatters et constantes
    └── components/
        ├── LoginPage.jsx
        ├── Sidebar.jsx
        ├── Topbar.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── AssetsPage.jsx
            ├── ContractsPage.jsx
            ├── InvoicesPage.jsx
            ├── ExpensesPage.jsx
            ├── PartiesPage.jsx
            ├── OwnersPage.jsx
            ├── TicketsPage.jsx
            └── SettingsPage.jsx
```

## ✨ Fonctionnalités

- 🔐 **Authentification** avec persistence de session
- 📊 **Dashboard** avec KPIs et graphiques (Chart.js)
- 🏢/🚗 **Mode dual sectoriel** — switch immobilier ↔ parc auto en un clic
- 📋 **Gestion des actifs** — CRUD complet, champs adaptés au secteur
- 🧾 **Devis & factures** — calcul auto, conversion devis→facture, aperçu PDF
- 💰 **Charges** — catégorisation, suivi par actif
- 👥 **Tiers** — clients, propriétaires, partenaires
- 🏠 **Espace propriétaires** — revenus, charges, rentabilité
- 🎧 **Support tickets** — système de messagerie thread
- ⚙️ **Paramètres** — switch secteur, reset démo
- 💾 **Persistence** automatique via localStorage

## 🎨 Configuration Tailwind

Le fichier `tailwind.config.js` étend le thème par défaut avec :
- Les couleurs personnalisées de la marque (via CSS variables)
- Les fonts custom (Syne, DM Sans, JetBrains Mono)
- Les composants et utilitaires standards de Tailwind

Tailwind est compilé via PostCSS au build, **aucun CDN n'est utilisé** — résolvant le warning de production.

## 🌍 Build et déploiement

```bash
npm run build
```

Le dossier `dist/` peut être déployé sur n'importe quel hébergeur statique :
- Vercel, Netlify, Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages, Firebase Hosting
- Serveur Nginx classique

## 📝 Licence

Projet de démonstration LocaPro v1.0 — Usage libre pour démonstration et adaptation.

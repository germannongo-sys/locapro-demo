# LocaPro — Plateforme de gestion locative SaaS

Plateforme **modulaire et multi-sectorielle** pour la gestion locative immobilière et la gestion de parc automobile, avec un seul socle technique commun.

> 🎯 **2 marchés cibles · 1 application · Mode Duo possible**

## 🚀 Stack technique production

- **Vite 5** — bundler & dev server ultra rapide
- **React 18** — UI library
- **Tailwind CSS 3.4** — installé en plugin PostCSS (aucun CDN)
- **PostCSS + Autoprefixer**
- **Chart.js 4** — graphiques du dashboard

## 📦 Installation

Prérequis : **Node.js ≥ 18** et **npm**

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

L'application s'ouvre automatiquement sur **http://localhost:5173**.

## 🔑 Démarrage rapide

### Option A — Compte démo (rapide)

| Champ | Valeur |
|-------|--------|
| Email | `demo@locapro.com` |
| Mot de passe | `demo` |

→ Connexion immédiate avec le jeu de données préchargé (Pointe-Noire, FCFA).

### Option B — Inscription complète (parcours réel)

1. Cliquez sur **"Créer mon compte — 15 jours gratuits"**
2. Choisissez votre formule : **Immobilier**, **Parc Auto** ou **Duo**
3. Renseignez vos infos d'entreprise + logo
4. Validez → **15 jours d'essai gratuit** activés

## ✨ Fonctionnalités complètes

### 🔐 Authentification & SaaS
- Tunnel d'inscription en 4 étapes (formule, organisation, identifiants, récap)
- **3 formules** : Immobilier seul (25 000 F), Parc Auto seul (25 000 F), Duo (40 000 F)
- **Période d'essai gratuite de 15 jours** avec compte à rebours et bandeau d'alerte
- Login avec mot de passe (4+ caractères en démo)

### 🎨 Personnalisation & Identité
- **Upload logo entreprise** (PNG/JPG/SVG, max 1 Mo) — affiché dans la sidebar
- **Nom d'entreprise personnalisable** — visible partout dans l'app
- Aperçu live de l'identité visuelle avant enregistrement

### 📊 Dashboard intelligent
- **Bandeau d'alertes** en haut (réservations finissant demain, essai expirant)
- 4 KPIs : revenus encaissés, taux d'occupation, encours impayés, charges
- Graphique barres revenus/charges (Chart.js)
- Donut statut des actifs
- **Section "Réservations en cours"** avec colonne "Fin dans" colorée selon urgence
- Top 5 actifs par revenus

### 🏢/🚗 Gestion des actifs (CRUD complet)
- Champs adaptés au secteur : type/surface/pièces (immo) OU marque/modèle/immat/km (auto)
- **Upload jusqu'à 10 photos par bien** depuis le PC (JPG/PNG, max 2 Mo/image)
- Galerie photo avec navigation dans la fiche détail
- **Propriétaire OBLIGATOIRE** lors de la création (validation rouge si vide)
- Filtres : recherche, statut, secteur
- Suppression réservée aux administrateurs

### 📅 Module Réservations (NOUVEAU)
- Tableau complet des réservations
- Création avec calcul automatique du total selon dates et tarif journalier
- **Saisie d'acomptes** avec mise à jour du restant à payer
- **Conversion en facture** en un clic
- **Envoi par WhatsApp** (lien `wa.me`) ou **par e-mail** (`mailto:`) avec message pré-rempli
- **Auto-update du statut "Occupé"** dès activation de la réservation (basé sur les dates)
- **Alerte 1 jour avant la fin de contrat** (notifications + bandeau dashboard)
- 5 statuts : En attente, Confirmée, En cours, Terminée, Annulée

### 🧾 Facturation
- KPIs encaissé / en attente
- Marquer comme payé en 1 clic
- **Aperçu PDF stylisé** de la facture (avec logo entreprise)
- 6 statuts : Brouillon, Émise, Payée, Acompte, Impayée, Annulée
- **Suppression réservée aux administrateurs**
- Recherche par numéro ou client

### 💰 Charges & Catégories
- Catégories adaptées au secteur (entretien/syndic vs carburant/contrôle technique)
- **CRUD des catégories** dans Paramètres (créer, éditer, supprimer)
- Stats par catégorie
- Affectation à un actif précis

### 👥 Tiers (Clients, Propriétaires, Partenaires)
- Cartes avec badge type
- **Validation obligatoire** des propriétaires avant qu'ils puissent être assignés à un actif
- Recherche rapide

### 🏠 Espace Propriétaires
- Vue revenus + charges + rentabilité par propriétaire
- Liste des actifs rattachés avec statuts

### 🎧 Support & Tickets
- Tickets avec priorité et statut
- Système de messagerie thread
- Assignation à un agent

### 📜 Journal d'audit (admin uniquement)
- Traçabilité complète : qui a fait quoi, quand, sur quelle entité
- 21 types d'actions tracés : créations, modifications, suppressions
- Filtres par utilisateur, action, recherche libre
- 200 dernières actions conservées

### ⚙️ Paramètres (5 onglets)
- 🏢 **Organisation** — nom + logo
- 💳 **Abonnement** — gestion formule + statut essai
- 🎛️ **Secteur** — switch immo/auto (verrouillé selon formule)
- 🏷️ **Catégories de charges** — CRUD complet par secteur
- ⚙️ **Système** — stats + reset démo

### 🔍 Recherche globale
- Bouton "Rechercher" dans le topbar (ou raccourci **Ctrl+K**)
- Cherche dans : actifs, tiers, réservations, factures, contrats
- Navigation directe vers le résultat

### 🔔 Système d'alertes
- Cloche dans le topbar avec badge compteur
- Panneau déroulant avec liste des alertes actives
- Types : essai expirant, fin de contrat dans 1 jour ou aujourd'hui

## 🛡️ Sécurité & Permissions

| Action | Super Admin | Admin | Manager | Comptable | Viewer |
|--------|:-:|:-:|:-:|:-:|:-:|
| Créer/modifier actifs | ✓ | ✓ | ✓ | — | — |
| Supprimer actifs/factures | ✓ | ✓ | — | — | — |
| Valider propriétaires | ✓ | ✓ | — | — | — |
| Gérer catégories charges | ✓ | ✓ | ✓ (créer/éditer) | — | — |
| Modifier identité visuelle | ✓ | ✓ | — | — | — |
| Activer abonnement | ✓ | ✓ | — | — | — |
| Voir journal d'audit | ✓ | ✓ | — | — | — |

## 📜 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre Vite en mode développement avec hot-reload |
| `npm run build` | Build de production optimisé dans `dist/` |
| `npm run preview` | Prévisualise le build de production en local |

## 🏗️ Architecture du projet

```
locapro-demo/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js          # Theme étendu avec CSS variables
├── postcss.config.js           # Tailwind + Autoprefixer
└── src/
    ├── main.jsx                # Bootstrap React
    ├── App.jsx                 # Routeur principal + flow auth
    ├── index.css               # Tailwind directives + thème global
    ├── store/
    │   └── StoreContext.jsx    # State global + localStorage + alerts + auto-status
    ├── data/
    │   ├── sectorConfig.js     # Mapping immobilier ↔ parc auto
    │   └── initialData.js      # Données mock (Pointe-Noire, FCFA)
    ├── utils/
    │   └── helpers.js          # Formatters, PLANS, can(), buildWhatsAppLink, etc.
    └── components/
        ├── LoginPage.jsx
        ├── SignupPage.jsx      # Tunnel d'inscription en 4 étapes
        ├── Sidebar.jsx         # Avec section Admin
        ├── Topbar.jsx          # Search + Alerts + Sector toggle
        ├── AlertsPanel.jsx     # Notifications dropdown
        ├── GlobalSearch.jsx    # Recherche transverse Ctrl+K
        └── pages/
            ├── Dashboard.jsx
            ├── AssetsPage.jsx
            ├── ReservationsPage.jsx
            ├── ContractsPage.jsx
            ├── InvoicesPage.jsx
            ├── ExpensesPage.jsx
            ├── PartiesPage.jsx
            ├── OwnersPage.jsx
            ├── TicketsPage.jsx
            ├── AuditLogPage.jsx
            └── SettingsPage.jsx
```

## 💾 Persistance

Toutes les données sont sauvegardées en **localStorage** sous la clé `locapro_data_v2`.
Pour réinitialiser : Paramètres → Système → Réinitialiser la démo.

## 🌍 Build et déploiement

```bash
npm run build
```

Le dossier `dist/` est déployable sur n'importe quel hébergeur statique :
**Vercel · Netlify · Cloudflare Pages · AWS S3 · GitHub Pages · Nginx**

## 📝 Licence

Projet de démonstration LocaPro v1.0 — Usage libre pour démonstration et adaptation commerciale.

---

> 💡 **Astuce :** Pour explorer toutes les fonctionnalités rapidement, utilisez le compte démo. Pour tester le parcours d'inscription, cliquez sur "Créer mon compte" depuis l'écran de connexion.

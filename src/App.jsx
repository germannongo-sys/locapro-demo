import React, { useState, useEffect } from 'react';
import { useStore } from './store/StoreContext.jsx';
import { sectorConfig } from './data/sectorConfig.js';
import { isAdmin } from './utils/helpers.js';

import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/SignupPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';

import Dashboard from './components/pages/Dashboard.jsx';
import AssetsPage from './components/pages/AssetsPage.jsx';
import ReservationsPage from './components/pages/ReservationsPage.jsx';
import ContractsPage from './components/pages/ContractsPage.jsx';
import InvoicesPage from './components/pages/InvoicesPage.jsx';
import ExpensesPage from './components/pages/ExpensesPage.jsx';
import PartiesPage from './components/pages/PartiesPage.jsx';
import OwnersPage from './components/pages/OwnersPage.jsx';
import TicketsPage from './components/pages/TicketsPage.jsx';
import AuditLogPage from './components/pages/AuditLogPage.jsx';
import SettingsPage from './components/pages/SettingsPage.jsx';

export default function App() {
  const { data } = useStore();
  const [page, setPage] = useState('dashboard');
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Keyboard shortcut: Ctrl+K for search is handled in Topbar via state
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // The search modal is opened in Topbar; we trigger via custom event
        window.dispatchEvent(new CustomEvent('locapro:open-search'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Not logged in: show signup or login flow
  if (!data.user) {
    if (authMode === 'signup') {
      return <SignupPage onBack={() => setAuthMode('login')} />;
    }
    return <LoginPage onSignup={() => setAuthMode('signup')} />;
  }

  // ── Sector validation: if current sector not allowed by tenant plan, fall back
  const allowedSectors = data.tenant?.sectors || ['real_estate'];
  if (!allowedSectors.includes(data.sector)) {
    // This should be auto-corrected; just render dashboard with sector reset
  }

  const titles = {
    dashboard: 'Tableau de bord',
    assets: sectorConfig[data.sector].asset.plural,
    reservations: 'Réservations',
    contracts: 'Devis & Contrats',
    invoices: 'Factures',
    expenses: 'Charges & Dépenses',
    parties: 'Tiers',
    owners: 'Propriétaires',
    tickets: 'Support & Tickets',
    audit: 'Journal d\'audit',
    settings: 'Paramètres',
  };

  // Restrict admin pages
  const adminOnlyPages = ['audit'];
  if (adminOnlyPages.includes(page) && !isAdmin(data.user)) {
    setPage('dashboard');
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={setPage} />;
      case 'assets':
        return <AssetsPage />;
      case 'reservations':
        return <ReservationsPage />;
      case 'contracts':
        return <ContractsPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'parties':
        return <PartiesPage />;
      case 'owners':
        return <OwnersPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'audit':
        return <AuditLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        current={page}
        onChange={setPage}
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />
      <main className="flex-1 min-w-0">
        <Topbar
          title={titles[page] || 'LocaPro'}
          onMenuClick={() => setMobileSidebar(true)}
          onNavigate={setPage}
        />
        {renderPage()}
      </main>
    </div>
  );
}

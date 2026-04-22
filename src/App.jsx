import React, { useState } from 'react';
import { useStore } from './store/StoreContext.jsx';
import { sectorConfig } from './data/sectorConfig.js';
import LoginPage from './components/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import AssetsPage from './components/pages/AssetsPage.jsx';
import ContractsPage from './components/pages/ContractsPage.jsx';
import InvoicesPage from './components/pages/InvoicesPage.jsx';
import ExpensesPage from './components/pages/ExpensesPage.jsx';
import PartiesPage from './components/pages/PartiesPage.jsx';
import OwnersPage from './components/pages/OwnersPage.jsx';
import TicketsPage from './components/pages/TicketsPage.jsx';
import SettingsPage from './components/pages/SettingsPage.jsx';

export default function App() {
  const { data, updateData } = useStore();
  const [page, setPage] = useState('dashboard');
  const [mobileSidebar, setMobileSidebar] = useState(false);

  if (!data.user) return <LoginPage />;

  const titles = {
    dashboard: 'Tableau de bord',
    assets: sectorConfig[data.sector].asset.plural,
    contracts: 'Devis & Contrats',
    invoices: 'Factures',
    expenses: 'Charges & Dépenses',
    parties: 'Tiers',
    owners: 'Propriétaires',
    tickets: 'Support & Tickets',
    settings: 'Paramètres',
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'assets':
        return <AssetsPage />;
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
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
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
          title={titles[page]}
          onLogout={() => updateData((d) => ({ ...d, user: null }))}
          onMenuClick={() => setMobileSidebar(true)}
        />
        {renderPage()}
      </main>
    </div>
  );
}

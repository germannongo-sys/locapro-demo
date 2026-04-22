import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialData } from '../data/initialData.js';
import { sectorConfig } from '../data/sectorConfig.js';
import { uid, daysFromToday, PLANS } from '../utils/helpers.js';

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('locapro_data_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialData;
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('locapro_data_v2', JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Update wrapper that also adds audit log entries when actionLog passed
  const updateData = (updater, log = null) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (log && next.user) {
        next.auditLog = [
          {
            id: uid(),
            timestamp: new Date().toISOString(),
            user: next.user.name,
            action: log.action,
            target: log.target,
            details: log.details || '',
          },
          ...(next.auditLog || []),
        ].slice(0, 200); // keep only last 200 entries
      }
      return next;
    });
  };

  const cfg = sectorConfig[data.sector];

  const reset = () => {
    if (window.confirm('Réinitialiser toutes les données et déconnecter ?')) {
      setData(initialData);
      showToast('Données réinitialisées');
    }
  };

  // ── Trial / subscription status
  const trialStatus = useMemo(() => {
    if (!data.tenant?.trialEndsAt) return null;
    const end = new Date(data.tenant.trialEndsAt);
    const now = new Date();
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return {
      daysLeft,
      expired: daysLeft <= 0,
      ending: daysLeft > 0 && daysLeft <= 3,
    };
  }, [data.tenant]);

  // ── Active alerts (contracts ending soon, trial expiring)
  const alerts = useMemo(() => {
    const list = [];
    // Trial expiring
    if (trialStatus?.ending) {
      list.push({
        id: 'trial',
        type: 'warning',
        title: `Période d'essai : ${trialStatus.daysLeft} jour(s) restant(s)`,
        message: `Votre essai gratuit se termine bientôt. Activez votre abonnement pour continuer.`,
      });
    }
    if (trialStatus?.expired) {
      list.push({
        id: 'trial-expired',
        type: 'error',
        title: 'Période d\'essai expirée',
        message: `Veuillez activer votre abonnement.`,
      });
    }
    // Reservations ending in 1 day
    (data.reservations || []).forEach((r) => {
      if (r.status === 'active') {
        const days = daysFromToday(r.endDate);
        if (days === 1) {
          const asset = data.assets.find((a) => a.id === r.assetId);
          const party = data.parties.find((p) => p.id === r.partyId);
          list.push({
            id: `res-${r.id}`,
            type: 'warning',
            title: `Fin de location demain — ${asset?.name || ''}`,
            message: `${party?.fullName || 'Client'} libère ${asset?.refCode || ''} demain. Anticipez la prolongation ou la libération.`,
            reservationId: r.id,
          });
        } else if (days === 0) {
          const asset = data.assets.find((a) => a.id === r.assetId);
          list.push({
            id: `res-today-${r.id}`,
            type: 'error',
            title: `Fin de location aujourd'hui — ${asset?.name || ''}`,
            message: `Réservation ${r.number} se termine aujourd'hui.`,
            reservationId: r.id,
          });
        }
      }
    });
    return list;
  }, [data.reservations, data.assets, data.parties, trialStatus]);

  // ── Auto-update reservation status & asset status based on dates (every load)
  useEffect(() => {
    if (!data.reservations) return;
    let needsUpdate = false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const updatedReservations = data.reservations.map((r) => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      let newStatus = r.status;
      if (r.status === 'confirmed' || r.status === 'pending') {
        if (now >= start && now <= end) {
          newStatus = 'active';
          needsUpdate = true;
        }
      } else if (r.status === 'active' && now > end) {
        newStatus = 'ended';
        needsUpdate = true;
      }
      return newStatus !== r.status ? { ...r, status: newStatus } : r;
    });

    // Sync asset status from active reservations
    const activeAssetIds = new Set(updatedReservations.filter((r) => r.status === 'active').map((r) => r.assetId));
    const updatedAssets = data.assets.map((a) => {
      if (a.status === 'maintenance' || a.status === 'archived') return a;
      const shouldBeRented = activeAssetIds.has(a.id);
      const newStatus = shouldBeRented ? 'rented' : 'available';
      if (newStatus !== a.status) {
        needsUpdate = true;
        return { ...a, status: newStatus };
      }
      return a;
    });

    if (needsUpdate) {
      setData((d) => ({ ...d, reservations: updatedReservations, assets: updatedAssets }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Logout (preserves tenant data, clears user only)
  const logout = () => {
    setData((d) => ({ ...d, user: null }));
  };

  return (
    <StoreCtx.Provider
      value={{
        data,
        updateData,
        cfg,
        showToast,
        reset,
        logout,
        trialStatus,
        alerts,
      }}
    >
      {children}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          {toast.message}
        </div>
      )}
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);

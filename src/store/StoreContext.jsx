import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialData } from '../data/initialData.js';
import { sectorConfig } from '../data/sectorConfig.js';

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('locapro_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialData;
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('locapro_data', JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateData = (updater) =>
    setData((prev) => (typeof updater === 'function' ? updater(prev) : updater));

  const cfg = sectorConfig[data.sector];

  const reset = () => {
    if (window.confirm('Réinitialiser toutes les données de démonstration ?')) {
      setData(initialData);
      showToast('Données réinitialisées');
    }
  };

  return (
    <StoreCtx.Provider value={{ data, updateData, cfg, showToast, reset }}>
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

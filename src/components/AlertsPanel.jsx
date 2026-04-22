import React from 'react';
import { useStore } from '../store/StoreContext.jsx';

export default function AlertsPanel({ onClose, onNavigate }) {
  const { alerts } = useStore();

  return (
    <div
      className="fixed top-16 right-6 z-40 w-96 max-w-[calc(100vw-3rem)]"
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.2s',
      }}
    >
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="font-display font-bold text-base">🔔 Alertes ({alerts.length})</div>
        <button onClick={onClose} className="text-lg" style={{ color: 'var(--text3)' }}>
          ×
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="empty text-sm">
            <div className="text-3xl mb-2">✓</div>
            Aucune alerte active
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 border-b cursor-pointer transition"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => alert.reservationId && onNavigate('reservations')}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background:
                      alert.type === 'error'
                        ? 'rgba(255,91,91,0.15)'
                        : 'rgba(240,180,41,0.15)',
                  }}
                >
                  {alert.type === 'error' ? '⚠️' : '⏰'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{alert.title}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                    {alert.message}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

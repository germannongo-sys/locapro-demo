// ────── CURRENCY & FORMATTING ──────
export const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0) + ' FCFA';

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export const uid = () => Math.random().toString(36).substr(2, 9);

export const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  return Math.max(0, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
};

export const daysFromToday = (date) => {
  if (!date) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

// ────── STATUS MAPS ──────
export const statusColors = {
  available: { tag: 'tag-green', label: 'Disponible' },
  rented: { tag: 'tag-blue', label: 'Occupé' },
  maintenance: { tag: 'tag-gold', label: 'Maintenance' },
  archived: { tag: 'tag-grey', label: 'Archivé' },
};

export const invoiceStatuses = {
  draft: { tag: 'tag-grey', label: 'Brouillon' },
  issued: { tag: 'tag-blue', label: 'Émise' },
  paid: { tag: 'tag-green', label: 'Payée' },
  partial: { tag: 'tag-gold', label: 'Acompte' },
  unpaid: { tag: 'tag-red', label: 'Impayée' },
  cancelled: { tag: 'tag-grey', label: 'Annulée' },
};

export const contractStatuses = {
  draft: { tag: 'tag-grey', label: 'Brouillon' },
  sent: { tag: 'tag-blue', label: 'Envoyé' },
  accepted: { tag: 'tag-green', label: 'Accepté' },
  rejected: { tag: 'tag-red', label: 'Refusé' },
  active: { tag: 'tag-green', label: 'Actif' },
  ended: { tag: 'tag-grey', label: 'Terminé' },
};

export const reservationStatuses = {
  pending: { tag: 'tag-gold', label: 'En attente' },
  confirmed: { tag: 'tag-blue', label: 'Confirmée' },
  active: { tag: 'tag-green', label: 'En cours' },
  ended: { tag: 'tag-grey', label: 'Terminée' },
  cancelled: { tag: 'tag-red', label: 'Annulée' },
};

export const ticketStatuses = {
  open: { tag: 'tag-blue', label: 'Ouvert' },
  in_progress: { tag: 'tag-gold', label: 'En cours' },
  resolved: { tag: 'tag-green', label: 'Résolu' },
  closed: { tag: 'tag-grey', label: 'Fermé' },
};

export const priorities = {
  low: { tag: 'tag-grey', label: 'Faible' },
  normal: { tag: 'tag-blue', label: 'Normale' },
  high: { tag: 'tag-gold', label: 'Haute' },
  urgent: { tag: 'tag-red', label: 'Urgente' },
};

// ────── PLANS & PRICING ──────
export const PLANS = {
  real_estate: {
    id: 'real_estate',
    label: 'Immobilier',
    icon: '🏢',
    description: 'Gestion de biens locatifs uniquement',
    price: 25000,
    sectors: ['real_estate'],
  },
  fleet: {
    id: 'fleet',
    label: 'Parc Auto',
    icon: '🚗',
    description: 'Gestion de flotte automobile uniquement',
    price: 25000,
    sectors: ['fleet'],
  },
  duo: {
    id: 'duo',
    label: 'Formule Duo',
    icon: '⭐',
    description: 'Immobilier + Parc Auto',
    price: 40000,
    sectors: ['real_estate', 'fleet'],
    badge: 'Populaire',
    save: 'Économisez 10 000 FCFA',
  },
};

export const TRIAL_DAYS = 15;

// ────── ROLES & PERMISSIONS ──────
export const can = (user, action) => {
  if (!user) return false;
  const role = user.role;
  const perms = {
    super_admin: ['*'],
    admin: ['*'],
    manager: [
      'asset.create', 'asset.update',
      'contract.create', 'contract.update',
      'invoice.create', 'invoice.update',
      'expense.create', 'expense.update', 'expense.delete',
      'party.create', 'party.update',
      'reservation.create', 'reservation.update', 'reservation.delete',
      'ticket.create', 'ticket.update',
      'category.create', 'category.update',
    ],
    accountant: [
      'invoice.create', 'invoice.update',
      'expense.create', 'expense.update', 'expense.delete',
      'reservation.update',
    ],
    viewer: [],
  };
  const list = perms[role] || [];
  return list.includes('*') || list.includes(action);
};

export const isAdmin = (user) => user && (user.role === 'super_admin' || user.role === 'admin');

// ────── COMMUNICATION ──────
export const buildWhatsAppLink = (phone, message) => {
  const cleaned = (phone || '').replace(/[^\d+]/g, '');
  return `https://wa.me/${cleaned.replace(/^\+/, '')}?text=${encodeURIComponent(message)}`;
};

export const buildMailtoLink = (email, subject, body) => {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// ────── FILES ──────
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

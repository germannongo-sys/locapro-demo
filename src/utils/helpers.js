export const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(n || 0);

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const uid = () => Math.random().toString(36).substr(2, 9);

export const statusColors = {
  available: { tag: 'tag-green', label: 'Disponible' },
  rented: { tag: 'tag-blue', label: 'Loué' },
  maintenance: { tag: 'tag-gold', label: 'Maintenance' },
  archived: { tag: 'tag-grey', label: 'Archivé' },
};

export const invoiceStatuses = {
  draft: { tag: 'tag-grey', label: 'Brouillon' },
  issued: { tag: 'tag-blue', label: 'Émise' },
  paid: { tag: 'tag-green', label: 'Payée' },
  partial: { tag: 'tag-gold', label: 'Partielle' },
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

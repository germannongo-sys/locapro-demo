export const sectorConfig = {
  real_estate: {
    label: 'Immobilier',
    icon: '🏢',
    asset: { singular: 'Bien', plural: 'Biens', icon: '🏢' },
    client: { singular: 'Locataire', plural: 'Locataires' },
    contract: { singular: 'Bail', plural: 'Baux' },
    occupancy: 'Taux d\'occupation',
    fields: [
      { key: 'type', label: 'Type', type: 'select', options: ['Appartement', 'Maison', 'Studio', 'Bureau', 'Local commercial'] },
      { key: 'address', label: 'Adresse', type: 'text', placeholder: '12 rue de la République, Paris' },
      { key: 'surface', label: 'Surface (m²)', type: 'number' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number' },
      { key: 'floor', label: 'Étage', type: 'text' },
      { key: 'amenities', label: 'Équipements', type: 'text', placeholder: 'Parking, cave, balcon...' },
    ],
    expenseCategories: ['Entretien', 'Réparations', 'Taxes foncières', 'Syndic', 'Assurance', 'Travaux', 'Autres'],
    priceUnit: '/ mois',
  },
  fleet: {
    label: 'Parc Auto',
    icon: '🚗',
    asset: { singular: 'Véhicule', plural: 'Véhicules', icon: '🚗' },
    client: { singular: 'Client', plural: 'Clients' },
    contract: { singular: 'Contrat', plural: 'Contrats' },
    occupancy: 'Taux d\'utilisation',
    fields: [
      { key: 'brand', label: 'Marque', type: 'text', placeholder: 'BMW' },
      { key: 'model', label: 'Modèle', type: 'text', placeholder: 'X3' },
      { key: 'plate', label: 'Immatriculation', type: 'text', placeholder: 'AB-123-CD' },
      { key: 'year', label: 'Année', type: 'number' },
      { key: 'mileage', label: 'Kilométrage', type: 'number' },
      { key: 'fuel', label: 'Carburant', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique'] },
      { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manuelle', 'Automatique'] },
    ],
    expenseCategories: ['Carburant', 'Entretien', 'Réparations', 'Assurance', 'Contrôle technique', 'Nettoyage', 'Autres'],
    priceUnit: '/ jour',
  }
};

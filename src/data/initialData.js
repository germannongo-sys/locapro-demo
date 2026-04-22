// Initial data for the LocaPro demo (FCFA, Pointe-Noire context)
// Default state: no user yet -> goes through signup flow

export const initialData = {
  // ── Auth & Tenant
  user: null,
  tenant: null, // Set after signup: { name, plan, sectors, trialEndsAt, createdAt, logo, sector }
  sector: 'real_estate', // current active sector (when duo, user can toggle)

  // ── Master data
  parties: [
    { id: 'p1', type: 'tenant', entityType: 'individual', fullName: 'Jean Mavoungou', email: 'j.mavoungou@email.com', phone: '+242 06 612 34 56', address: 'Avenue de Gaulle, Pointe-Noire', notes: 'Client fidèle depuis 2023', validated: true, createdAt: '2024-01-15' },
    { id: 'p2', type: 'tenant', entityType: 'company', fullName: 'TotalEnergies Congo', email: 'contact@totalenergies.cg', phone: '+242 05 555 12 00', address: 'Boulevard Charles de Gaulle, Pointe-Noire', notes: '', validated: true, createdAt: '2024-02-20' },
    { id: 'p3', type: 'tenant', entityType: 'individual', fullName: 'Marie Bouanga', email: 'm.bouanga@email.com', phone: '+242 06 987 65 43', address: 'Quartier Mpita, Pointe-Noire', notes: '', validated: true, createdAt: '2024-03-10' },
    { id: 'p4', type: 'tenant', entityType: 'individual', fullName: 'Pierre Massamba', email: 'pierre.m@email.com', phone: '+242 06 112 23 34', address: 'Loandjili, Pointe-Noire', notes: 'Préfère être contacté par WhatsApp', validated: true, createdAt: '2024-04-05' },
    { id: 'p5', type: 'owner', entityType: 'individual', fullName: 'Sophie Bernard', email: 'sophie.bernard@email.com', phone: '+242 06 555 44 33', address: 'Quartier Tié-Tié, Pointe-Noire', notes: 'Propriétaire de 3 biens', validated: true, createdAt: '2023-12-01' },
    { id: 'p6', type: 'owner', entityType: 'individual', fullName: 'Antoine Tchikaya', email: 'a.tchikaya@email.com', phone: '+242 06 777 88 99', address: 'Quartier Centre-ville, Pointe-Noire', notes: '', validated: true, createdAt: '2024-01-20' },
    { id: 'p7', type: 'partner', entityType: 'company', fullName: 'Plomberie Express CG', email: 'contact@plomberie-cg.cg', phone: '+242 05 234 56 78', address: 'Avenue Linguissi, Pointe-Noire', notes: 'Prestataire entretien', validated: true, createdAt: '2024-02-01' },
  ],

  assets: [
    { id: 'a1', refCode: 'IMMO-001', name: 'Appartement Avenue de Gaulle 4B', status: 'rented', basePrice: 50000, ownerId: 'p5', metadata: { type: 'Appartement', address: '12 Avenue de Gaulle, Pointe-Noire', surface: 65, rooms: 3, floor: '4ème', amenities: 'Parking, cave, balcon' }, photos: [], sector: 'real_estate' },
    { id: 'a2', refCode: 'IMMO-002', name: 'Studio Mpita', status: 'available', basePrice: 25000, ownerId: 'p5', metadata: { type: 'Studio', address: '8 rue de Mpita, Pointe-Noire', surface: 28, rooms: 1, floor: '2ème', amenities: 'Cuisine équipée' }, photos: [], sector: 'real_estate' },
    { id: 'a3', refCode: 'IMMO-003', name: 'Villa Côte Sauvage', status: 'rented', basePrice: 85000, ownerId: 'p6', metadata: { type: 'Maison', address: '15 rue des Jardins, Côte Sauvage', surface: 180, rooms: 5, floor: 'RDC', amenities: 'Jardin, piscine, parking' }, photos: [], sector: 'real_estate' },
    { id: 'a4', refCode: 'IMMO-004', name: 'Bureau Centre-ville', status: 'maintenance', basePrice: 65000, ownerId: 'p6', metadata: { type: 'Bureau', address: '120 Boulevard de Gaulle, Pointe-Noire', surface: 95, rooms: 4, floor: '3ème', amenities: 'Climatisation, fibre' }, photos: [], sector: 'real_estate' },
    { id: 'a5', refCode: 'AUTO-001', name: 'Toyota Hilux — Diesel', status: 'rented', basePrice: 45000, ownerId: 'p5', metadata: { brand: 'Toyota', model: 'Hilux', plate: 'CG-1234-PN', year: 2022, mileage: 45000, fuel: 'Diesel', transmission: 'Manuelle' }, photos: [], sector: 'fleet' },
    { id: 'a6', refCode: 'AUTO-002', name: 'Renault Clio V', status: 'available', basePrice: 22000, ownerId: 'p6', metadata: { brand: 'Renault', model: 'Clio V', plate: 'CG-5678-PN', year: 2023, mileage: 18000, fuel: 'Essence', transmission: 'Manuelle' }, photos: [], sector: 'fleet' },
    { id: 'a7', refCode: 'AUTO-003', name: 'Toyota Land Cruiser', status: 'available', basePrice: 75000, ownerId: 'p5', metadata: { brand: 'Toyota', model: 'Land Cruiser', plate: 'CG-7890-PN', year: 2023, mileage: 12000, fuel: 'Diesel', transmission: 'Automatique' }, photos: [], sector: 'fleet' },
    { id: 'a8', refCode: 'AUTO-004', name: 'Peugeot 3008 Hybride', status: 'rented', basePrice: 38000, ownerId: 'p6', metadata: { brand: 'Peugeot', model: '3008', plate: 'CG-2345-PN', year: 2022, mileage: 32000, fuel: 'Hybride', transmission: 'Automatique' }, photos: [], sector: 'fleet' },
  ],

  // ── Reservations (NEW MODULE) - tracks all bookings
  reservations: [
    { id: 'r1', number: 'RES-2025-001', assetId: 'a1', partyId: 'p1', status: 'active', startDate: '2025-04-01', endDate: '2025-04-23', dailyRate: 50000, totalAmount: 1100000, paidAmount: 1100000, notes: 'Bail mensuel', invoiceIds: ['i1','i2','i3'], createdAt: '2025-03-25' },
    { id: 'r2', number: 'RES-2025-002', assetId: 'a3', partyId: 'p2', status: 'active', startDate: '2025-04-15', endDate: '2025-05-15', dailyRate: 85000, totalAmount: 2550000, paidAmount: 1500000, notes: 'Logement expatriés', invoiceIds: ['i4','i5'], createdAt: '2025-04-10' },
    { id: 'r3', number: 'RES-2025-003', assetId: 'a5', partyId: 'p3', status: 'ended', startDate: '2025-04-10', endDate: '2025-04-15', dailyRate: 45000, totalAmount: 225000, paidAmount: 225000, notes: 'Location courte durée', invoiceIds: ['i6'], createdAt: '2025-04-09' },
    { id: 'r4', number: 'RES-2025-004', assetId: 'a8', partyId: 'p4', status: 'active', startDate: '2025-04-20', endDate: '2025-04-23', dailyRate: 38000, totalAmount: 114000, paidAmount: 50000, notes: 'Acompte versé en espèces', invoiceIds: ['i7'], createdAt: '2025-04-19' },
    { id: 'r5', number: 'RES-2025-005', assetId: 'a2', partyId: 'p4', status: 'pending', startDate: '2025-05-01', endDate: '2025-05-31', dailyRate: 25000, totalAmount: 750000, paidAmount: 0, notes: 'En attente de confirmation', invoiceIds: [], createdAt: '2025-04-21' },
  ],

  // ── Quotes/Contracts (kept for backward compat with the rest of the app)
  contracts: [
    { id: 'c1', number: 'DEV-2025-001', assetId: 'a1', partyId: 'p1', status: 'active', startDate: '2025-04-01', endDate: '2025-04-23', amountHt: 1100000, discount: 0, type: 'invoice' },
    { id: 'c2', number: 'DEV-2025-002', assetId: 'a3', partyId: 'p2', status: 'active', startDate: '2025-04-15', endDate: '2025-05-15', amountHt: 2550000, discount: 0, type: 'invoice' },
    { id: 'c3', number: 'DEV-2025-003', assetId: 'a5', partyId: 'p3', status: 'ended', startDate: '2025-04-10', endDate: '2025-04-15', amountHt: 225000, discount: 0, type: 'invoice' },
    { id: 'c4', number: 'DEV-2025-004', assetId: 'a2', partyId: 'p4', status: 'sent', startDate: '2025-05-01', endDate: '2025-05-31', amountHt: 750000, discount: 0, type: 'quote' },
    { id: 'c5', number: 'DEV-2025-005', assetId: 'a8', partyId: 'p4', status: 'active', startDate: '2025-04-20', endDate: '2025-04-23', amountHt: 114000, discount: 0, type: 'invoice' },
  ],

  invoices: [
    { id: 'i1', contractId: 'c1', reservationId: 'r1', number: 'FAC-2025-001', status: 'paid', dueDate: '2025-04-08', amountHt: 350000, taxRate: 0, amountTtc: 350000, amountPaid: 350000, createdAt: '2025-04-01' },
    { id: 'i2', contractId: 'c1', reservationId: 'r1', number: 'FAC-2025-002', status: 'paid', dueDate: '2025-04-15', amountHt: 350000, taxRate: 0, amountTtc: 350000, amountPaid: 350000, createdAt: '2025-04-08' },
    { id: 'i3', contractId: 'c1', reservationId: 'r1', number: 'FAC-2025-003', status: 'paid', dueDate: '2025-04-22', amountHt: 400000, taxRate: 0, amountTtc: 400000, amountPaid: 400000, createdAt: '2025-04-15' },
    { id: 'i4', contractId: 'c2', reservationId: 'r2', number: 'FAC-2025-004', status: 'paid', dueDate: '2025-04-30', amountHt: 1500000, taxRate: 0, amountTtc: 1500000, amountPaid: 1500000, createdAt: '2025-04-15' },
    { id: 'i5', contractId: 'c2', reservationId: 'r2', number: 'FAC-2025-005', status: 'unpaid', dueDate: '2025-05-15', amountHt: 1050000, taxRate: 0, amountTtc: 1050000, amountPaid: 0, createdAt: '2025-04-30' },
    { id: 'i6', contractId: 'c3', reservationId: 'r3', number: 'FAC-2025-006', status: 'paid', dueDate: '2025-04-15', amountHt: 225000, taxRate: 0, amountTtc: 225000, amountPaid: 225000, createdAt: '2025-04-10' },
    { id: 'i7', contractId: 'c5', reservationId: 'r4', number: 'FAC-2025-007', status: 'partial', dueDate: '2025-04-23', amountHt: 114000, taxRate: 0, amountTtc: 114000, amountPaid: 50000, createdAt: '2025-04-20' },
  ],

  // ── Expense categories (NOW EDITABLE per tenant)
  expenseCategories: [
    { id: 'cat1', name: 'Entretien', sector: 'real_estate', color: 'blue' },
    { id: 'cat2', name: 'Réparations', sector: 'real_estate', color: 'gold' },
    { id: 'cat3', name: 'Taxes foncières', sector: 'real_estate', color: 'red' },
    { id: 'cat4', name: 'Syndic', sector: 'real_estate', color: 'purple' },
    { id: 'cat5', name: 'Assurance', sector: 'real_estate', color: 'green' },
    { id: 'cat6', name: 'Travaux', sector: 'real_estate', color: 'gold' },
    { id: 'cat7', name: 'Carburant', sector: 'fleet', color: 'red' },
    { id: 'cat8', name: 'Entretien', sector: 'fleet', color: 'blue' },
    { id: 'cat9', name: 'Réparations', sector: 'fleet', color: 'gold' },
    { id: 'cat10', name: 'Assurance', sector: 'fleet', color: 'green' },
    { id: 'cat11', name: 'Contrôle technique', sector: 'fleet', color: 'purple' },
    { id: 'cat12', name: 'Nettoyage', sector: 'fleet', color: 'blue' },
  ],

  expenses: [
    { id: 'e1', assetId: 'a1', category: 'Entretien', amount: 35000, date: '2025-02-10', description: 'Nettoyage trimestriel parties communes' },
    { id: 'e2', assetId: 'a1', category: 'Réparations', amount: 120000, date: '2025-03-05', description: 'Remplacement chauffe-eau' },
    { id: 'e3', assetId: 'a3', category: 'Assurance', amount: 250000, date: '2025-01-20', description: 'Prime annuelle multirisque' },
    { id: 'e4', assetId: 'a3', category: 'Taxes foncières', amount: 380000, date: '2025-02-28', description: 'Taxe foncière 2024' },
    { id: 'e5', assetId: 'a4', category: 'Travaux', amount: 950000, date: '2025-04-01', description: 'Rénovation peinture & sols' },
    { id: 'e6', assetId: 'a5', category: 'Carburant', amount: 28000, date: '2025-04-12', description: 'Plein gazole' },
    { id: 'e7', assetId: 'a5', category: 'Entretien', amount: 95000, date: '2025-03-20', description: 'Vidange + filtres' },
    { id: 'e8', assetId: 'a6', category: 'Assurance', amount: 145000, date: '2025-01-15', description: 'Assurance tous risques annuelle' },
    { id: 'e9', assetId: 'a7', category: 'Contrôle technique', amount: 25000, date: '2025-03-10', description: 'CT obligatoire' },
    { id: 'e10', assetId: 'a8', category: 'Réparations', amount: 175000, date: '2025-04-08', description: 'Remplacement plaquettes de frein' },
  ],

  tickets: [
    { id: 't1', subject: 'Problème de chauffage Appt. Voltaire', priority: 'high', status: 'in_progress', authorName: 'Jean Mavoungou', assignedTo: 'Marc Robert', createdAt: '2025-04-15', messages: [{ author: 'Jean Mavoungou', date: '2025-04-15', text: 'Le chauffage ne fonctionne plus depuis hier matin.' }, { author: 'Marc Robert', date: '2025-04-16', text: 'Bonjour, technicien envoyé demain matin.' }] },
    { id: 't2', subject: 'Demande de devis renouvellement', priority: 'normal', status: 'open', authorName: 'TotalEnergies Congo', assignedTo: '—', createdAt: '2025-04-18', messages: [{ author: 'TotalEnergies Congo', date: '2025-04-18', text: 'Bonjour, nous souhaitons renouveler le bail pour 12 mois supplémentaires.' }] },
    { id: 't3', subject: 'Question sur facture FAC-2025-003', priority: 'low', status: 'resolved', authorName: 'Jean Mavoungou', assignedTo: 'Sophie Comptable', createdAt: '2025-04-10', messages: [{ author: 'Jean Mavoungou', date: '2025-04-10', text: 'La facture mentionne un montant erroné.' }, { author: 'Sophie Comptable', date: '2025-04-11', text: 'Merci pour votre signalement, facture corrigée et renvoyée.' }] },
    { id: 't4', subject: 'Toyota Hilux - voyant moteur allumé', priority: 'urgent', status: 'open', authorName: 'Marie Bouanga', assignedTo: '—', createdAt: '2025-04-20', messages: [{ author: 'Marie Bouanga', date: '2025-04-20', text: 'Le voyant moteur s\'est allumé ce matin, que dois-je faire ?' }] },
  ],

  // ── Audit log (NEW) - tracks all sensitive actions
  auditLog: [
    { id: 'log1', timestamp: '2025-04-21T09:30:00', user: 'Marc Robert', action: 'invoice.create', target: 'FAC-2025-007', details: 'Création facture pour réservation RES-2025-004' },
    { id: 'log2', timestamp: '2025-04-20T15:45:00', user: 'Marc Robert', action: 'reservation.create', target: 'RES-2025-005', details: 'Nouvelle réservation pour Studio Mpita' },
    { id: 'log3', timestamp: '2025-04-19T11:20:00', user: 'Marc Robert', action: 'asset.update', target: 'AUTO-002', details: 'Modification tarif: 25000 → 22000 FCFA/jour' },
  ],
};

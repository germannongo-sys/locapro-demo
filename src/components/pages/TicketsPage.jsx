import React, { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { fmtDate, ticketStatuses, priorities, uid } from '../../utils/helpers.js';

export default function TicketsPage() {
  const { data, updateData, showToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = data.tickets.filter((t) => statusFilter === 'all' || t.status === statusFilter);

  const handleSave = (ticket) => {
    updateData((d) => ({
      ...d,
      tickets: [
        ...d.tickets,
        {
          id: uid(),
          createdAt: new Date().toISOString().slice(0, 10),
          messages: [
            {
              author: ticket.authorName,
              date: new Date().toISOString().slice(0, 10),
              text: ticket.message,
            },
          ],
          ...ticket,
        },
      ],
    }));
    showToast('Ticket créé');
    setShowForm(false);
  };

  const updateStatus = (ticket, newStatus) => {
    updateData((d) => ({
      ...d,
      tickets: d.tickets.map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t)),
    }));
    showToast('Statut mis à jour');
  };

  const addMessage = (ticketId, text) => {
    updateData((d) => ({
      ...d,
      tickets: d.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  author: data.user.name,
                  date: new Date().toISOString().slice(0, 10),
                  text,
                },
              ],
            }
          : t
      ),
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="text-xs" style={{ color: 'var(--text3)' }}>
          {filtered.length} ticket(s)
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nouveau ticket
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          className="input"
          style={{ maxWidth: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous statuts</option>
          {Object.entries(ticketStatuses).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="card cursor-pointer transition hover:border-blue-500"
            onClick={() => setViewing(t)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-display font-semibold">{t.subject}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                  Par {t.authorName} · {fmtDate(t.createdAt)}
                </div>
              </div>
              <span className={`tag ${priorities[t.priority].tag}`}>
                {priorities[t.priority].label}
              </span>
            </div>
            <div
              className="text-sm line-clamp-2 mb-3"
              style={{ color: 'var(--text2)' }}
            >
              {t.messages[t.messages.length - 1]?.text}
            </div>
            <div
              className="flex justify-between items-center pt-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className={`tag ${ticketStatuses[t.status].tag}`}>
                {ticketStatuses[t.status].label}
              </span>
              <div className="text-xs" style={{ color: 'var(--text3)' }}>
                💬 {t.messages.length} message(s) · {t.assignedTo}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="card empty">Aucun ticket.</div>}

      {showForm && <TicketForm onSave={handleSave} onClose={() => setShowForm(false)} />}
      {viewing && (
        <TicketDetailModal
          ticket={viewing}
          onClose={() => setViewing(null)}
          onUpdateStatus={updateStatus}
          onReply={addMessage}
        />
      )}
    </div>
  );
}

function TicketForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    subject: '',
    priority: 'normal',
    status: 'open',
    authorName: '',
    assignedTo: '—',
    message: '',
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg">Nouveau ticket</h3>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5">
          <div className="form-row">
            <label className="form-label">Sujet *</label>
            <input
              className="input"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Décrivez votre demande"
            />
          </div>
          <div className="form-grid form-grid-2">
            <div>
              <label className="form-label">Priorité</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {Object.entries(priorities).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Demandeur *</label>
              <input
                className="input"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row mt-3">
            <label className="form-label">Message *</label>
            <textarea
              className="input"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows="4"
            ></textarea>
          </div>
        </div>
        <div
          className="flex justify-end gap-2 p-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(form)}
            disabled={!form.subject || !form.authorName || !form.message}
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose, onUpdateStatus, onReply }) {
  const [reply, setReply] = useState('');
  const handleReply = () => {
    if (!reply.trim()) return;
    onReply(ticket.id, reply);
    setReply('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="font-display font-bold text-lg">{ticket.subject}</h3>
            <div className="flex gap-2 mt-1">
              <span className={`tag ${priorities[ticket.priority].tag}`}>
                {priorities[ticket.priority].label}
              </span>
              <span className={`tag ${ticketStatuses[ticket.status].tag}`}>
                {ticketStatuses[ticket.status].label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-xl px-2" style={{ color: 'var(--text3)' }}>
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="space-y-3">
            {ticket.messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(79,124,255,0.15)', color: 'var(--accent2)' }}
                >
                  {m.author.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{m.author}</span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>
                      {fmtDate(m.date)}
                    </span>
                  </div>
                  <div className="card p-3 text-sm" style={{ background: 'var(--bg3)' }}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2 mb-3">
            <select
              className="input"
              style={{ maxWidth: '160px' }}
              value={ticket.status}
              onChange={(e) => onUpdateStatus(ticket, e.target.value)}
            >
              {Object.entries(ticketStatuses).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Votre réponse..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            />
            <button className="btn btn-primary" onClick={handleReply}>
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

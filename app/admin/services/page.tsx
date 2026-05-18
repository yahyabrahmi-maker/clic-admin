'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Briefcase, Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

type Service = { id?: string; number: string; title: string; tagline: string; description: string; tags: string[]; bullets: string[]; sort_order: number };
const blank: Service = { number: '/01', title: '', tagline: '', description: '', tags: [], bullets: [], sort_order: 0 };

export default function ServicesPage() {
  const [rows, setRows] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  async function load() {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    if (data) setRows(data);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    if (id) await supabase.from('services').update(rest).eq('id', id);
    else await supabase.from('services').insert(rest);
    setSaving(false);
    setEditing(null);
    setToast(id ? 'Service updated' : 'Service added');
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    setToast('Service deleted');
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">{rows.length} {rows.length === 1 ? 'service' : 'services'} offered</p>
        </div>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add service</button>
      </div>

      <div className="space-y-2">
        {rows.map(s => (
          <div key={s.id} className="row-card">
            <div className="row-content">
              <div className="monogram-badge" style={{ background: 'rgba(232, 197, 71, 0.1)', color: 'var(--gold)', fontFamily: 'monospace', fontStyle: 'normal', fontSize: '0.85rem' }}>{s.number}</div>
              <div className="row-info">
                <div className="row-title">{s.title}</div>
                <div className="row-meta">{s.tagline}</div>
              </div>
            </div>
            <div className="row-actions">
              <button onClick={() => setEditing(s)} className="btn-icon btn-icon-ghost" aria-label="Edit"><Pencil size={14} /></button>
              <button onClick={() => remove(s.id!)} className="btn-icon btn-icon-danger" aria-label="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Briefcase size={28} /></div>
            <p className="font-medium mb-1" style={{ color: '#F8F7F2' }}>No services yet</p>
            <p className="text-sm">Add services to show what you offer.</p>
          </div>
        )}
      </div>

      <Modal
        title={editing?.id ? 'Edit service' : 'New service'}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSave={save}
        saving={saving}
      >
        {editing && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="field-group">
                <label>Number</label>
                <input value={editing.number} onChange={e => setEditing({ ...editing, number: e.target.value })} placeholder="/01" />
              </div>
              <div className="field-group col-span-2">
                <label>Title</label>
                <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Social media" />
              </div>
            </div>
            <div className="field-group">
              <label>Tagline</label>
              <input value={editing.tagline} onChange={e => setEditing({ ...editing, tagline: e.target.value })} placeholder="Always-on content that earns the scroll." />
              <p className="field-help">A short, punchy line. Max ~60 characters.</p>
            </div>
            <div className="field-group">
              <label>Description</label>
              <textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Full description shown when card expands…" />
            </div>
            <div className="field-group">
              <label>Tags</label>
              <input value={editing.tags.join(', ')} onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Reels, Calendar, Copy" />
              <p className="field-help">Comma-separated.</p>
            </div>
            <div className="field-group">
              <label>Bullets</label>
              <textarea rows={5} value={editing.bullets.join('\n')} onChange={e => setEditing({ ...editing, bullets: e.target.value.split('\n').filter(Boolean) })} placeholder="One per line…" />
              <p className="field-help">One bullet per line.</p>
            </div>
            <div className="field-group">
              <label>Sort order</label>
              <input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} />
            </div>
          </>
        )}
      </Modal>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
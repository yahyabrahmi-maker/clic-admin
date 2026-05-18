'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Quote, Pencil } from 'lucide-react';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

type T = { id?: string; quote: string; name: string; initials: string; role: string; color: string; sort_order: number };
const blank: T = { quote: '', name: '', initials: '', role: '', color: 'linear-gradient(135deg,#E8C547,#C9A535)', sort_order: 0 };

export default function TestimonialsPage() {
  const [rows, setRows] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  async function load() { const { data } = await supabase.from('testimonials').select('*').order('sort_order'); if (data) setRows(data); }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    if (id) await supabase.from('testimonials').update(rest).eq('id', id);
    else await supabase.from('testimonials').insert(rest);
    setSaving(false);
    setEditing(null);
    setToast(id ? 'Testimonial updated' : 'Testimonial added');
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    setToast('Testimonial deleted');
    load();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Testimonials</h1>
          <p className="page-subtitle">{rows.length} {rows.length === 1 ? 'testimonial' : 'testimonials'} in rotation</p>
        </div>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add testimonial</button>
      </div>

      <div className="space-y-2">
        {rows.map(t => (
          <div key={t.id} className="row-card">
            <div className="row-content">
              <div className="monogram-badge" style={{ background: t.color, color: '#06081F' }}>{t.initials}</div>
              <div className="row-info">
                <div className="row-title">{t.name}</div>
                <div className="row-meta" style={{ marginBottom: '0.3rem' }}>{t.role}</div>
                <p className="text-xs italic text-slate-300 line-clamp-1">"{t.quote.slice(0, 120)}{t.quote.length > 120 ? '…' : ''}"</p>
              </div>
            </div>
            <div className="row-actions">
              <button onClick={() => setEditing(t)} className="btn-icon btn-icon-ghost" aria-label="Edit"><Pencil size={14} /></button>
              <button onClick={() => remove(t.id!)} className="btn-icon btn-icon-danger" aria-label="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Quote size={28} /></div>
            <p className="font-medium mb-1" style={{ color: '#F8F7F2' }}>No testimonials yet</p>
            <p className="text-sm">Add client testimonials to build trust.</p>
          </div>
        )}
      </div>

      <Modal
        title={editing?.id ? 'Edit testimonial' : 'New testimonial'}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSave={save}
        saving={saving}
      >
        {editing && (
          <>
            <div className="field-group">
              <label>Quote</label>
              <textarea rows={5} value={editing.quote} onChange={e => setEditing({ ...editing, quote: e.target.value })} placeholder="Working with CLIC changed how we think about social…" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="field-group col-span-2">
                <label>Name</label>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Lina Chebbi" />
              </div>
              <div className="field-group">
                <label>Initials</label>
                <input value={editing.initials} onChange={e => setEditing({ ...editing, initials: e.target.value })} maxLength={3} placeholder="LC" />
              </div>
            </div>
            <div className="field-group">
              <label>Role</label>
              <input value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="Founder · Olea & Co." />
            </div>
            <div className="field-group">
              <label>Avatar gradient</label>
              <input value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} />
              <div className="mt-3 flex items-center gap-3">
                <div className="monogram-badge" style={{ background: editing.color, color: '#06081F' }}>{editing.initials || '?'}</div>
                <p className="field-help m-0">Live preview</p>
              </div>
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
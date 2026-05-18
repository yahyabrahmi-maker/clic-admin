'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Quote } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Testimonials</h1>
          <p className="text-slate-400 text-sm mt-1">{rows.length} {rows.length === 1 ? 'testimonial' : 'testimonials'}</p>
        </div>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add testimonial</button>
      </div>

      <div className="space-y-2">
        {rows.map(t => (
          <div key={t.id} className="card row-card flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ background: t.color, color: '#06081F', fontFamily: 'serif', fontStyle: 'italic' }}>{t.initials}</div>
              <div className="min-w-0">
                <p className="text-sm italic truncate">"{t.quote.slice(0, 140)}{t.quote.length > 140 ? '…' : ''}"</p>
                <p className="text-xs text-slate-400 mt-1">— {t.name} · {t.role}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing(t)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(t.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
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
              <div className="mt-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: editing.color, color: '#06081F', fontFamily: 'serif', fontStyle: 'italic' }}>{editing.initials || '?'}</div>
                <p className="field-help m-0">Preview</p>
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
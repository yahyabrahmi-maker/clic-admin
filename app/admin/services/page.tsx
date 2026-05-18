'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Briefcase } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Services</h1>
          <p className="text-slate-400 text-sm mt-1">{rows.length} {rows.length === 1 ? 'service' : 'services'} offered</p>
        </div>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add service</button>
      </div>

      <div className="space-y-2">
        {rows.map(s => (
          <div key={s.id} className="card row-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono w-10 flex-shrink-0" style={{ color: 'var(--gold)' }}>{s.number}</div>
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-slate-400">{s.tagline}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(s)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(s.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
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
              <p className="field-help">Comma-separated. These appear as pills on the service card.</p>
            </div>
            <div className="field-group">
              <label>Bullets</label>
              <textarea rows={5} value={editing.bullets.join('\n')} onChange={e => setEditing({ ...editing, bullets: e.target.value.split('\n').filter(Boolean) })} placeholder="Monthly editorial calendar&#10;Daily community management&#10;Native short-form for TikTok…" />
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
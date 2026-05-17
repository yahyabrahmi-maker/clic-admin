'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Save } from 'lucide-react';

type Service = { id?: string; number: string; title: string; tagline: string; description: string; tags: string[]; bullets: string[]; sort_order: number };
const blank: Service = { number: '/01', title: '', tagline: '', description: '', tags: [], bullets: [], sort_order: 0 };

export default function ServicesPage() {
  const [rows, setRows] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);

  async function load() {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    if (data) setRows(data);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (id) await supabase.from('services').update(rest).eq('id', id);
    else await supabase.from('services').insert(rest);
    setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Services</h1>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add service</button>
      </div>

      {editing && (
        <div className="card mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label>Number</label><input value={editing.number} onChange={e => setEditing({ ...editing, number: e.target.value })} placeholder="/01" /></div>
            <div><label>Title</label><input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
          </div>
          <div><label>Tagline (short)</label><input value={editing.tagline} onChange={e => setEditing({ ...editing, tagline: e.target.value })} /></div>
          <div><label>Description</label><textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
          <div><label>Tags (comma-separated)</label><input value={editing.tags.join(', ')} onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Reels, Calendar, Copy" /></div>
          <div><label>Bullets (one per line)</label><textarea rows={4} value={editing.bullets.join('\n')} onChange={e => setEditing({ ...editing, bullets: e.target.value.split('\n').filter(Boolean) })} /></div>
          <div><label>Sort order</label><input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} /></div>
          <div className="flex gap-3">
            <button onClick={save} className="btn btn-primary"><Save size={16} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows.map(s => (
          <div key={s.id} className="card flex items-center justify-between gap-4">
            <div><div className="text-xs" style={{ color: 'var(--gold)' }}>{s.number}</div><div className="font-medium">{s.title}</div><div className="text-sm text-slate-400">{s.tagline}</div></div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(s)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(s.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-slate-400 text-center py-8">No services yet.</p>}
      </div>
    </div>
  );
}
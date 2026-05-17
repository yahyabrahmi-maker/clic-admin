'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Save } from 'lucide-react';

type T = { id?: string; quote: string; name: string; initials: string; role: string; color: string; sort_order: number };
const blank: T = { quote: '', name: '', initials: '', role: '', color: 'linear-gradient(135deg,#E8C547,#C9A535)', sort_order: 0 };

export default function TestimonialsPage() {
  const [rows, setRows] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);

  async function load() { const { data } = await supabase.from('testimonials').select('*').order('sort_order'); if (data) setRows(data); }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (id) await supabase.from('testimonials').update(rest).eq('id', id);
    else await supabase.from('testimonials').insert(rest);
    setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm('Delete?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Testimonials</h1>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add</button>
      </div>

      {editing && (
        <div className="card mb-6 space-y-4">
          <div><label>Quote</label><textarea rows={4} value={editing.quote} onChange={e => setEditing({ ...editing, quote: e.target.value })} /></div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label>Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label>Initials</label><input value={editing.initials} onChange={e => setEditing({ ...editing, initials: e.target.value })} maxLength={3} /></div>
            <div><label>Role</label><input value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} /></div>
          </div>
          <div><label>Avatar gradient</label><input value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} /></div>
          <div><label>Sort order</label><input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} /></div>
          <div className="flex gap-3">
            <button onClick={save} className="btn btn-primary"><Save size={16} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows.map(t => (
          <div key={t.id} className="card flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ background: t.color, color: '#06081F' }}>{t.initials}</div>
              <div>
                <p className="text-sm italic">"{t.quote.slice(0, 120)}{t.quote.length > 120 ? '…' : ''}"</p>
                <p className="text-xs text-slate-400 mt-1">— {t.name} · {t.role}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing(t)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(t.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-slate-400 text-center py-8">No testimonials yet.</p>}
      </div>
    </div>
  );
}
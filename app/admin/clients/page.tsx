'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Save } from 'lucide-react';

type C = { id?: string; name: string; mark: string; logo_url?: string; sort_order: number };
const blank: C = { name: '', mark: '', sort_order: 0 };

export default function ClientsPage() {
  const [rows, setRows] = useState<C[]>([]);
  const [editing, setEditing] = useState<C | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() { const { data } = await supabase.from('clients').select('*').order('sort_order'); if (data) setRows(data); }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (id) await supabase.from('clients').update(rest).eq('id', id);
    else await supabase.from('clients').insert(rest);
    setEditing(null); load();
  }
  async function remove(id: string) {
    if (!confirm('Delete?')) return;
    await supabase.from('clients').delete().eq('id', id); load();
  }
  async function uploadLogo(file: File) {
    setUploading(true);
    const name = `clients/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error && editing) {
      const { data } = supabase.storage.from('media').getPublicUrl(name);
      setEditing({ ...editing, logo_url: data.publicUrl });
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Clients</h1>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add</button>
      </div>

      {editing && (
        <div className="card mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label>Name</label><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label>Mark (2 letters)</label><input value={editing.mark} onChange={e => setEditing({ ...editing, mark: e.target.value })} maxLength={3} /></div>
          </div>
          <div><label>Logo image</label>
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
            {uploading && <p className="text-xs text-slate-400 mt-2">Uploading…</p>}
            {editing.logo_url && <img src={editing.logo_url} alt="" className="mt-3 h-16" />}
          </div>
          <div><label>Sort order</label><input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} /></div>
          <div className="flex gap-3">
            <button onClick={save} className="btn btn-primary"><Save size={16} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows.map(c => (
          <div key={c.id} className="card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {c.logo_url ? <img src={c.logo_url} alt="" className="w-12 h-12 object-contain" /> : <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-sm italic font-serif" style={{ color: 'var(--gold)' }}>{c.mark}</div>}
              <div className="font-medium">{c.name}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(c.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-slate-400 text-center py-8">No clients yet.</p>}
      </div>
    </div>
  );
}
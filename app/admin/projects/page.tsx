'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Save, Star } from 'lucide-react';

type Project = {
  id?: string; client: string; category: string; year: string;
  mark: string; gradient: string; image_url?: string;
  is_featured: boolean; sort_order: number;
};

const blank: Project = { client: '', category: '', year: '2025', mark: '', gradient: 'linear-gradient(135deg, #1B1FB8 0%, #2E32E0 100%)', is_featured: false, sort_order: 0 };

export default function ProjectsPage() {
  const [rows, setRows] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data } = await supabase.from('projects').select('*').order('sort_order');
    if (data) setRows(data);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (id) await supabase.from('projects').update(rest).eq('id', id);
    else await supabase.from('projects').insert(rest);
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const name = `projects/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error && editing) {
      const { data } = supabase.storage.from('media').getPublicUrl(name);
      setEditing({ ...editing, image_url: data.publicUrl });
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add project</button>
      </div>

      {editing && (
        <div className="card mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label>Client name</label><input value={editing.client} onChange={e => setEditing({ ...editing, client: e.target.value })} /></div>
            <div><label>Category</label><input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="Strategy · Content" /></div>
            <div><label>Year</label><input value={editing.year} onChange={e => setEditing({ ...editing, year: e.target.value })} /></div>
            <div><label>Monogram (2 letters)</label><input value={editing.mark} onChange={e => setEditing({ ...editing, mark: e.target.value })} maxLength={3} /></div>
            <div className="md:col-span-2"><label>Gradient CSS</label><input value={editing.gradient} onChange={e => setEditing({ ...editing, gradient: e.target.value })} /></div>
            <div><label>Sort order</label><input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editing.is_featured} onChange={e => setEditing({ ...editing, is_featured: e.target.checked })} className="w-auto" /><span className="text-sm normal-case tracking-normal text-white"><Star size={14} className="inline mr-1" />Featured project</span></label></div>
          </div>
          <div>
            <label>Project image</label>
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            {uploading && <p className="text-xs text-slate-400 mt-2">Uploading…</p>}
            {editing.image_url && <img src={editing.image_url} alt="" className="mt-3 h-28 rounded-lg" />}
          </div>
          <div className="flex gap-3">
            <button onClick={save} className="btn btn-primary"><Save size={16} /> Save</button>
            <button onClick={() => setEditing(null)} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows.map(p => (
          <div key={p.id} className="card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold" style={{ background: p.gradient, fontStyle: 'italic', fontFamily: 'serif' }}>{p.mark}</div>
              <div>
                <div className="font-medium">{p.client} {p.is_featured && <Star size={12} className="inline" style={{ color: 'var(--gold)' }} />}</div>
                <div className="text-sm text-slate-400">{p.category} · {p.year}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(p.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-slate-400 text-center py-8">No projects yet. Click "Add project" above.</p>}
      </div>
    </div>
  );
}
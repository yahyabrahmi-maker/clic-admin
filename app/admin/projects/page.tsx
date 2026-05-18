'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Star, FolderKanban } from 'lucide-react';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

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
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  async function load() {
    const { data } = await supabase.from('projects').select('*').order('sort_order');
    if (data) setRows(data);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    if (id) await supabase.from('projects').update(rest).eq('id', id);
    else await supabase.from('projects').insert(rest);
    setSaving(false);
    setEditing(null);
    setToast(id ? 'Project updated' : 'Project added');
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    setToast('Project deleted');
    load();
  }
  async function uploadImage(file: File) {
    if (!editing) return;
    setUploading(true);
    const name = `projects/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(name);
      setEditing({ ...editing, image_url: data.publicUrl });
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{rows.length} {rows.length === 1 ? 'project' : 'projects'} · {rows.filter(p => p.is_featured).length} featured</p>
        </div>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add project</button>
      </div>

      <div className="space-y-2">
        {rows.map(p => (
          <div key={p.id} className="card row-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold flex-shrink-0" style={{ background: p.gradient, fontStyle: 'italic', fontFamily: 'serif' }}>{p.mark}</div>
              <div>
                <div className="font-medium flex items-center gap-2">{p.client} {p.is_featured && <Star size={12} fill="currentColor" style={{ color: 'var(--gold)' }} />}</div>
                <div className="text-xs text-slate-400">{p.category} · {p.year}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(p.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FolderKanban size={28} /></div>
            <p className="font-medium mb-1" style={{ color: '#F8F7F2' }}>No projects yet</p>
            <p className="text-sm">Click "Add project" to showcase your work.</p>
          </div>
        )}
      </div>

      <Modal
        title={editing?.id ? 'Edit project' : 'New project'}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSave={save}
        saving={saving}
      >
        {editing && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label>Client name</label>
                <input value={editing.client} onChange={e => setEditing({ ...editing, client: e.target.value })} placeholder="Carthage Land" />
              </div>
              <div className="field-group">
                <label>Year</label>
                <input value={editing.year} onChange={e => setEditing({ ...editing, year: e.target.value })} placeholder="2025" />
              </div>
            </div>
            <div className="field-group">
              <label>Category</label>
              <input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="Strategy · Content" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label>Monogram</label>
                <input value={editing.mark} onChange={e => setEditing({ ...editing, mark: e.target.value })} maxLength={3} placeholder="CL" />
              </div>
              <div className="field-group">
                <label>Sort order</label>
                <input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} />
              </div>
            </div>
            <div className="field-group">
              <label>Gradient CSS</label>
              <input value={editing.gradient} onChange={e => setEditing({ ...editing, gradient: e.target.value })} />
              <div className="mt-2 h-10 rounded-lg" style={{ background: editing.gradient }} />
              <p className="field-help">Preview shown above. Copy from existing projects for consistency.</p>
            </div>
            <div className="field-group">
              <label>Project image</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              {uploading && <p className="field-help">Uploading…</p>}
              {editing.image_url && (
                <div className="mt-3 p-3 rounded-lg bg-white/5 flex items-center gap-3">
                  <img src={editing.image_url} alt="" className="h-16 rounded" />
                  <button onClick={() => setEditing({ ...editing, image_url: undefined })} className="text-xs text-slate-400 hover:text-red-400">Remove image</button>
                </div>
              )}
            </div>
            <div className="field-group">
              <label className="flex items-center gap-2 cursor-pointer" style={{ textTransform: 'none', letterSpacing: 'normal', color: '#F8F7F2', fontSize: '0.95rem' }}>
                <input type="checkbox" checked={editing.is_featured} onChange={e => setEditing({ ...editing, is_featured: e.target.checked })} className="w-auto" style={{ width: 'auto' }} />
                <Star size={14} style={{ color: 'var(--gold)' }} /> Show as featured project
              </label>
              <p className="field-help">The featured project appears in the large hero card on your site.</p>
            </div>
          </>
        )}
      </Modal>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
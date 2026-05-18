'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Users } from 'lucide-react';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

type C = { id?: string; name: string; mark: string; logo_url?: string; sort_order: number };
const blank: C = { name: '', mark: '', sort_order: 0 };

export default function ClientsPage() {
  const [rows, setRows] = useState<C[]>([]);
  const [editing, setEditing] = useState<C | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  async function load() {
    const { data } = await supabase.from('clients').select('*').order('sort_order');
    if (data) setRows(data);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    if (id) await supabase.from('clients').update(rest).eq('id', id);
    else await supabase.from('clients').insert(rest);
    setSaving(false);
    setEditing(null);
    setToast(id ? 'Client updated' : 'Client added');
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this client?')) return;
    await supabase.from('clients').delete().eq('id', id);
    setToast('Client deleted');
    load();
  }
  async function uploadLogo(file: File) {
    if (!editing) return;
    setUploading(true);
    const name = `clients/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(name);
      setEditing({ ...editing, logo_url: data.publicUrl });
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Clients</h1>
          <p className="text-slate-400 text-sm mt-1">{rows.length} {rows.length === 1 ? 'client' : 'clients'} listed</p>
        </div>
        <button onClick={() => setEditing({ ...blank })} className="btn btn-primary"><Plus size={16} /> Add client</button>
      </div>

      <div className="space-y-2">
        {rows.map(c => (
          <div key={c.id} className="card row-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {c.logo_url ? <img src={c.logo_url} alt="" className="w-12 h-12 object-contain" /> : <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-sm italic font-serif" style={{ color: 'var(--gold)' }}>{c.mark}</div>}
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-slate-400">{c.mark}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} className="btn btn-ghost text-sm">Edit</button>
              <button onClick={() => remove(c.id!)} className="btn btn-danger text-sm"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={28} /></div>
            <p className="font-medium mb-1" style={{ color: '#F8F7F2' }}>No clients yet</p>
            <p className="text-sm">Click "Add client" to get started.</p>
          </div>
        )}
      </div>

      <Modal
        title={editing?.id ? 'Edit client' : 'New client'}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSave={save}
        saving={saving}
      >
        {editing && (
          <>
            <div className="field-group">
              <label>Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Carthage Land" />
            </div>
            <div className="field-group">
              <label>Mark (2-3 letters)</label>
              <input value={editing.mark} onChange={e => setEditing({ ...editing, mark: e.target.value })} maxLength={3} placeholder="CL" />
              <p className="field-help">Used as fallback if there's no logo image.</p>
            </div>
            <div className="field-group">
              <label>Logo image</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              {uploading && <p className="field-help">Uploading…</p>}
              {editing.logo_url && (
                <div className="mt-3 p-3 rounded-lg bg-white/5 flex items-center gap-3">
                  <img src={editing.logo_url} alt="" className="h-12 w-12 object-contain" />
                  <button onClick={() => setEditing({ ...editing, logo_url: undefined })} className="text-xs text-slate-400 hover:text-red-400">Remove logo</button>
                </div>
              )}
            </div>
            <div className="field-group">
              <label>Sort order</label>
              <input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} />
              <p className="field-help">Lower numbers appear first.</p>
            </div>
          </>
        )}
      </Modal>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
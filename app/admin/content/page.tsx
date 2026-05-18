'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save } from 'lucide-react';
import Toast from '@/components/Toast';

export default function ContentPage() {
  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});
  const [footer, setFooter] = useState<any>({});
  const [saving, setSaving] = useState('');
  const [toast, setToast] = useState('');

  async function load() {
    const { data } = await supabase.from('site_content').select('*');
    data?.forEach(row => {
      if (row.key === 'hero') setHero(row.value);
      if (row.key === 'about') setAbout(row.value);
      if (row.key === 'footer') setFooter(row.value);
    });
  }
  useEffect(() => { load(); }, []);

  async function save(key: string, value: any, label: string) {
    setSaving(key);
    await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() });
    setSaving('');
    setToast(`${label} saved`);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold mb-2">Site content</h1>
      <p className="text-slate-400 mb-8">Edit the static text that appears across your website.</p>

      <div className="space-y-6">
        <section className="card space-y-4">
          <h2 className="text-xl font-semibold">Hero</h2>
          <div className="field-group"><label>Eyebrow</label><input value={hero.eyebrow || ''} onChange={e => setHero({ ...hero, eyebrow: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field-group"><label>Title line 1</label><input value={hero.title_line1 || ''} onChange={e => setHero({ ...hero, title_line1: e.target.value })} /></div>
            <div className="field-group"><label>Title line 2</label><input value={hero.title_line2 || ''} onChange={e => setHero({ ...hero, title_line2: e.target.value })} /></div>
          </div>
          <div className="field-group"><label>Subtitle</label><textarea rows={3} value={hero.subtitle || ''} onChange={e => setHero({ ...hero, subtitle: e.target.value })} /></div>
          <button onClick={() => save('hero', hero, 'Hero')} disabled={saving === 'hero'} className="btn btn-primary"><Save size={16} /> {saving === 'hero' ? 'Saving…' : 'Save hero'}</button>
        </section>

        <section className="card space-y-4">
          <h2 className="text-xl font-semibold">About</h2>
          <div className="field-group"><label>Headline</label><textarea rows={3} value={about.headline || ''} onChange={e => setAbout({ ...about, headline: e.target.value })} /></div>
          <div className="field-group"><label>Studio paragraph</label><textarea rows={3} value={about.studio || ''} onChange={e => setAbout({ ...about, studio: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field-group"><label>Email</label><input value={about.email || ''} onChange={e => setAbout({ ...about, email: e.target.value })} /></div>
            <div className="field-group"><label>Phone</label><input value={about.phone || ''} onChange={e => setAbout({ ...about, phone: e.target.value })} /></div>
          </div>
          <div className="field-group"><label>Address</label><input value={about.address || ''} onChange={e => setAbout({ ...about, address: e.target.value })} /></div>
          <button onClick={() => save('about', about, 'About')} disabled={saving === 'about'} className="btn btn-primary"><Save size={16} /> {saving === 'about' ? 'Saving…' : 'Save about'}</button>
        </section>

        <section className="card space-y-4">
          <h2 className="text-xl font-semibold">Footer & socials</h2>
          <div className="field-group"><label>Tagline</label><input value={footer.tagline || ''} onChange={e => setFooter({ ...footer, tagline: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field-group"><label>Instagram URL</label><input value={footer.instagram || ''} onChange={e => setFooter({ ...footer, instagram: e.target.value })} /></div>
            <div className="field-group"><label>TikTok URL</label><input value={footer.tiktok || ''} onChange={e => setFooter({ ...footer, tiktok: e.target.value })} /></div>
            <div className="field-group"><label>LinkedIn URL</label><input value={footer.linkedin || ''} onChange={e => setFooter({ ...footer, linkedin: e.target.value })} /></div>
            <div className="field-group"><label>Behance URL</label><input value={footer.behance || ''} onChange={e => setFooter({ ...footer, behance: e.target.value })} /></div>
          </div>
          <button onClick={() => save('footer', footer, 'Footer')} disabled={saving === 'footer'} className="btn btn-primary"><Save size={16} /> {saving === 'footer' ? 'Saving…' : 'Save footer'}</button>
        </section>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
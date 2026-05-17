'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save } from 'lucide-react';

export default function ContentPage() {
  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});
  const [footer, setFooter] = useState<any>({});
  const [saving, setSaving] = useState('');

  async function load() {
    const { data } = await supabase.from('site_content').select('*');
    data?.forEach(row => {
      if (row.key === 'hero') setHero(row.value);
      if (row.key === 'about') setAbout(row.value);
      if (row.key === 'footer') setFooter(row.value);
    });
  }
  useEffect(() => { load(); }, []);

  async function save(key: string, value: any) {
    setSaving(key);
    await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() });
    setTimeout(() => setSaving(''), 1500);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-3xl font-semibold">Site content</h1>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Hero</h2>
        <div><label>Eyebrow</label><input value={hero.eyebrow || ''} onChange={e => setHero({ ...hero, eyebrow: e.target.value })} /></div>
        <div><label>Title line 1</label><input value={hero.title_line1 || ''} onChange={e => setHero({ ...hero, title_line1: e.target.value })} /></div>
        <div><label>Title line 2</label><input value={hero.title_line2 || ''} onChange={e => setHero({ ...hero, title_line2: e.target.value })} /></div>
        <div><label>Subtitle</label><textarea rows={3} value={hero.subtitle || ''} onChange={e => setHero({ ...hero, subtitle: e.target.value })} /></div>
        <button onClick={() => save('hero', hero)} className="btn btn-primary"><Save size={16} /> {saving === 'hero' ? 'Saved ✓' : 'Save hero'}</button>
      </section>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">About</h2>
        <div><label>Headline</label><textarea rows={3} value={about.headline || ''} onChange={e => setAbout({ ...about, headline: e.target.value })} /></div>
        <div><label>Studio paragraph</label><textarea rows={3} value={about.studio || ''} onChange={e => setAbout({ ...about, studio: e.target.value })} /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label>Email</label><input value={about.email || ''} onChange={e => setAbout({ ...about, email: e.target.value })} /></div>
          <div><label>Phone</label><input value={about.phone || ''} onChange={e => setAbout({ ...about, phone: e.target.value })} /></div>
        </div>
        <div><label>Address</label><input value={about.address || ''} onChange={e => setAbout({ ...about, address: e.target.value })} /></div>
        <button onClick={() => save('about', about)} className="btn btn-primary"><Save size={16} /> {saving === 'about' ? 'Saved ✓' : 'Save about'}</button>
      </section>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Footer & socials</h2>
        <div><label>Tagline</label><input value={footer.tagline || ''} onChange={e => setFooter({ ...footer, tagline: e.target.value })} /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label>Instagram URL</label><input value={footer.instagram || ''} onChange={e => setFooter({ ...footer, instagram: e.target.value })} /></div>
          <div><label>TikTok URL</label><input value={footer.tiktok || ''} onChange={e => setFooter({ ...footer, tiktok: e.target.value })} /></div>
          <div><label>LinkedIn URL</label><input value={footer.linkedin || ''} onChange={e => setFooter({ ...footer, linkedin: e.target.value })} /></div>
          <div><label>Behance URL</label><input value={footer.behance || ''} onChange={e => setFooter({ ...footer, behance: e.target.value })} /></div>
        </div>
        <button onClick={() => save('footer', footer)} className="btn btn-primary"><Save size={16} /> {saving === 'footer' ? 'Saved ✓' : 'Save footer'}</button>
      </section>
    </div>
  );
}
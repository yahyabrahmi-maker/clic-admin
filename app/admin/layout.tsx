'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, FolderKanban, Briefcase, Quote, Users, Settings, LogOut } from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/content', label: 'Site content', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/');
      else setLoaded(true);
    });
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-white/5 p-5 hidden md:flex flex-col">
        <h2 className="text-2xl font-semibold mb-8" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>CLIC<span style={{ color: 'var(--gold)' }}>.</span></h2>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                <Icon size={16} style={{ color: active ? 'var(--gold)' : undefined }} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5">
          <LogOut size={16} /> Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
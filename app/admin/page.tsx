'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FolderKanban, Briefcase, Quote, Users, Settings, ArrowUpRight, Activity, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const [counts, setCounts] = useState({ projects: 0, services: 0, testimonials: 0, clients: 0 });
  const [featured, setFeatured] = useState(0);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const tables = ['projects', 'services', 'testimonials', 'clients'] as const;
      const results = await Promise.all(tables.map(t => supabase.from(t).select('*', { count: 'exact', head: true })));
      setCounts({
        projects: results[0].count || 0,
        services: results[1].count || 0,
        testimonials: results[2].count || 0,
        clients: results[3].count || 0,
      });

      const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_featured', true);
      setFeatured(count || 0);

      const { data: recent } = await supabase.from('projects').select('*').order('sort_order').limit(3);
      if (recent) setRecentProjects(recent);

      const { data: user } = await supabase.auth.getUser();
      if (user?.user?.email) setEmail(user.user.email);
    })();
  }, []);

  const cards = [
    { href: '/admin/projects',     label: 'Projects',     count: counts.projects,     icon: FolderKanban, hint: `${featured} featured` },
    { href: '/admin/services',     label: 'Services',     count: counts.services,     icon: Briefcase,    hint: 'offered' },
    { href: '/admin/clients',      label: 'Clients',      count: counts.clients,      icon: Users,        hint: 'logos shown' },
    { href: '/admin/testimonials', label: 'Testimonials', count: counts.testimonials, icon: Quote,        hint: 'in rotation' },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div>
      <div className="dashboard-hero">
        <div>
          <p className="text-sm text-slate-400 mb-2">{greeting}{email && `, ${email.split('@')[0]}`}</p>
          <h1 className="text-4xl font-semibold tracking-tight">Welcome back<span style={{ color: 'var(--gold)' }}>.</span></h1>
          <p className="text-slate-400 mt-2 max-w-md">Here's a quick overview of your site content. Click any card to manage it.</p>
        </div>
        <a href="https://clic-agency.vercel.app" target="_blank" rel="noopener" className="btn btn-ghost text-sm hidden md:flex">
          View live site <ExternalLink size={14} />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="stat-card">
              <div className="stat-card-top">
                <div className="stat-card-icon"><Icon size={18} /></div>
                <ArrowUpRight size={16} className="stat-card-arrow" />
              </div>
              <div className="stat-card-num">{c.count}</div>
              <div className="stat-card-label">{c.label}</div>
              <div className="stat-card-hint">{c.hint}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: 'var(--gold)' }} />
              <h2 className="text-lg font-semibold">Recent projects</h2>
            </div>
            <Link href="/admin/projects" className="text-xs text-slate-400 hover:text-yellow-500 transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentProjects.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ background: p.gradient, fontFamily: 'serif', fontStyle: 'italic' }}>
                  {p.mark}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.client}</p>
                  <p className="text-xs text-slate-400">{p.category}</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{p.year}</span>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No projects yet. <Link href="/admin/projects" className="underline">Add your first one</Link>.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} style={{ color: 'var(--gold)' }} />
            <h2 className="text-lg font-semibold">Quick actions</h2>
          </div>
          <div className="space-y-2">
            <Link href="/admin/projects" className="quick-link">
              <span>Add a project</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link href="/admin/clients" className="quick-link">
              <span>Add a client logo</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link href="/admin/testimonials" className="quick-link">
              <span>Add a testimonial</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link href="/admin/content" className="quick-link">
              <span>Edit site content</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-slate-500 mb-1">Tip</p>
            <p className="text-sm text-slate-300">Changes appear on the live site after a hard refresh (Ctrl + Shift + R).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
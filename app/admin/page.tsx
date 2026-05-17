'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [counts, setCounts] = useState({ projects: 0, services: 0, testimonials: 0, clients: 0 });

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
    })();
  }, []);

  const items = [
    { href: '/admin/projects', label: 'Projects', count: counts.projects },
    { href: '/admin/services', label: 'Services', count: counts.services },
    { href: '/admin/testimonials', label: 'Testimonials', count: counts.testimonials },
    { href: '/admin/clients', label: 'Clients', count: counts.clients },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">Manage your website content from one place.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(i => (
          <Link key={i.href} href={i.href} className="card hover:border-yellow-500/40 transition-colors">
            <div className="text-3xl font-semibold" style={{ color: 'var(--gold)' }}>{i.count}</div>
            <div className="text-sm text-slate-400 mt-1">{i.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
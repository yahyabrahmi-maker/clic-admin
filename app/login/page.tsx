'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Force sign out, then send to login page
      await supabase.auth.signOut();
      router.replace('/');
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Signing out…
    </div>
  );
}
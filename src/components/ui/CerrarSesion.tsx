'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CerrarSesion() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push('/login');
        router.refresh();
      }}
      className="shrink-0 rounded-full border border-brand-soft px-3 py-1.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-accent"
    >
      Salir
    </button>
  );
}

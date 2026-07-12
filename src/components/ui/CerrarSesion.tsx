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
      className="text-sm text-neutral-500 underline"
    >
      Salir
    </button>
  );
}

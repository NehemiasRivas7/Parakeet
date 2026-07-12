'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { HOME_POR_ROL } from '@/lib/roles';
import type { RolUsuario } from '@/lib/database.types';

const CUENTAS_DEMO: { email: string; rol: string }[] = [
  { email: 'admin@parakeet.sv', rol: 'Admin' },
  { email: 'org@parakeet.sv', rol: 'Organización' },
  { email: 'empresa@parakeet.sv', rol: 'Empresa' },
  { email: 'estudiante@parakeet.sv', rol: 'Estudiante' },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const errorRol = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(
    errorRol === 'rol' ? 'Tu cuenta no tiene acceso a esa sección.' : null,
  );

  async function ingresar() {
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authErr) {
      setError('Credenciales inválidas.');
      setEnviando(false);
      return;
    }
    // Traer el rol para redirigir a su home.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let destino = next ?? '/';
    if (user) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();
      if (usuario && !next) {
        destino = HOME_POR_ROL[usuario.rol as RolUsuario];
      }
    }
    router.push(destino);
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-5 px-4 py-8">
      <div>
        <Link href="/" className="text-sm text-neutral-500 underline">
          ← Mapa público
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Ingresar a Parakeet</h1>
        <p className="text-sm text-neutral-500">
          Acceso para organizaciones, empresas y admin.
        </p>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          ingresar();
        }}
      >
        <input
          type="email"
          required
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-12 rounded-xl border border-neutral-300 bg-transparent px-3 dark:border-neutral-600"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-12 rounded-xl border border-neutral-300 bg-transparent px-3 dark:border-neutral-600"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="min-h-12 rounded-xl bg-emerald-600 px-4 font-semibold text-white disabled:opacity-60"
        >
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <div className="rounded-xl border border-dashed border-neutral-300 p-3 text-xs text-neutral-500 dark:border-neutral-700">
        <div className="mb-1 font-semibold text-neutral-600 dark:text-neutral-300">
          Cuentas de prueba · contraseña{' '}
          <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
            parakeet2026
          </code>
        </div>
        <ul className="space-y-0.5">
          {CUENTAS_DEMO.map((c) => (
            <li key={c.email}>
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setEmail(c.email);
                  setPassword('parakeet2026');
                }}
              >
                {c.email}
              </button>{' '}
              — {c.rol}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}

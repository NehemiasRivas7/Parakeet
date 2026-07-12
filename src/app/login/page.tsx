'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { HOME_POR_ROL } from '@/lib/roles';
import Logo from '@/components/ui/Logo';
import type { RolUsuario } from '@/lib/database.types';

const CUENTAS_DEMO: { email: string; rol: string }[] = [
  { email: 'admin@parakeet.sv', rol: 'Admin' },
  { email: 'org@parakeet.sv', rol: 'Organización' },
  { email: 'empresa@parakeet.sv', rol: 'Empresa' },
  { email: 'estudiante@parakeet.sv', rol: 'Voluntario' },
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
      if (usuario && !next) destino = HOME_POR_ROL[usuario.rol as RolUsuario];
    }
    router.push(destino);
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-5 py-8">
      <div>
        <Link href="/" className="text-sm font-medium text-brand-mid">
          ← Mapa público
        </Link>
        <div className="mt-4 flex items-center gap-2.5">
          <Logo className="h-11 w-11 rounded-2xl shadow-[0_10px_22px_-8px_rgba(16,148,45,0.55)]" />
          <div>
            <h1 className="text-2xl font-bold leading-none text-brand-dark">
              Parakeet
            </h1>
            <p className="text-sm text-muted">Acceso para tu rol</p>
          </div>
        </div>
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
          className="pk-input"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pk-input"
        />
        {error && <p className="text-sm font-medium text-accent">{error}</p>}
        <button type="submit" disabled={enviando} className="pk-btn pk-btn-primary mt-1">
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <div className="pk-card p-4">
        <div className="mb-2 text-xs font-semibold text-brand-dark">
          Cuentas de prueba · contraseña{' '}
          <code className="rounded-md bg-brand-tint px-1.5 py-0.5 text-brand-dark">
            parakeet2026
          </code>
        </div>
        <div className="flex flex-col gap-1.5">
          {CUENTAS_DEMO.map((c) => (
            <button
              key={c.email}
              type="button"
              onClick={() => {
                setEmail(c.email);
                setPassword('parakeet2026');
              }}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-brand-tint"
            >
              <span className="text-ink">{c.email}</span>
              <span className="text-xs font-medium text-brand-mid">{c.rol}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-muted">Cargando…</div>}
    >
      <LoginForm />
    </Suspense>
  );
}

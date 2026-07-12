'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function registrar() {
    setEnviando(true);
    setError(null);
    try {
      const resp = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, institucion, email, password }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.reason ?? 'No se pudo crear la cuenta.');
      }
      // Iniciar sesión automáticamente y entrar al panel del estudiante.
      const { error: authErr } = await createClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authErr) {
        // Cuenta creada; que ingrese manualmente.
        router.push('/login');
        return;
      }
      router.push('/estudiante');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-5 py-8">
      <div>
        <Link href="/" className="text-sm font-medium text-brand-mid">
          ← Inicio
        </Link>
        <div className="mt-4 flex items-center gap-2.5">
          <Logo className="h-11 w-11 rounded-2xl shadow-[0_10px_22px_-8px_rgba(16,148,45,0.55)]" />
          <div>
            <h1 className="text-2xl font-bold leading-none text-brand-dark">
              Soy voluntario
            </h1>
            <p className="text-sm text-muted">Creá tu cuenta y cumplí tus horas</p>
          </div>
        </div>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          registrar();
        }}
      >
        <input
          required
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="pk-input"
        />
        <input
          required
          placeholder="Institución (universidad / colegio)"
          value={institucion}
          onChange={(e) => setInstitucion(e.target.value)}
          className="pk-input"
        />
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
          minLength={6}
          placeholder="Contraseña (mín. 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pk-input"
        />
        {error && <p className="text-sm font-medium text-accent">{error}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="pk-btn pk-btn-primary mt-1"
        >
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-semibold text-brand">
          Ingresar
        </Link>
      </p>
    </div>
  );
}

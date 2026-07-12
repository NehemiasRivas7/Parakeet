'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/empresa', label: 'Catálogo' },
  { href: '/empresa/mapa', label: 'Mapa' },
  { href: '/empresa/dashboard', label: 'Financiamientos' },
];

export default function EmpresaNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-neutral-200 px-2 dark:border-neutral-800">
      {TABS.map((t) => {
        const activo = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`min-h-11 flex-1 border-b-2 px-2 text-center text-sm font-semibold leading-[44px] transition ${
              activo
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-neutral-500'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

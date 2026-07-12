'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/organizacion', label: 'Iniciativas' },
  { href: '/organizacion/mapa', label: 'Mapa' },
];

export default function OrganizacionNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 border-b border-brand-soft/70 bg-white/60 px-2 backdrop-blur-md">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`pk-tab ${pathname === t.href ? 'pk-tab-active' : ''}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

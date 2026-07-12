'use client';

import { useRef, useState } from 'react';

type Fase = { titulo: string; texto: string };

export default function CarruselFases({ fases }: { fases: Fase[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  function irA(i: number) {
    const cont = ref.current;
    if (!cont) return;
    const clamped = Math.max(0, Math.min(fases.length - 1, i));
    const hijo = cont.children[clamped] as HTMLElement | undefined;
    hijo?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setIdx(clamped);
  }

  function alHacerScroll() {
    const cont = ref.current;
    if (!cont) return;
    const centro = cont.scrollLeft + cont.clientWidth / 2;
    let mejor = 0;
    let dist = Infinity;
    Array.from(cont.children).forEach((c, i) => {
      const el = c as HTMLElement;
      const cc = el.offsetLeft + el.clientWidth / 2;
      const d = Math.abs(cc - centro);
      if (d < dist) {
        dist = d;
        mejor = i;
      }
    });
    setIdx(mejor);
  }

  return (
    <div>
      <div
        ref={ref}
        onScroll={alHacerScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fases.map((f, i) => (
          <article
            key={i}
            className="pk-card flex shrink-0 basis-[82%] snap-center flex-col p-6 sm:basis-[46%]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-bold text-brand-dark">{f.titulo}</h3>
            <p className="mt-1.5 text-sm text-ink/75">{f.texto}</p>
          </article>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {fases.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir al paso ${i + 1}`}
              onClick={() => irA(i)}
              className={`h-2 rounded-full transition-all ${
                i === idx ? 'w-6 bg-brand' : 'w-2 bg-brand-soft'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => irA(idx - 1)}
            disabled={idx === 0}
            aria-label="Anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-soft text-lg text-brand-dark transition hover:bg-brand-tint disabled:opacity-40"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => irA(idx + 1)}
            disabled={idx === fases.length - 1}
            aria-label="Siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-soft text-lg text-brand-dark transition hover:bg-brand-tint disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

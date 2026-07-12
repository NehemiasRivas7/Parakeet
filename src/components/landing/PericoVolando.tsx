// Perico verde volando (silueta simple en SVG) para la animación del hero.
export default function PericoVolando({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 52"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* cola */}
      <path d="M31 27 L3 36 L30 39 Z" fill="#0f7a24" />
      {/* cuerpo */}
      <ellipse cx="46" cy="30" rx="17" ry="10" fill="#12982d" />
      {/* ala */}
      <path
        d="M39 29 C45 12 58 10 66 17 C57 23 49 27 41 31 Z"
        fill="#40976c"
      />
      {/* cabeza */}
      <circle cx="62" cy="23" r="8.5" fill="#12982d" />
      {/* pico */}
      <path d="M70 20.5 l7.5 3 -7.5 3 z" fill="#e6a12f" />
      {/* ojo */}
      <circle cx="64" cy="21" r="1.8" fill="#ffffff" />
    </svg>
  );
}

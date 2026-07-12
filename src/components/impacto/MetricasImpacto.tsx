export type ResultadoMetrica = {
  metrica: string;
  valor: number;
  unidad: string;
};

// Tiles visuales de las métricas cuantificadas de una jornada.
export default function MetricasImpacto({
  metricas,
}: {
  metricas: ResultadoMetrica[];
}) {
  if (metricas.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {metricas.map((m, i) => (
        <div key={i} className="pk-card p-3 text-center">
          <div className="text-2xl font-extrabold leading-none text-brand">
            {m.valor.toLocaleString('es-SV')}
            {m.unidad && (
              <span className="ml-1 text-sm font-semibold text-brand-mid">
                {m.unidad}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted">{m.metrica}</div>
        </div>
      ))}
    </div>
  );
}

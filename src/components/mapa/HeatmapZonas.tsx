'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { createClient } from '@/lib/supabase/client';
import { COLOR_NIVEL, LABEL_NIVEL } from '@/lib/zonas/gravedad';
import { labelTipo } from '@/lib/reportes/tipos';
import type { NivelGravedad, TipoContaminacion } from '@/lib/database.types';

type Zona = {
  id: string;
  nombre: string;
  lat_centro: number;
  lng_centro: number;
  radio_m: number;
  nivel_gravedad: NivelGravedad;
  total_reportes: number;
};

type Reporte = {
  zona_id: string | null;
  lat: number;
  lng: number;
  tipo_contaminacion: TipoContaminacion;
  creado_en: string | null;
};

const CENTRO_DEFAULT: [number, number] = [13.4936, -89.3823]; // Playa El Tunco

// Invalida el tamano del mapa al montar y al redimensionar. Sin esto, el mapa
// puede inicializar con tamano 0 si su contenedor aun no tiene layout.
function AjustarTamano() {
  const map = useMap();
  useEffect(() => {
    const invalidar = () => map.invalidateSize();
    // Tras el primer frame, cuando el contenedor ya tiene alto.
    const id = requestAnimationFrame(invalidar);
    window.addEventListener('resize', invalidar);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', invalidar);
    };
  }, [map]);
  return null;
}

// Capa de calor alimentada por los reportes.
function CapaHeat({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    // leaflet.heat extiende L en runtime; el tipo no esta en @types/leaflet.
    const heat = (
      L as unknown as {
        heatLayer: (pts: [number, number, number][], opts: object) => L.Layer;
      }
    ).heatLayer(points, {
      radius: 30,
      blur: 22,
      maxZoom: 17,
      gradient: { 0.2: '#eab308', 0.4: '#f97316', 0.7: '#f43f5e', 1: '#dc2626' },
    });

    // leaflet.heat dibuja sobre un canvas del tamano del mapa. Si el contenedor
    // aun mide 0, getImageData tira "IndexSizeError: source height is 0".
    // Esperamos a que el mapa tenga tamano real reintentando por frame.
    let cancelado = false;
    let intentos = 0;
    const agregar = () => {
      if (cancelado) return;
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
        // Contenedor aun sin alto: reintentar, pero NUNCA agregar con 0
        // (getImageData tiraria IndexSizeError).
        if (intentos < 30) {
          intentos += 1;
          map.invalidateSize();
          requestAnimationFrame(agregar);
        }
        return;
      }
      heat.addTo(map);
    };
    agregar();

    return () => {
      cancelado = true;
      if (map.hasLayer(heat)) map.removeLayer(heat);
    };
  }, [map, points]);
  return null;
}

// Recentra el mapa cuando cambia la zona en foco (tras un reporte nuevo).
function Recentrar({
  center,
  triggerKey,
}: {
  center: [number, number];
  triggerKey: string | number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);
  return null;
}

export default function HeatmapZonas({ focusZonaId }: { focusZonaId?: string }) {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const cargado = useRef(false);

  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    const supabase = createClient();
    (async () => {
      const [zResp, rResp] = await Promise.all([
        supabase
          .from('zonas')
          .select(
            'id,nombre,lat_centro,lng_centro,radio_m,nivel_gravedad,total_reportes',
          ),
        supabase
          .from('reportes')
          .select('zona_id,lat,lng,tipo_contaminacion,creado_en'),
      ]);
      setZonas(zResp.data ?? []);
      setReportes(rResp.data ?? []);
      setCargando(false);
    })();
  }, []);

  const points = useMemo(
    () => reportes.map((r) => [r.lat, r.lng, 0.6] as [number, number, number]),
    [reportes],
  );

  // Agregados por zona: tipo predominante y fecha del reporte mas reciente.
  const resumenZona = useMemo(() => {
    const map = new Map<
      string,
      { conteo: Record<string, number>; ultimo: string | null }
    >();
    for (const r of reportes) {
      if (!r.zona_id) continue;
      const acc = map.get(r.zona_id) ?? { conteo: {}, ultimo: null };
      acc.conteo[r.tipo_contaminacion] =
        (acc.conteo[r.tipo_contaminacion] ?? 0) + 1;
      if (r.creado_en && (!acc.ultimo || r.creado_en > acc.ultimo)) {
        acc.ultimo = r.creado_en;
      }
      map.set(r.zona_id, acc);
    }
    return map;
  }, [reportes]);

  const focus = zonas.find((z) => z.id === focusZonaId);
  const center: [number, number] = focus
    ? [focus.lat_centro, focus.lng_centro]
    : zonas.length > 0
      ? [zonas[0].lat_centro, zonas[0].lng_centro]
      : CENTRO_DEFAULT;

  if (cargando) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-brand-tint text-sm text-muted">
        Cargando mapa…
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <AjustarTamano />
      <CapaHeat points={points} />
      {zonas.map((z) => {
        const resumen = resumenZona.get(z.id);
        const predominante =
          resumen && Object.keys(resumen.conteo).length > 0
            ? (Object.entries(resumen.conteo).sort(
                (a, b) => b[1] - a[1],
              )[0][0] as TipoContaminacion)
            : null;
        const color = COLOR_NIVEL[z.nivel_gravedad];
        return (
          <Circle
            key={z.id}
            center={[z.lat_centro, z.lng_centro]}
            radius={z.radio_m}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.25,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{z.nombre}</div>
                <div>
                  Nivel:{' '}
                  <span style={{ color }} className="font-medium">
                    {LABEL_NIVEL[z.nivel_gravedad]}
                  </span>
                </div>
                <div>Reportes: {z.total_reportes}</div>
                {predominante && <div>Predomina: {labelTipo(predominante)}</div>}
                {resumen?.ultimo && (
                  <div>
                    Último:{' '}
                    {new Date(resumen.ultimo).toLocaleDateString('es-SV', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </Popup>
          </Circle>
        );
      })}
      {focus && (
        <Recentrar
          center={[focus.lat_centro, focus.lng_centro]}
          triggerKey={focus.id}
        />
      )}
    </MapContainer>
  );
}

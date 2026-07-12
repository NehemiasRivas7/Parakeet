'use client';

import { useEffect, useRef, useState } from 'react';
import { Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { createClient } from '@/lib/supabase/client';
import { COLOR_NIVEL, LABEL_NIVEL } from '@/lib/zonas/gravedad';
import type { NivelGravedad } from '@/lib/database.types';

type Zona = {
  id: string;
  nombre: string;
  lat_centro: number;
  lng_centro: number;
  radio_m: number;
  nivel_gravedad: NivelGravedad;
  total_reportes: number;
};

// Capa reutilizable: heat de reportes + círculos de zonas con su color ACTUAL.
// Es la misma vista "en vivo" del mapa público, para incrustar en org/empresa.
export default function CapaZonasVivas({
  onClickPunto,
}: {
  // Si se pasa, el click sobre una zona selecciona el punto (modo organización)
  // en lugar de abrir popup.
  onClickPunto?: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [points, setPoints] = useState<[number, number, number][]>([]);
  const cargado = useRef(false);

  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    const supabase = createClient();
    (async () => {
      const [zResp, rResp] = await Promise.all([
        supabase
          .from('zonas')
          .select('id,nombre,lat_centro,lng_centro,radio_m,nivel_gravedad,total_reportes'),
        supabase.from('reportes').select('lat,lng'),
      ]);
      setZonas(zResp.data ?? []);
      setPoints(
        (rResp.data ?? []).map((r) => [r.lat, r.lng, 0.6] as [number, number, number]),
      );
    })();
  }, []);

  // Capa de calor (misma config del mapa público).
  useEffect(() => {
    if (points.length === 0) return;
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

    let cancelado = false;
    let intentos = 0;
    const agregar = () => {
      if (cancelado) return;
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
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

  return (
    <>
      {zonas.map((z) => {
        const color = COLOR_NIVEL[z.nivel_gravedad];
        return (
          <Circle
            key={z.id}
            center={[z.lat_centro, z.lng_centro]}
            radius={z.radio_m}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.22, weight: 2 }}
            eventHandlers={
              onClickPunto
                ? { click: (e) => onClickPunto(e.latlng.lat, e.latlng.lng) }
                : undefined
            }
          >
            {!onClickPunto && (
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{z.nombre}</div>
                  <div>
                    {LABEL_NIVEL[z.nivel_gravedad]} · {z.total_reportes} reportes
                  </div>
                </div>
              </Popup>
            )}
          </Circle>
        );
      })}
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createClient } from '@/lib/supabase/client';
import { COLOR_NIVEL } from '@/lib/zonas/gravedad';
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

const CENTRO_DEFAULT: [number, number] = [13.4936, -89.3823];

const pin = L.divIcon({
  html: '<div style="font-size:30px;line-height:1;transform:translateY(-4px)">📍</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function AjustarTamano() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

function ClickParaSeleccionar({
  onSeleccionar,
}: {
  onSeleccionar: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSeleccionar(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapaOrganizacion({
  seleccion,
  onSeleccionar,
}: {
  seleccion: { lat: number; lng: number } | null;
  onSeleccionar: (lat: number, lng: number) => void;
}) {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const cargado = useRef(false);

  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from('zonas')
        .select('id,nombre,lat_centro,lng_centro,radio_m,nivel_gravedad,total_reportes');
      setZonas(data ?? []);
    })();
  }, []);

  const center: [number, number] =
    zonas.length > 0
      ? [zonas[0].lat_centro, zonas[0].lng_centro]
      : CENTRO_DEFAULT;

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <AjustarTamano />
      <ClickParaSeleccionar onSeleccionar={onSeleccionar} />
      {zonas.map((z) => {
        const color = COLOR_NIVEL[z.nivel_gravedad];
        return (
          <Circle
            key={z.id}
            center={[z.lat_centro, z.lng_centro]}
            radius={z.radio_m}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
            eventHandlers={{
              // Sin esto, el circulo captura el click y no se puede seleccionar
              // DENTRO de la zona (que es lo ideal). Seleccionamos el punto tocado.
              click(e) {
                onSeleccionar(e.latlng.lat, e.latlng.lng);
              },
            }}
          />
        );
      })}
      {seleccion && (
        <Marker position={[seleccion.lat, seleccion.lng]} icon={pin} />
      )}
    </MapContainer>
  );
}

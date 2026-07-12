'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CapaZonasVivas from './CapaZonasVivas';

export type IniciativaMapa = {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  horas_otorgadas: number;
  cupos_restantes: number;
};

const CENTRO_DEFAULT: [number, number] = [13.4936, -89.3823];

const pin = L.divIcon({
  html: '<div style="font-size:26px;line-height:1;transform:translateY(-2px)">🌱</div>',
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function AjustarTamano() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

export default function MapaIniciativas({
  iniciativas,
  hrefBase = '/estudiante/iniciativa',
  cta = 'Ver detalle →',
  conZonas = false,
}: {
  iniciativas: IniciativaMapa[];
  hrefBase?: string;
  cta?: string;
  // Muestra también las zonas contaminadas en vivo (heat + círculos por gravedad).
  conZonas?: boolean;
}) {
  const center: [number, number] =
    iniciativas.length > 0
      ? [iniciativas[0].lat, iniciativas[0].lng]
      : CENTRO_DEFAULT;

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <AjustarTamano />
      {conZonas && <CapaZonasVivas />}
      {iniciativas.map((ini) => (
        <Marker key={ini.id} position={[ini.lat, ini.lng]} icon={pin}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-brand-dark">{ini.nombre}</div>
              <div className="text-muted">
                {ini.horas_otorgadas} h · {ini.cupos_restantes} cupos
              </div>
              <Link
                href={`${hrefBase}/${ini.id}`}
                className="font-medium text-brand-dark underline"
              >
                {cta}
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export type Clima = {
  fuente: string;
  esEstimado: boolean;
  temp: number | null;
  tempMax: number | null;
  tempMin: number | null;
  descripcion: string;
  emoji: string;
  lluviaProb: number | null;
  viento: number | null;
};

export type ZonaClima = {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  clima?: Clima | null;
};

const CENTRO_DEFAULT: [number, number] = [13.4936, -89.3823];

function AjustarTamano() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

export default function MapaClima({ zonas }: { zonas: ZonaClima[] }) {
  const center: [number, number] =
    zonas.length > 0 ? [zonas[0].lat, zonas[0].lng] : CENTRO_DEFAULT;

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <AjustarTamano />
      {zonas.map((z) => {
        const emoji = z.clima?.emoji ?? '⛅';
        const temp = z.clima?.temp != null ? `${z.clima.temp}°` : '';
        const icon = L.divIcon({
          className: '',
          html: `<div style="display:flex;align-items:center;gap:2px;background:#fff;border:1px solid #cfeae2;border-radius:9999px;padding:2px 7px;font:600 12px system-ui;box-shadow:0 4px 10px -4px rgba(0,99,65,.4);white-space:nowrap"><span style="font-size:14px">${emoji}</span>${temp}</div>`,
          iconSize: [56, 26],
          iconAnchor: [28, 13],
        });
        return (
          <Marker key={z.id} position={[z.lat, z.lng]} icon={icon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{z.nombre}</div>
                {z.clima ? (
                  <>
                    <div>
                      {z.clima.emoji} {z.clima.descripcion}
                    </div>
                    {z.clima.tempMax != null && (
                      <div>
                        {z.clima.tempMin}° – {z.clima.tempMax}°
                      </div>
                    )}
                    <div>
                      Lluvia {z.clima.lluviaProb ?? '—'}% · Viento{' '}
                      {z.clima.viento ?? '—'} km/h
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Fuente: {z.clima.fuente}
                      {z.clima.esEstimado ? ' (aprox.)' : ''}
                    </div>
                  </>
                ) : (
                  <div className="text-neutral-500">Cargando…</div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

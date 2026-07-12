'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Pin como divIcon (emoji) para evitar el problema de los iconos PNG de Leaflet
// con los bundlers.
const pin = L.divIcon({
  html: '<div style="font-size:30px;line-height:1;transform:translateY(-4px)">📍</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Invalida el tamano al montar para que los tiles no queden grises.
function AjustarTamano() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

function ClickParaUbicar({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Recentra el mapa cuando cambia triggerKey (p.ej. al llegar la geolocalizacion),
// sin pelear con los arrastres del pin.
function Recentrar({
  center,
  triggerKey,
}: {
  center: [number, number];
  triggerKey: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() < 15 ? 16 : map.getZoom(), {
      animate: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);
  return null;
}

export default function SelectorUbicacion({
  lat,
  lng,
  recenterKey,
  onChange,
}: {
  lat: number;
  lng: number;
  recenterKey: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <AjustarTamano />
      <ClickParaUbicar onChange={onChange} />
      <Marker
        position={[lat, lng]}
        draggable
        icon={pin}
        eventHandlers={{
          dragend: (e) => {
            const p = (e.target as L.Marker).getLatLng();
            onChange(p.lat, p.lng);
          },
        }}
      />
      <Recentrar center={[lat, lng]} triggerKey={recenterKey} />
    </MapContainer>
  );
}

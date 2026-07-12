'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CapaZonasVivas from './CapaZonasVivas';

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

// Mapa de la organización: la MISMA vista en vivo del público (heat + zonas con
// su color actual) + selección de punto para crear una iniciativa.
export default function MapaOrganizacion({
  seleccion,
  onSeleccionar,
}: {
  seleccion: { lat: number; lng: number } | null;
  onSeleccionar: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={CENTRO_DEFAULT}
      zoom={14}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <AjustarTamano />
      <ClickParaSeleccionar onSeleccionar={onSeleccionar} />
      <CapaZonasVivas onClickPunto={onSeleccionar} />
      {seleccion && <Marker position={[seleccion.lat, seleccion.lng]} icon={pin} />}
    </MapContainer>
  );
}

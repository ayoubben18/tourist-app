"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon
const customIcon = new L.Icon({
  iconUrl: '/api/placeholder/32/32',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export interface Place {
  name: string;
  description: string | null;
  estimated_duration: number;
  opening_hours: any;
  category: string | null;
  coordinates: [number, number];
}

interface MapProps {
  places: Place[];
}

export default function Map({ places }: MapProps) {
  return (
    <MapContainer
      center={places[0].coordinates}
      zoom={13}
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {places.map((place, index) => (
        <Marker
          key={index}
          position={place.coordinates as [number, number]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{place.name}</h3>
              <p className="text-sm">{place.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      <Polyline
        positions={places.map(p => p.coordinates)}
        color="red"
        weight={2}
      />
    </MapContainer>
  );
}
"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteStepsData } from "@/dto/circuits-dto";

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
  iconUrl: "/api/placeholder/32/32",
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
  routeSteps?: RouteStepsData | null;
}

export default function Map({ places, routeSteps }: MapProps) {
  if (!places || places.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        No places to display on map.
      </div>
    );
  }

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
        <Marker key={`marker-${index}`} position={place.coordinates}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{place.name}</h3>
              <p className="text-sm">{place.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {routeSteps &&
        routeSteps.steps_data &&
        routeSteps.steps_data.map((stepData, stepIndex) =>
          stepData.features.map((feature, featureIndex) => {
            const polylinePositions = feature.geometry.coordinates.map(
              (coord) => [coord[1], coord[0]] as [number, number]
            );
            return (
              <Polyline
                key={`route-step-${stepIndex}-${featureIndex}`}
                positions={polylinePositions}
                color="blue"
                weight={3}
              />
            );
          })
        )}
    </MapContainer>
  );
}

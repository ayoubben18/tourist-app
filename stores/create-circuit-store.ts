import { create } from "zustand";

interface CircuitCreationState {
  selectedLocation: google.maps.LatLngLiteral | null;
  selectedPlaces: Set<string>;
  startingLocation: google.maps.LatLngLiteral | null;
  setSelectedLocation: (location: google.maps.LatLngLiteral | null) => void;
  setSelectedPlaces: (places: Set<string>) => void;
  setStartingLocation: (location: google.maps.LatLngLiteral | null) => void;
}

export const useCircuitCreationStore = create<CircuitCreationState>((set) => ({
  selectedLocation: null,
  selectedPlaces: new Set(),
  startingLocation: null,
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedPlaces: (places) => set({ selectedPlaces: places }),
  setStartingLocation: (location) => set({ startingLocation: location }),
}));

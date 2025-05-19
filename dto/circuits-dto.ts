import type {
  Circuit,
  City,
  UsersAdditionalInfo,
} from "@/db/migrations/schema";
import type { PointOfInterestDTO } from "./points-of-interest-dto";

// Add these interfaces for RouteStepsData
interface StepFeatureGeometry {
  type: "LineString";
  coordinates: [number, number][]; // [longitude, latitude]
}

interface StepFeatureProperties {
  summary: {
    distance: number;
    duration: number;
  };
  segments: Array<{
    steps: Array<{
      name: string;
      type: number;
      distance: number;
      duration: number;
      way_points: [number, number];
      instruction: string;
      exit_number?: number;
    }>;
    distance: number;
    duration: number;
  }>;
  way_points: [number, number];
}

interface StepFeature {
  bbox: [number, number, number, number];
  type: "Feature";
  geometry: StepFeatureGeometry;
  properties: StepFeatureProperties;
}

interface StepData {
  bbox: [number, number, number, number];
  type: "FeatureCollection";
  features: StepFeature[];
  metadata: {
    query: {
      format: string;
      profile: string;
      coordinates: [[number, number], [number, number]];
      profileName: string;
    };
    engine: {
      version: string;
      build_date: string;
      graph_date: string;
    };
    service: string;
    timestamp: number;
    attribution: string;
  };
}

export interface RouteStepsData {
  steps_data: StepData[];
}
// End of new interfaces

type CircuitsDTO = {
  id: Circuit["id"];
  name: Circuit["name"];
  description: Circuit["description"];
  estimated_duration: Circuit["estimated_duration"];
  distance: Circuit["distance"];
  rating: Circuit["rating"];
  number_of_reviews: Circuit["number_of_reviews"];
  creator_avatar: UsersAdditionalInfo["avatar_url"];
  creator: UsersAdditionalInfo["full_name"];
  city: City["name"];
  country: City["country"];
  image: City["image_url"];
  is_public?: Circuit["is_public"];
  created_at?: Circuit["created_at"];
  pois?: PointOfInterestDTO[];
  route_steps: RouteStepsData | null;
};

export { type CircuitsDTO };

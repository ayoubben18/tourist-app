import { createCircuitSchema } from "@/utils/schemas";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

type StepType = {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
};

type GooglePlace = {
  place_id: string;
  name: string;
  photos?: google.maps.places.PlacePhoto[];
  formatted_address?: string;
};

type FormProp = UseFormReturn<z.infer<typeof createCircuitSchema>>;

export type { StepType, GooglePlace, FormProp };

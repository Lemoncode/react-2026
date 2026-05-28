import {
  Bath,
  BedDouble,
  Car,
  Snowflake,
  Users,
  Utensils,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { FeatureType } from "./home.model";

// Mapea cada tipo de característica de Content Island a su icono lucide.
export const featureIcons: Record<FeatureType, LucideIcon> = {
  beach: Waves,
  bedrooms: BedDouble,
  bathrooms: Bath,
  guests: Users,
  wifi: Wifi,
  kitchen: Utensils,
  parking: Car,
  aircon: Snowflake,
};

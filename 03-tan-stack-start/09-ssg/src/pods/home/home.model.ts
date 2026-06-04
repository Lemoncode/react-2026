import type { Media } from "@content-island/api-client";

export type FeatureType =
  | "beach"
  | "bathrooms"
  | "bedrooms"
  | "guests"
  | "wifi"
  | "kitchen"
  | "parking"
  | "aircon";

export interface HeaderSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  logo: Media;
  villaName: string;
  navigationLinks: NavLink[];
}

export interface HeroSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  starText: string;
  title: string;
  location: string;
  "description ": string;
  featuresSummary: HeroSummaryFeature[];
  Pictures: Picture[];
}

export interface FeaturesSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  topTitle: string;
  mainTitle: string;
  features: Feature[];
  bookingInfo: string;
}

export interface AvailabilitySection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  topTitle: string;
  freeLabel: string;
  BusyLabel: string;
  selectionLabel: string;
  rangeSelectedTopTitle: string;
  rangeSelectedMainTitle: string;
  CheckAvailabilityLabel: string;
}

export interface FooterSection {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  copyRight: string;
  privacyPolicy: NavLink;
}

export interface NavLink {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  label: string;
  url: string;
}

export interface HeroSummaryFeature {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  name: string;
  value: string;
}

export interface Picture {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  picture: Media;
  description: string;
}

export interface Feature {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  type: FeatureType;
  text: string;
}

export interface FullMainPage {
  id: string;
  language: "es";
  lastUpdate: string; // Stores the date in ISO 8601 format. For example: 2021-09-10T19:30:00.000Z
  headerSection: HeaderSection;
  heroSection: HeroSection;
  featureSection: FeaturesSection;
  availabilitySection: AvailabilitySection;
  footerSection: FooterSection;
}

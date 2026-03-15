export type BuildingCategory =
  | "library"
  | "cafeteria"
  | "labs"
  | "hostel"
  | "parking"
  | "admin office";

export interface Building {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: BuildingCategory;
  description: string;
  facilities: string[];
  photo?: string;
}

export interface MapCenter {
  lat: number;
  lng: number;
  zoom?: number;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps?: string[];
}

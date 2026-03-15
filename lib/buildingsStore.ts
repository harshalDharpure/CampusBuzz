import type { Building } from "./types";

const STORAGE_KEY = "campusbaze_buildings";

export function getBuildings(defaultBuildings: Building[]): Building[] {
  if (typeof window === "undefined") return defaultBuildings;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultBuildings;
    const parsed = JSON.parse(saved) as Building[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultBuildings;
  } catch {
    return defaultBuildings;
  }
}

export function setBuildings(buildings: Building[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(buildings));
}

export function clearBuildings(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

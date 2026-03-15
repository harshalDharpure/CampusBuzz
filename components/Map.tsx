"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Building } from "@/lib/types";
import type { MapCenter } from "@/lib/types";

const containerStyle = { width: "100%", height: "100%" };

const FALLBACK_CENTER = { lat: 20.9993, lng: 77.7578 };
const FALLBACK_ZOOM = 16;

export interface MapProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  onBuildingClick: (building: Building) => void;
  userLocation: { lat: number; lng: number; heading?: number } | null;
  directionsResult: google.maps.DirectionsResult | null;
  /** Exact start position used for the route (so we can show a marker at the correct starting point) */
  routeOrigin: { lat: number; lng: number } | null;
  /** Exact end position used for the route */
  routeDestination: { lat: number; lng: number } | null;
  zoomTo: MapCenter | null;
  isDark: boolean;
  followUser?: boolean;
  /** Initial map center (e.g. campus center). Falls back to Pune if not provided. */
  mapCenter?: { lat: number; lng: number };
  mapZoom?: number;
}

function MapInner({
  buildings,
  selectedBuilding,
  onBuildingClick,
  userLocation,
  directionsResult,
  routeOrigin,
  routeDestination,
  zoomTo,
  followUser = false,
  mapCenter = FALLBACK_CENTER,
  mapZoom = FALLBACK_ZOOM,
}: MapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const routeStartMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeEndMarkerRef = useRef<google.maps.Marker | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#2563eb", strokeWeight: 6 },
      });
    }
    directionsRendererRef.current.setMap(map);
    setMapReady(true);
  }, []);

  const onUnmount = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    if (routeStartMarkerRef.current) {
      routeStartMarkerRef.current.setMap(null);
      routeStartMarkerRef.current = null;
    }
    if (routeEndMarkerRef.current) {
      routeEndMarkerRef.current.setMap(null);
      routeEndMarkerRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !zoomTo || followUser) return;
    mapRef.current.setCenter({ lat: zoomTo.lat, lng: zoomTo.lng });
    if (zoomTo.zoom != null) mapRef.current.setZoom(zoomTo.zoom);
  }, [zoomTo, followUser]);

  useEffect(() => {
    if (!mapRef.current || !followUser || !userLocation) return;
    mapRef.current.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
    mapRef.current.setZoom(17);
  }, [followUser, userLocation?.lat, userLocation?.lng]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const newMarkers: google.maps.Marker[] = buildings.map((b) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: b.lat, lng: b.lng },
        title: b.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: selectedBuilding?.id === b.id ? "#2563eb" : "#fff",
          fillOpacity: 1,
          strokeColor: "#2563eb",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onBuildingClick(b));
      return marker;
    });

    markersRef.current = newMarkers;

    if (typeof MarkerClusterer !== "undefined" && newMarkers.length > 0) {
      if (clustererRef.current) clustererRef.current.clearMarkers();
      clustererRef.current = new MarkerClusterer({ map, markers: newMarkers });
    }

    return () => {
      newMarkers.forEach((m) => m.setMap(null));
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [buildings, selectedBuilding, onBuildingClick, mapReady]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      return;
    }
    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    const heading = userLocation.heading ?? 0;
    userMarkerRef.current = new google.maps.Marker({
      map: mapRef.current,
      position: { lat: userLocation.lat, lng: userLocation.lng },
      title: "You are here",
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 8,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
        rotation: heading,
      },
    });
    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (!directionsRendererRef.current || !mapRef.current) return;
    if (!directionsResult) {
      directionsRendererRef.current.setMap(null);
      if (routeStartMarkerRef.current) {
        routeStartMarkerRef.current.setMap(null);
        routeStartMarkerRef.current = null;
      }
      if (routeEndMarkerRef.current) {
        routeEndMarkerRef.current.setMap(null);
        routeEndMarkerRef.current = null;
      }
      return;
    }
    directionsRendererRef.current.setMap(mapRef.current);
    directionsRendererRef.current.setDirections(directionsResult);
  }, [directionsResult]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!routeOrigin || !routeDestination) {
      if (routeStartMarkerRef.current) {
        routeStartMarkerRef.current.setMap(null);
        routeStartMarkerRef.current = null;
      }
      if (routeEndMarkerRef.current) {
        routeEndMarkerRef.current.setMap(null);
        routeEndMarkerRef.current = null;
      }
      return;
    }
    if (routeStartMarkerRef.current) routeStartMarkerRef.current.setMap(null);
    if (routeEndMarkerRef.current) routeEndMarkerRef.current.setMap(null);
    routeStartMarkerRef.current = new google.maps.Marker({
      map,
      position: routeOrigin,
      title: "Start",
      label: { text: "A", color: "#fff", fontWeight: "bold" },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: "#22c55e",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
    routeEndMarkerRef.current = new google.maps.Marker({
      map,
      position: routeDestination,
      title: "Destination",
      label: { text: "B", color: "#fff", fontWeight: "bold" },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: "#dc2626",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
    return () => {
      if (routeStartMarkerRef.current) {
        routeStartMarkerRef.current.setMap(null);
        routeStartMarkerRef.current = null;
      }
      if (routeEndMarkerRef.current) {
        routeEndMarkerRef.current.setMap(null);
        routeEndMarkerRef.current = null;
      }
    };
  }, [routeOrigin, routeDestination]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={mapZoom}
      center={mapCenter}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        clickableIcons: false,
        mapTypeControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },
        fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        streetViewControl: false,
      }}
    />
  );
}

export default function CampusMap(props: MapProps) {
  return <MapInner {...props} />;
}

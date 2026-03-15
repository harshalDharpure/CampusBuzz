"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoadScriptNext } from "@react-google-maps/api";
import CampusMap from "./Map";
import SearchBox from "./SearchBox";
import BuildingSidePanel from "./BuildingSidePanel";
import type { Building, MapCenter } from "@/lib/types";
import buildingsData from "@/data/buildings.json";

const DEFAULT_BUILDINGS: Building[] = buildingsData as Building[];
const DEFAULT_CENTER: MapCenter = { lat: 20.9993, lng: 77.7578, zoom: 16 };

export default function CampusNavigator() {
  const searchParams = useSearchParams();
  const [buildings, setBuildingsState] = useState<Building[]>(DEFAULT_BUILDINGS);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [origin, setOrigin] = useState<Building | null>(null);
  const [destination, setDestination] = useState<Building | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [zoomTo, setZoomTo] = useState<MapCenter | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/buildings")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Building[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setBuildingsState(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBuildingsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const campusCenter = useMemo(() => {
    if (buildings.length === 0) return DEFAULT_CENTER;
    const sumLat = buildings.reduce((s, b) => s + b.lat, 0);
    const sumLng = buildings.reduce((s, b) => s + b.lng, 0);
    return { lat: sumLat / buildings.length, lng: sumLng / buildings.length };
  }, [buildings]);

  const handlePlaceSelect = useCallback((building: Building | null) => {
    setSelectedBuilding(building);
  }, []);

  const handleZoomTo = useCallback((lat: number, lng: number, zoom?: number) => {
    setZoomTo({ lat, lng, zoom });
  }, []);

  const handleBuildingClick = useCallback((building: Building) => {
    setSelectedBuilding(building);
    setZoomTo({ lat: building.lat, lng: building.lng, zoom: 18 });
  }, []);

  const clearRoute = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setDirectionsResult(null);
    setRouteDistance(null);
    setRouteDuration(null);
  }, []);

  useEffect(() => {
    const id = searchParams.get("building");
    if (!id) return;
    const num = parseInt(id, 10);
    const b = buildings.find((x) => x.id === num);
    if (b) {
      setSelectedBuilding(b);
      setZoomTo({ lat: b.lat, lng: b.lng, zoom: 18 });
    }
  }, [searchParams, buildings]);

  useEffect(() => {
    let watchId: number | null = null;
    if (!navigator?.geolocation) return;
    const onSuccess = (pos: GeolocationPosition) => {
      const heading = pos.coords.heading != null && !Number.isNaN(pos.coords.heading) ? pos.coords.heading : undefined;
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        ...(heading != null && { heading }),
      });
    };
    const onError = () => {};
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 60000,
    });
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const originPoint = origin ? { lat: origin.lat, lng: origin.lng } : userLocation;
    if (!originPoint || !destination) {
      setDirectionsResult(null);
      setRouteDistance(null);
      setRouteDuration(null);
      return;
    }
    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: originPoint,
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResult(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setRouteDistance(leg.distance?.text ?? null);
            setRouteDuration(leg.duration?.text ?? null);
          }
          const midLat = (originPoint.lat + destination.lat) / 2;
          const midLng = (originPoint.lng + destination.lng) / 2;
          setZoomTo({ lat: midLat, lng: midLng, zoom: 16 });
        } else {
          setDirectionsResult(null);
          setRouteDistance(null);
          setRouteDuration(null);
        }
      }
    );
  }, [origin, destination, userLocation]);

  const getDirections = useCallback(() => {
    const dest = destination || selectedBuilding;
    if (!dest) {
      alert("Please select a building on the map first (click a marker), then click Get directions.");
      return;
    }
    const originPoint = origin ? { lat: origin.lat, lng: origin.lng } : userLocation;
    if (!originPoint) {
      alert("Turn on location access so we can show the path from your current location to the destination.");
      return;
    }
    if (typeof google === "undefined" || !google.maps?.DirectionsService) {
      alert("Map is still loading. Please wait a moment and try again.");
      return;
    }
    if (!destination && selectedBuilding) setDestination(selectedBuilding);

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: originPoint,
        destination: { lat: dest.lat, lng: dest.lng },
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResult(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setRouteDistance(leg.distance?.text ?? null);
            setRouteDuration(leg.duration?.text ?? null);
          }
          const midLat = (originPoint.lat + dest.lat) / 2;
          const midLng = (originPoint.lng + dest.lng) / 2;
          setZoomTo({ lat: midLat, lng: midLng, zoom: 16 });
        } else {
          setDirectionsResult(null);
          setRouteDistance(null);
          setRouteDuration(null);
          const msg =
            status === google.maps.DirectionsStatus.ZERO_RESULTS
              ? "No walking route found between these points. Try moving the map or use a building closer to your location."
              : status === google.maps.DirectionsStatus.REQUEST_DENIED
                ? "Directions API is not enabled. Enable it in Google Cloud Console for your API key."
                : `Directions request failed (${status}). Check that Directions API is enabled for your key.`;
          alert(msg);
        }
      }
    );
  }, [origin, destination, selectedBuilding, userLocation]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const originLabel = origin ? origin.name : userLocation ? "Your location" : "";
  const destinationLabel = destination ? destination.name : "";

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#f1f5f9",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ marginBottom: "8px" }}>Add <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: "4px" }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to <code style={{ background: "#1e293b", padding: "2px 6px", borderRadius: "4px" }}>.env.local</code></p>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>Then restart with <code>npm run dev</code></p>
        </div>
      </div>
    );
  }

  return (
    <LoadScriptNext googleMapsApiKey={apiKey} loadingElement={<div style={{ padding: 20, textAlign: "center" }}>Loading map…</div>} libraries={["geometry"]}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        background: "var(--bg-primary)",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--sidebar-bg)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginRight: "12px",
          }}
        >
          PR Pote College, Amravati
        </h1>
        <SearchBox
          buildings={buildings}
          onPlaceSelect={handlePlaceSelect}
          onZoomTo={handleZoomTo}
          placeholder="Search buildings..."
          isDark={darkMode}
        />
        <Link
          href="/admin"
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--card-bg)",
            color: "var(--text-primary)",
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          Admin
        </Link>
        <button
          type="button"
          onClick={() => setDarkMode((d) => !d)}
          aria-label="Toggle dark mode"
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--card-bg)",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <div
        className="campus-main"
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        <div className="map-wrap" style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <CampusMap
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onBuildingClick={handleBuildingClick}
            userLocation={userLocation}
            directionsResult={directionsResult}
            routeOrigin={
              destination
                ? origin
                  ? { lat: origin.lat, lng: origin.lng }
                  : userLocation
                    ? { lat: userLocation.lat, lng: userLocation.lng }
                    : null
                : null
            }
            routeDestination={
              destination ? { lat: destination.lat, lng: destination.lng } : null
            }
            zoomTo={zoomTo}
            isDark={darkMode}
            followUser={isNavigating}
            mapCenter={campusCenter}
            mapZoom={16}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {userLocation && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin(null);
                    setZoomTo({ lat: userLocation.lat, lng: userLocation.lng, zoom: 18 });
                  }}
                  aria-label="Use my location as start point and center map"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    boxShadow: "0 2px 8px var(--shadow)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  📍 Use my location as start
                </button>
                <button
                  type="button"
                  onClick={() => setIsNavigating((n) => !n)}
                  aria-label={isNavigating ? "Stop navigation" : "Start navigation"}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: isNavigating ? "#dc2626" : "#22c55e",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px var(--shadow)",
                    cursor: "pointer",
                  }}
                >
                  {isNavigating ? "Stop" : "Start"}
                </button>
              </>
            )}
          </div>
        </div>

        <BuildingSidePanel
          building={selectedBuilding}
          buildings={buildings}
          userLocation={userLocation}
          origin={origin}
          destination={destination}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
          onSetOrigin={setOrigin}
          onSetDestination={setDestination}
          onGetDirections={getDirections}
          onClearRoute={clearRoute}
          routeDistance={routeDistance}
          routeDuration={routeDuration}
          isDark={darkMode}
        />
      </div>
    </div>
    </LoadScriptNext>
  );
}

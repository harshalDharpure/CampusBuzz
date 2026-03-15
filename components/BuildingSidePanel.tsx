"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Building } from "@/lib/types";
import { getDistanceFromLatLonInKm, formatDistance } from "@/lib/mapUtils";

export interface BuildingSidePanelProps {
  building: Building | null;
  buildings: Building[];
  userLocation: { lat: number; lng: number } | null;
  origin: Building | null;
  destination: Building | null;
  originLabel: string;
  destinationLabel: string;
  onSetOrigin: (building: Building | null) => void;
  onSetDestination: (building: Building | null) => void;
  onGetDirections: () => void;
  onClearRoute: () => void;
  routeDistance: string | null;
  routeDuration: string | null;
  isDark?: boolean;
}

const MY_LOCATION_VALUE = "__my_location__";

export default function BuildingSidePanel({
  building,
  buildings,
  userLocation,
  origin,
  destination,
  originLabel,
  destinationLabel,
  onSetOrigin,
  onSetDestination,
  onGetDirections,
  onClearRoute,
  routeDistance,
  routeDuration,
  isDark = false,
}: BuildingSidePanelProps) {
  const distanceFromUser = useMemo(() => {
    if (!building || !userLocation) return null;
    const km = getDistanceFromLatLonInKm(
      userLocation.lat,
      userLocation.lng,
      building.lat,
      building.lng
    );
    return formatDistance(km);
  }, [building, userLocation]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !building) return "";
    return `${window.location.origin}/?building=${building.id}`;
  }, [building]);

  const startValue = origin ? String(origin.id) : MY_LOCATION_VALUE;
  const destValue = destination ? String(destination.id) : "";

  const panelContent = (
    <>
      <section>
        <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase" }}>
          Plan your route
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
          Choose a starting point (set by campus admin), then your destination. The shortest walking path will be shown.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
              Starting point
            </label>
            <select
              value={startValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === MY_LOCATION_VALUE) onSetOrigin(null);
                else {
                  const b = buildings.find((x) => String(x.id) === v);
                  if (b) onSetOrigin(b);
                }
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                background: isDark ? "#1e293b" : "#fff",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            >
              {userLocation && <option value={MY_LOCATION_VALUE}>My location</option>}
              {buildings.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
              Destination
            </label>
            <select
              value={destValue}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) onSetDestination(null);
                else {
                  const b = buildings.find((x) => String(x.id) === v);
                  if (b) onSetDestination(b);
                }
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                background: isDark ? "#1e293b" : "#fff",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            >
              <option value="">Select destination</option>
              {buildings.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.name}</option>
              ))}
            </select>
          </div>
          {(routeDistance || routeDuration) && (
            <p style={{ fontSize: "13px", color: "var(--accent)" }}>
              {routeDistance && <span>{routeDistance}</span>}
              {routeDuration && <span> · {routeDuration}</span>}
            </p>
          )}
          <button
            type="button"
            onClick={onClearRoute}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            Clear route
          </button>
        </div>
      </section>
      {!building ? (
        <p style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
          Click a marker on the map or search for a building to see its details.
        </p>
      ) : (
      <>
      <div>
        <span
          style={{
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: "6px",
            background: isDark ? "#334155" : "#e2e8f0",
            color: isDark ? "#e2e8f0" : "#475569",
            fontSize: "12px",
            textTransform: "capitalize",
            marginBottom: "8px",
          }}
        >
          {building.category}
        </span>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>
          {building.name}
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {building.description}
        </p>
        {distanceFromUser && (
          <p style={{ fontSize: "13px", color: "var(--accent)", marginTop: "8px" }}>
            📍 {distanceFromUser} from your location
          </p>
        )}
      </div>

      {building.facilities && building.facilities.length > 0 && (
        <div>
          <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase" }}>
            Facilities
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {building.facilities.map((f) => (
              <span
                key={f}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: isDark ? "#334155" : "#f1f5f9",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingTop: "16px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase" }}>
          Navigation
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            type="button"
            onClick={() => onSetOrigin(building)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            Set as start: {originLabel || "Current location"}
          </button>
          <button
            type="button"
            onClick={() => onSetDestination(building)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            Set as destination: {destinationLabel || building.name}
          </button>
          {userLocation && (
            <button
              type="button"
              onClick={() => {
                onSetDestination(building);
                onGetDirections();
              }}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--accent)",
                background: "transparent",
                color: "var(--accent)",
                fontSize: "13px",
              }}
            >
              📍 Quick: Navigate from my location
            </button>
          )}
          <button
            type="button"
            onClick={onGetDirections}
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Get directions
          </button>
          {(routeDistance || routeDuration) && (
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {routeDistance && <span>Distance: {routeDistance}</span>}
              {routeDuration && <span> · Time: {routeDuration}</span>}
            </div>
          )}
          {(originLabel || destinationLabel) && (
            <button
              type="button"
              onClick={onClearRoute}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Clear route
            </button>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingTop: "16px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase" }}>
          QR Code
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
          Scan to open navigation for this building.
        </p>
        <div style={{ background: "#fff", padding: "12px", borderRadius: "8px", display: "inline-block" }}>
          <QRCodeSVG value={shareUrl} size={120} level="M" />
        </div>
      </div>
      </>
      )}
    </>
  );

  return (
    <aside
      className="side-panel"
      style={{
        width: "100%",
        maxWidth: "340px",
        background: isDark ? "#1e293b" : "#fff",
        borderLeft: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        padding: "20px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {panelContent}
    </aside>
  );
}

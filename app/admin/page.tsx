"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Building, BuildingCategory } from "@/lib/types";
import { getBuildings, setBuildings, clearBuildings } from "@/lib/buildingsStore";
import defaultBuildingsData from "@/data/buildings.json";

const DEFAULT_BUILDINGS: Building[] = defaultBuildingsData as Building[];
const CATEGORIES: BuildingCategory[] = [
  "library",
  "cafeteria",
  "labs",
  "hostel",
  "parking",
  "admin office",
];

function nextId(buildings: Building[]): number {
  return buildings.length > 0 ? Math.max(...buildings.map((b) => b.id)) + 1 : 1;
}

export default function AdminPage() {
  const [buildings, setBuildingsState] = useState<Building[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBuildingsState(getBuildings(DEFAULT_BUILDINGS));
  }, []);

  const updateBuilding = useCallback((index: number, updates: Partial<Building>) => {
    setBuildingsState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    setSaved(false);
  }, []);

  const addBuilding = useCallback(() => {
    setBuildingsState((prev) => [
      ...prev,
      {
        id: nextId(buildings),
        name: "New Building",
        lat: 18.52,
        lng: 73.8567,
        category: "admin office",
        description: "",
        facilities: [],
      },
    ]);
    setSaved(false);
  }, [buildings]);

  const removeBuilding = useCallback((index: number) => {
    setBuildingsState((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }, []);

  const useMyLocation = useCallback(
    (index: number) => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateBuilding(index, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => alert("Could not get your location. Check permissions.")
      );
    },
    [updateBuilding]
  );

  const saveAll = useCallback(() => {
    setBuildings(buildings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [buildings]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(buildings, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "buildings.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [buildings]);

  const importJson = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const list = Array.isArray(parsed) ? parsed : [];
        const withIds = list.map((b: Record<string, unknown>, i: number) => ({
          id: typeof b.id === "number" ? b.id : i + 1,
          name: String(b.name ?? "Building"),
          lat: Number(b.lat ?? 18.52),
          lng: Number(b.lng ?? 73.8567),
          category: (CATEGORIES.includes(b.category as BuildingCategory) ? b.category : "admin office") as BuildingCategory,
          description: String(b.description ?? ""),
          facilities: Array.isArray(b.facilities) ? b.facilities.map(String) : [],
          photo: b.photo != null ? String(b.photo) : undefined,
        }));
        setBuildingsState(withIds);
        setBuildings(withIds);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const resetToDefault = useCallback(() => {
    if (confirm("Replace all buildings with the default list?")) {
      clearBuildings();
      setBuildingsState(DEFAULT_BUILDINGS);
      setSaved(false);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <header
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card-bg)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "14px",
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back to Map
        </Link>
        <h1 style={{ fontSize: "20px", fontWeight: 700, marginLeft: "12px" }}>Admin — Campus Buildings</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={saveAll}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: saved ? "#22c55e" : "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {saved ? "Saved" : "Save all"}
          </button>
          <button
            type="button"
            onClick={exportJson}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
              color: "var(--text-primary)",
              fontSize: "14px",
            }}
          >
            Export JSON
          </button>
          <label style={{ cursor: "pointer" }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--card-bg)",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            >
              Import JSON
            </span>
            <input type="file" accept=".json" onChange={importJson} style={{ display: "none" }} />
          </label>
          <button
            type="button"
            onClick={resetToDefault}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            Reset to default
          </button>
        </div>
      </header>

      <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <p style={{ marginBottom: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>
          Set the latitude and longitude for each building. Use <strong>&quot;Use my location&quot;</strong> when you
          are at a building to fill its coordinates. Then go to the map and use your current location to get directions
          to any building.
        </p>

        <button
          type="button"
          onClick={addBuilding}
          style={{
            marginBottom: "20px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          + Add building
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {buildings.map((b, index) => (
            <div
              key={b.id}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "var(--card-bg)",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "start", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Name</label>
                  <input
                    value={b.name}
                    onChange={(e) => updateBuilding(index, { name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Category</label>
                  <select
                    value={b.category}
                    onChange={(e) => updateBuilding(index, { category: e.target.value as BuildingCategory })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => useMyLocation(index)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--accent)",
                      background: "transparent",
                      color: "var(--accent)",
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Use my location
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBuilding(index)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #dc2626",
                      background: "transparent",
                      color: "#dc2626",
                      fontSize: "13px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={b.lat}
                    onChange={(e) => updateBuilding(index, { lat: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={b.lng}
                    onChange={(e) => updateBuilding(index, { lng: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Description</label>
                <textarea
                  value={b.description}
                  onChange={(e) => updateBuilding(index, { description: e.target.value })}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Facilities (comma-separated)
                </label>
                <input
                  value={Array.isArray(b.facilities) ? b.facilities.join(", ") : ""}
                  onChange={(e) =>
                    updateBuilding(
                      index,
                      { facilities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }
                    )
                  }
                  placeholder="wifi, ac, study room"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

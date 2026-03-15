"use client";

import { useRef } from "react";
import type { Building } from "@/lib/types";

export interface SearchBoxProps {
  buildings: Building[];
  onPlaceSelect: (building: Building | null) => void;
  onZoomTo: (lat: number, lng: number, zoom?: number) => void;
  placeholder?: string;
  isDark?: boolean;
}

export default function SearchBox({
  buildings,
  onPlaceSelect,
  onZoomTo,
  placeholder = "Search buildings...",
  isDark = false,
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      onPlaceSelect(null);
      return;
    }
    const match = buildings.find(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.facilities.some((f) => f.toLowerCase().includes(q))
    );
    if (match) {
      onPlaceSelect(match);
      onZoomTo(match.lat, match.lng, 18);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onPlaceSelect(null);
      inputRef.current?.blur();
    }
  };

  return (
    <div style={{ position: "relative", flex: "1", maxWidth: "400px" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-label="Search buildings"
        style={{
          width: "100%",
          padding: "10px 14px 10px 40px",
          borderRadius: "10px",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          background: isDark ? "#1e293b" : "#fff",
          color: isDark ? "#f1f5f9" : "#0f172a",
          fontSize: "15px",
          outline: "none",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "18px",
          pointerEvents: "none",
        }}
      >
        🔍
      </span>
    </div>
  );
}

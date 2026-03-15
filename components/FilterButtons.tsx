"use client";

import type { BuildingCategory } from "@/lib/types";

const CATEGORIES: { value: BuildingCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "library", label: "Library" },
  { value: "cafeteria", label: "Cafeteria" },
  { value: "labs", label: "Labs" },
  { value: "hostel", label: "Hostel" },
  { value: "parking", label: "Parking" },
  { value: "admin office", label: "Admin" },
];

export interface FilterButtonsProps {
  activeFilter: BuildingCategory | "all";
  onFilterChange: (category: BuildingCategory | "all") => void;
  isDark?: boolean;
}

export default function FilterButtons({
  activeFilter,
  onFilterChange,
  isDark = false,
}: FilterButtonsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center",
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeFilter === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onFilterChange(cat.value)}
            aria-pressed={isActive}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              border: `1px solid ${isActive ? "#2563eb" : isDark ? "#334155" : "#e2e8f0"}`,
              background: isActive ? "#2563eb" : isDark ? "#1e293b" : "#fff",
              color: isActive ? "#fff" : isDark ? "#f1f5f9" : "#475569",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

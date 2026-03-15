import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { Building } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  let supabase;
  try {
    supabase = createServerClient();
  } catch {
    return NextResponse.json([]);
  }
  try {
    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const buildings: Building[] = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      category: row.category,
      description: row.description || "",
      facilities: Array.isArray(row.facilities) ? row.facilities : [],
      photo: row.photo ?? undefined,
    }));

    return NextResponse.json(buildings);
  } catch (err) {
    console.error("GET /api/buildings:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const buildings = body.buildings as Building[] | undefined;

    if (!Array.isArray(buildings)) {
      return NextResponse.json({ error: "Missing or invalid buildings array" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = createServerClient();
    } catch {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { error: deleteError } = await supabase.from("buildings").delete().gte("id", 0);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (buildings.length === 0) {
      return NextResponse.json([]);
    }

    const rows = buildings.map((b) => ({
      id: b.id,
      name: b.name,
      lat: b.lat,
      lng: b.lng,
      category: b.category,
      description: b.description || "",
      facilities: b.facilities || [],
      photo: b.photo ?? null,
    }));

    const { data, error } = await supabase.from("buildings").upsert(rows).select();

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result: Building[] = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      category: row.category,
      description: row.description || "",
      facilities: Array.isArray(row.facilities) ? row.facilities : [],
      photo: row.photo ?? undefined,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/buildings:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save buildings" },
      { status: 500 }
    );
  }
}

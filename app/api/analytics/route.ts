import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from") ?? new Date(Date.now() - 86400000).toISOString()
  const to = searchParams.get("to") ?? new Date().toISOString()

  // Event counts by type
  const { data: byType } = await supabaseAdmin
    .from("events")
    .select("type")
    .gte("timestamp", from)
    .lte("timestamp", to)

  // Active buses
  const { data: activeBuses } = await supabaseAdmin
    .from("buses")
    .select("bus_id")
    .eq("status", "active")

  // Total vehicle counts
  const { data: counts } = await supabaseAdmin
    .from("vehicle_counts")
    .select("total")
    .gte("timestamp", from)
    .lte("timestamp", to)

  const typeCounts = byType?.reduce((acc: Record<string, number>, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1
    return acc
  }, {})

  const totalVehicles = counts?.reduce((sum, row) => sum + row.total, 0) ?? 0

  return NextResponse.json({
    event_counts: typeCounts ?? {},
    active_buses: activeBuses?.length ?? 0,
    total_vehicles: totalVehicles,
  })
}

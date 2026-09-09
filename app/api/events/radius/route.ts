export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get("lat") ?? "0")
  const lng = parseFloat(searchParams.get("lng") ?? "0")
  const radius = parseInt(searchParams.get("radius") ?? "500") // metres

  const { data, error } = await supabaseAdmin.rpc("events_within_radius", {
    center_lat: lat,
    center_lng: lng,
    radius_metres: radius,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

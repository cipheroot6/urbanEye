export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { IngestSchema } from "@/lib/validations/ingest"
import { supabaseAdmin } from "@/lib/db"
import { pusherServer } from "@/lib/pusher/server"
import { uploadCrop } from "@/lib/cloudinary"
import { PUSHER_CHANNEL, PUSHER_EVENTS, INCIDENT_TYPES } from "@/lib/constants"

export async function POST(req: NextRequest) {
  // Auth check — edge agent must pass the shared secret
  const authHeader = req.headers.get("x-api-secret")
  if (authHeader !== process.env.INGEST_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = IngestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { bus_id, timestamp, gps, detections } = parsed.data

  // Upsert bus record and update last position
  await supabaseAdmin.from("buses").upsert({
    bus_id,
    status: "active",
    last_lat: gps.lat,
    last_lng: gps.lng,
    last_seen: timestamp,
  }, { onConflict: "bus_id" })

  // Trigger bus-location Pusher event
  await pusherServer.trigger(PUSHER_CHANNEL, PUSHER_EVENTS.BUS_LOCATION, {
    bus_id,
    lat: gps.lat,
    lng: gps.lng,
    timestamp,
  })

  // Process each detection
  for (const detection of detections) {
    if (detection.type === "vehicle_count") {
      // Insert into vehicle_counts
      await supabaseAdmin.from("vehicle_counts").insert({
        bus_id,
        timestamp,
        lat: gps.lat,
        lng: gps.lng,
        car: 0,
        truck: 0,
        bus: 0,
        two_wheeler: 0,
        total: 0,
        // actual counts would come from a structured count payload — extend as needed
      })

      await pusherServer.trigger(PUSHER_CHANNEL, PUSHER_EVENTS.VEHICLE_COUNT, {
        bus_id,
        lat: gps.lat,
        lng: gps.lng,
        timestamp,
      })
      continue
    }

    // Upload crop image if present
    let crop_url: string | null = null
    if (detection.crop_b64) {
      try {
        crop_url = await uploadCrop(detection.crop_b64, bus_id)
      } catch {
        // Non-fatal — continue without crop
      }
    }

    // Insert event
    const { data: event } = await supabaseAdmin.from("events").insert({
      bus_id,
      timestamp,
      type: detection.type,
      confidence: detection.confidence,
      camera: detection.camera,
      lat: gps.lat,
      lng: gps.lng,
      plate: detection.plate ?? null,
      plate_confidence: detection.plate_confidence ?? null,
      crop_url,
    }).select().single()

    // Trigger Pusher for incidents (high-priority real-time alert)
    if (INCIDENT_TYPES.includes(detection.type)) {
      await pusherServer.trigger(PUSHER_CHANNEL, PUSHER_EVENTS.NEW_INCIDENT, {
        ...event,
      })
    }
  }

  return NextResponse.json({ ok: true })
}

# UrbanEye — End to End Build Plan

Everything you need to build UrbanEye from zero to deployed. Follow steps in order — each phase depends on the previous one.

---

## Phase 0 — Prerequisites

Before touching code make sure you have accounts on all these services. All free tiers unless noted.

- GitHub account (you already have one)
- Vercel account — vercel.com, sign up with GitHub
- Supabase account — supabase.com, sign up with GitHub (PostgreSQL + PostGIS + TimescaleDB)
- Pusher account — pusher.com, sign up with GitHub (Channels free tier: 200k messages/day)
- Cloudinary account — cloudinary.com, sign up with GitHub (for storing detection crop images)

Local machine requirements:
- Node.js 20+ installed
- Python 3.11+ installed (for edge agent)
- Git configured

---

## Phase 1 — Project Setup

### 1.1 Bootstrap Next.js

```bash
npx create-next-app@16 urbaneye
```

When prompted:
- TypeScript → Yes
- ESLint → Yes
- Tailwind CSS → Yes
- src/ directory → No
- App Router → Yes
- Import alias → Yes, keep default `@/*`

```bash
cd urbaneye
```

### 1.2 Install all dependencies upfront

```bash
npm install @supabase/supabase-js
npm install pusher-js
npm install react-leaflet leaflet
npm install @deck.gl/react @deck.gl/layers @deck.gl/aggregation-layers
npm install recharts
npm install date-fns
npm install lucide-react
npm install clsx tailwind-merge
npm install zod
npm install --save-dev @types/leaflet
npm install --save-dev @types/node
```

### 1.3 Install shadcn/ui

```bash
npx shadcn@latest init
```

When prompted choose:
- Style → Default
- Base color → Slate (works well for dark command-center dashboards)
- CSS variables → Yes

Then add the components you will need:

```bash
npx shadcn@latest add button card input label select textarea badge
npx shadcn@latest add dialog dropdown-menu sheet tabs
npx shadcn@latest add avatar separator skeleton
npx shadcn@latest add table alert
```

### 1.4 Set up folder structure

```bash
mkdir -p app/(dashboard)/dashboard
mkdir -p app/(dashboard)/map
mkdir -p app/(dashboard)/incidents
mkdir -p app/(dashboard)/analytics
mkdir -p app/(dashboard)/buses
mkdir -p app/(dashboard)/reports
mkdir -p app/api/ingest
mkdir -p app/api/events
mkdir -p app/api/buses
mkdir -p app/api/analytics
mkdir -p components/map
mkdir -p components/incidents
mkdir -p components/analytics
mkdir -p components/buses
mkdir -p components/shared
mkdir -p lib/db
mkdir -p lib/pusher
mkdir -p lib/cloudinary
mkdir -p lib/validations
mkdir -p types
mkdir -p hooks
mkdir -p edge-agent
```

### 1.5 Create .env.local

```bash
touch .env.local .env.example
```

Paste this into `.env.local` and fill values as you complete each phase:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Ingest auth (shared secret between edge agent and API)
INGEST_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Copy the same into `.env.example` but leave all values empty. Commit `.env.example`, never commit `.env.local`.

Add to `.gitignore`:
```
.env.local
.env*.local
```

### 1.6 Create lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(iso))
}

export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

export function confidenceBadgeColor(score: number): string {
  if (score >= 0.85) return "bg-green-500"
  if (score >= 0.65) return "bg-yellow-500"
  return "bg-red-500"
}
```

### 1.7 Create types/index.ts

```typescript
export type DetectionType =
  | "pothole"
  | "damaged_road"
  | "missing_divider"
  | "missing_zebra"
  | "damaged_signboard"
  | "waterlogging"
  | "vehicle_incident"
  | "rash_driving"
  | "pedestrian_risk"
  | "vehicle_count"

export type CameraPosition = "front" | "rear" | "left" | "right" | "cabin"

export type Detection = {
  type: DetectionType
  confidence: number
  camera: CameraPosition
  bbox: [number, number, number, number]
  plate?: string
  plate_confidence?: number
  crop_b64?: string
}

export type IngestPayload = {
  bus_id: string
  timestamp: string
  gps: { lat: number; lng: number }
  detections: Detection[]
}

export type EventRow = {
  id: string
  bus_id: string
  timestamp: string
  type: DetectionType
  confidence: number
  camera: CameraPosition
  lat: number
  lng: number
  plate: string | null
  plate_confidence: number | null
  crop_url: string | null
  created_at: string
}

export type BusRow = {
  id: string
  bus_id: string
  route_id: string | null
  status: "active" | "idle" | "offline"
  last_lat: number | null
  last_lng: number | null
  last_seen: string | null
}

export type VehicleCountRow = {
  id: string
  bus_id: string
  timestamp: string
  lat: number
  lng: number
  car: number
  truck: number
  bus: number
  two_wheeler: number
  total: number
}
```

### 1.8 Create lib/constants.ts

```typescript
export const DETECTION_LABELS: Record<string, string> = {
  pothole: "Pothole",
  damaged_road: "Damaged Road",
  missing_divider: "Missing Divider",
  missing_zebra: "Missing Zebra Crossing",
  damaged_signboard: "Damaged Signboard",
  waterlogging: "Waterlogging",
  vehicle_incident: "Vehicle Incident",
  rash_driving: "Rash Driving",
  pedestrian_risk: "Pedestrian Risk",
  vehicle_count: "Vehicle Count",
}

export const DETECTION_COLORS: Record<string, string> = {
  pothole: "#ef4444",
  damaged_road: "#f97316",
  missing_divider: "#eab308",
  missing_zebra: "#a855f7",
  damaged_signboard: "#6366f1",
  waterlogging: "#3b82f6",
  vehicle_incident: "#dc2626",
  rash_driving: "#dc2626",
  pedestrian_risk: "#ec4899",
  vehicle_count: "#22c55e",
}

export const INFRASTRUCTURE_TYPES = [
  "pothole",
  "damaged_road",
  "missing_divider",
  "missing_zebra",
  "damaged_signboard",
  "waterlogging",
]

export const INCIDENT_TYPES = [
  "vehicle_incident",
  "rash_driving",
  "pedestrian_risk",
]

export const PUSHER_CHANNEL = "city-feed"

export const PUSHER_EVENTS = {
  NEW_INCIDENT: "new-incident",
  VEHICLE_COUNT: "vehicle-count",
  BUS_LOCATION: "bus-location",
} as const
```

---

## Phase 2 — Database (Supabase)

### 2.1 Create Supabase project

- Go to supabase.com → New Project → name it `urbaneye`
- Choose region closest to your deployment (ap-south-1 for India)
- Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the service role key → `SUPABASE_SERVICE_ROLE_KEY`

### 2.2 Enable PostGIS

In the Supabase dashboard go to SQL Editor and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 2.3 Create the full schema

Run this in the Supabase SQL Editor:

```sql
-- Enum types
CREATE TYPE detection_type AS ENUM (
  'pothole', 'damaged_road', 'missing_divider', 'missing_zebra',
  'damaged_signboard', 'waterlogging', 'vehicle_incident',
  'rash_driving', 'pedestrian_risk', 'vehicle_count'
);

CREATE TYPE camera_position AS ENUM ('front', 'rear', 'left', 'right', 'cabin');
CREATE TYPE bus_status AS ENUM ('active', 'idle', 'offline');

-- Buses registry
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id TEXT NOT NULL UNIQUE,
  route_id TEXT,
  status bus_status NOT NULL DEFAULT 'offline',
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events (all detections except vehicle counts)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id TEXT NOT NULL REFERENCES buses(bus_id),
  timestamp TIMESTAMPTZ NOT NULL,
  type detection_type NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  camera camera_position NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  ) STORED,
  plate TEXT,
  plate_confidence DOUBLE PRECISION,
  crop_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicle counts (time-series)
CREATE TABLE vehicle_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id TEXT NOT NULL REFERENCES buses(bus_id),
  timestamp TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location GEOMETRY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  ) STORED,
  car INTEGER NOT NULL DEFAULT 0,
  truck INTEGER NOT NULL DEFAULT 0,
  bus INTEGER NOT NULL DEFAULT 0,
  two_wheeler INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for geo queries and time filtering
CREATE INDEX events_location_idx ON events USING GIST (location);
CREATE INDEX events_type_idx ON events (type);
CREATE INDEX events_timestamp_idx ON events (timestamp DESC);
CREATE INDEX events_bus_id_idx ON events (bus_id);
CREATE INDEX vehicle_counts_location_idx ON vehicle_counts USING GIST (location);
CREATE INDEX vehicle_counts_timestamp_idx ON vehicle_counts (timestamp DESC);
```

### 2.4 Create Supabase client

Create `lib/db/index.ts`:

```typescript
import { createClient } from "@supabase/supabase-js"

// Client-side (uses anon key — respects RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side (uses service role — bypasses RLS, only use in API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 2.5 Verify tables

In Supabase dashboard go to Table Editor and confirm `buses`, `events`, `vehicle_counts` are all visible with the correct columns.

---

## Phase 3 — Pusher Setup

### 3.1 Create Pusher app

- Go to pusher.com → Create App
- Name: `urbaneye`
- Cluster: `ap2` (closest to India)
- Copy App ID → `PUSHER_APP_ID`
- Copy Key → `PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_KEY`
- Copy Secret → `PUSHER_SECRET`
- Copy Cluster → `PUSHER_CLUSTER` and `NEXT_PUBLIC_PUSHER_CLUSTER`

### 3.2 Create server-side Pusher client

Create `lib/pusher/server.ts`:

```typescript
import Pusher from "pusher"

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})
```

Install the server-side package:

```bash
npm install pusher
```

### 3.3 Create client-side Pusher hook

Create `hooks/usePusher.ts`:

```typescript
"use client"

import { useEffect, useRef } from "react"
import Pusher from "pusher-js"
import { PUSHER_CHANNEL } from "@/lib/constants"

type Handler = (data: unknown) => void

export function usePusher(event: string, handler: Handler) {
  const pusherRef = useRef<Pusher | null>(null)

  useEffect(() => {
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusherRef.current.subscribe(PUSHER_CHANNEL)
    channel.bind(event, handler)

    return () => {
      channel.unbind(event, handler)
      pusherRef.current?.unsubscribe(PUSHER_CHANNEL)
      pusherRef.current?.disconnect()
    }
  }, [event, handler])
}
```

---

## Phase 4 — Cloudinary Setup

### 4.1 Get credentials

- Go to cloudinary.com → Dashboard
- Copy Cloud Name → `CLOUDINARY_CLOUD_NAME`
- Copy API Key → `CLOUDINARY_API_KEY`
- Copy API Secret → `CLOUDINARY_API_SECRET`

### 4.2 Create upload helper

Install the SDK:

```bash
npm install cloudinary
```

Create `lib/cloudinary/index.ts`:

```typescript
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadCrop(base64: string, busId: string): Promise<string> {
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${base64}`,
    {
      folder: `urbaneye/${busId}`,
      resource_type: "image",
    }
  )
  return result.secure_url
}
```

---

## Phase 5 — Ingest API Route

This is the most critical route — it receives POST requests from the edge agent, validates the payload, writes to Supabase, and triggers Pusher events.

### 5.1 Create the validation schema

Create `lib/validations/ingest.ts`:

```typescript
import { z } from "zod"

const DetectionSchema = z.object({
  type: z.enum([
    "pothole", "damaged_road", "missing_divider", "missing_zebra",
    "damaged_signboard", "waterlogging", "vehicle_incident",
    "rash_driving", "pedestrian_risk", "vehicle_count",
  ]),
  confidence: z.number().min(0).max(1),
  camera: z.enum(["front", "rear", "left", "right", "cabin"]),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  plate: z.string().optional(),
  plate_confidence: z.number().min(0).max(1).optional(),
  crop_b64: z.string().optional(),
})

export const IngestSchema = z.object({
  bus_id: z.string().min(1),
  timestamp: z.string().datetime(),
  gps: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  detections: z.array(DetectionSchema).min(1),
})

export type IngestPayload = z.infer<typeof IngestSchema>
```

### 5.2 Create the ingest route

Create `app/api/ingest/route.ts`:

```typescript
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
```

### 5.3 Generate a shared secret

```bash
openssl rand -hex 32
```

Paste into `INGEST_API_SECRET` in `.env.local`.

---

## Phase 6 — Events API Routes

### 6.1 List recent events

Create `app/api/events/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  let query = supabaseAdmin
    .from("events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit)

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

### 6.2 Events within a geo radius

Create `app/api/events/radius/route.ts`:

```typescript
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
```

Add the Supabase function in the SQL editor:

```sql
CREATE OR REPLACE FUNCTION events_within_radius(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_metres INTEGER
)
RETURNS SETOF events AS $$
  SELECT * FROM events
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
    radius_metres
  )
  ORDER BY timestamp DESC;
$$ LANGUAGE sql;
```

---

## Phase 7 — Bus Registry API

Create `app/api/buses/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/db"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("buses")
    .select("*")
    .order("last_seen", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

---

## Phase 8 — Analytics API

Create `app/api/analytics/route.ts`:

```typescript
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
```

---

## Phase 9 — Map Components

### 9.1 Leaflet CSS

In `app/layout.tsx` add the Leaflet CSS import:

```typescript
import "leaflet/dist/leaflet.css"
```

Fix the Leaflet default icon bug (Next.js SSR issue). Create `lib/leaflet-fix.ts`:

```typescript
import L from "leaflet"
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"

export function fixLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl.src,
    iconUrl: iconUrl.src,
    shadowUrl: shadowUrl.src,
  })
}
```

### 9.2 Base map component

Create `components/map/BaseMap.tsx`:

```typescript
"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer } from "react-leaflet"
import { fixLeafletIcons } from "@/lib/leaflet-fix"

type Props = {
  children?: React.ReactNode
  center?: [number, number]
  zoom?: number
}

// Default center — Pune, India
const DEFAULT_CENTER: [number, number] = [18.5204, 73.8567]

export function BaseMap({ children, center = DEFAULT_CENTER, zoom = 13 }: Props) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}
```

Since Leaflet needs the DOM, wrap map pages with dynamic import and no SSR:

```typescript
// In any page that uses a map:
import dynamic from "next/dynamic"

const LiveMap = dynamic(() => import("@/components/map/LiveMap").then(m => m.LiveMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-lg" />,
})
```

### 9.3 Event markers component

Create `components/map/EventMarkers.tsx`:

```typescript
"use client"

import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { DETECTION_COLORS, DETECTION_LABELS } from "@/lib/constants"
import { formatTimestamp } from "@/lib/utils"
import type { EventRow } from "@/types"

function coloredIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

type Props = { events: EventRow[] }

export function EventMarkers({ events }: Props) {
  return (
    <>
      {events.map((e) => (
        <Marker
          key={e.id}
          position={[e.lat, e.lng]}
          icon={coloredIcon(DETECTION_COLORS[e.type] ?? "#888")}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-semibold">{DETECTION_LABELS[e.type]}</p>
              <p>Bus: {e.bus_id}</p>
              <p>Confidence: {(e.confidence * 100).toFixed(1)}%</p>
              {e.plate && <p>Plate: {e.plate}</p>}
              <p className="text-xs text-muted-foreground">{formatTimestamp(e.timestamp)}</p>
              {e.crop_url && (
                <img src={e.crop_url} alt="crop" className="w-32 rounded mt-1" />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
```

### 9.4 Live map with Pusher

Create `components/map/LiveMap.tsx`:

```typescript
"use client"

import { useState, useCallback } from "react"
import { BaseMap } from "./BaseMap"
import { EventMarkers } from "./EventMarkers"
import { usePusher } from "@/hooks/usePusher"
import { PUSHER_EVENTS } from "@/lib/constants"
import type { EventRow } from "@/types"

type Props = { initialEvents: EventRow[] }

export function LiveMap({ initialEvents }: Props) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents)

  const onNewIncident = useCallback((data: unknown) => {
    const event = data as EventRow
    setEvents((prev) => [event, ...prev].slice(0, 200)) // keep last 200
  }, [])

  usePusher(PUSHER_EVENTS.NEW_INCIDENT, onNewIncident)

  return (
    <div className="h-full w-full">
      <BaseMap>
        <EventMarkers events={events} />
      </BaseMap>
    </div>
  )
}
```

---

## Phase 10 — Heatmap with deck.gl

Create `components/map/HeatmapLayer.tsx`:

```typescript
"use client"

import { useEffect, useRef } from "react"
import { DeckGL } from "@deck.gl/react"
import { HeatmapLayer } from "@deck.gl/aggregation-layers"
import { Map } from "react-map-gl"
import type { EventRow } from "@/types"

type Props = { events: EventRow[] }

const INITIAL_VIEW = {
  latitude: 18.5204,
  longitude: 73.8567,
  zoom: 12,
  pitch: 0,
  bearing: 0,
}

export function CongestHeatmap({ events }: Props) {
  const layer = new HeatmapLayer({
    id: "event-heatmap",
    data: events,
    getPosition: (d: EventRow) => [d.lng, d.lat],
    getWeight: (d: EventRow) => d.confidence,
    radiusPixels: 40,
  })

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW}
      controller
      layers={[layer]}
      style={{ height: "100%", width: "100%" }}
    >
      <Map
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      />
    </DeckGL>
  )
}
```

---

## Phase 11 — Dashboard Pages

### 11.1 Dashboard layout

Create `app/(dashboard)/layout.tsx`:

```typescript
import { Sidebar } from "@/components/shared/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
```

### 11.2 Sidebar

Create `components/shared/Sidebar.tsx`:

```typescript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, AlertTriangle, BarChart2, Bus, FileText, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/buses", label: "Bus Fleet", icon: Bus },
  { href: "/reports", label: "Reports", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 border-r bg-card flex flex-col p-4 gap-1">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-bold tracking-tight">UrbanEye</h1>
        <p className="text-xs text-muted-foreground">Urban Intelligence Platform</p>
      </div>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </aside>
  )
}
```

### 11.3 Overview page

`app/(dashboard)/dashboard/page.tsx`:
- KPI cards: Total events today, Active buses, Incidents last hour, Vehicles counted
- Recent incidents table (last 10)
- Mini live map (h-64)
- Event breakdown bar chart (Recharts)

### 11.4 Live map page

`app/(dashboard)/map/page.tsx`:
- Full-height LiveMap component
- Filter panel on the right: filter by detection type, toggle heatmap vs markers
- Legend panel at bottom-left

### 11.5 Incidents page

`app/(dashboard)/incidents/page.tsx`:
- Table of `vehicle_incident` and `rash_driving` events
- Columns: timestamp, bus_id, plate (with confidence), GPS coords, camera, crop thumbnail
- Click a row to expand and see crop image full-size

### 11.6 Analytics page

`app/(dashboard)/analytics/page.tsx`:
- Date range picker (from/to)
- Event counts by type — horizontal bar chart
- Vehicles counted over time — line chart
- Road defect frequency map — heatmap deck.gl overlay

### 11.7 Bus fleet page

`app/(dashboard)/buses/page.tsx`:
- Table of all buses: bus_id, route_id, status badge, last seen, last coords
- Status: active (green), idle (yellow), offline (red)

### 11.8 Reports page

`app/(dashboard)/reports/page.tsx`:
- Export events as CSV filtered by date range and type
- "Generate Report" button that assembles a summary object and downloads as JSON
- Print-friendly HTML report view

---

## Phase 12 — Edge Agent (Python)

The edge agent is a Python service that runs on the bus's onboard computer. It receives detection results from the CV pipeline (handled by the hardware team), packages them, and POSTs to the Vercel ingest API.

### 12.1 Set up Python environment

```bash
cd edge-agent
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install httpx python-dotenv
```

### 12.2 Create .env for edge agent

```bash
touch .env
```

```env
INGEST_URL=https://your-app.vercel.app/api/ingest
INGEST_API_SECRET=your_shared_secret_here
BUS_ID=MH12-BUS-042
GPS_SERIAL_PORT=/dev/ttyUSB0
```

### 12.3 GPS reader

Create `edge-agent/gps.py`:

```python
import serial
import pynmea2

def get_gps_coords(port: str = "/dev/ttyUSB0", baudrate: int = 9600) -> dict:
    """Read one valid GPRMC sentence from GPS module and return lat/lng."""
    try:
        with serial.Serial(port, baudrate, timeout=2) as ser:
            for _ in range(20):
                line = ser.readline().decode("ascii", errors="replace").strip()
                if line.startswith("$GPRMC") or line.startswith("$GNRMC"):
                    msg = pynmea2.parse(line)
                    if msg.status == "A":  # A = valid fix
                        return {"lat": msg.latitude, "lng": msg.longitude}
    except Exception:
        pass
    # Fallback — return last known or default
    return {"lat": 18.5204, "lng": 73.8567}
```

Install serial deps:

```bash
pip install pyserial pynmea2
```

### 12.4 Main agent

Create `edge-agent/agent.py`:

```python
import os
import time
import httpx
from datetime import datetime, timezone
from dotenv import load_dotenv
from gps import get_gps_coords

load_dotenv()

INGEST_URL = os.environ["INGEST_URL"]
API_SECRET = os.environ["INGEST_API_SECRET"]
BUS_ID = os.environ["BUS_ID"]

def send_payload(detections: list[dict]) -> bool:
    """Package detections and POST to central ingest API."""
    if not detections:
        return False

    payload = {
        "bus_id": BUS_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "gps": get_gps_coords(),
        "detections": detections,
    }

    try:
        response = httpx.post(
            INGEST_URL,
            json=payload,
            headers={"x-api-secret": API_SECRET},
            timeout=5.0,
        )
        response.raise_for_status()
        print(f"[OK] Sent {len(detections)} detections")
        return True
    except Exception as e:
        print(f"[ERR] Failed to send: {e}")
        return False


def format_detection(
    det_type: str,
    confidence: float,
    camera: str,
    bbox: list,
    plate: str | None = None,
    plate_confidence: float | None = None,
    crop_b64: str | None = None,
) -> dict:
    """Helper for the CV pipeline to build a detection dict."""
    d: dict = {
        "type": det_type,
        "confidence": confidence,
        "camera": camera,
        "bbox": bbox,
    }
    if plate:
        d["plate"] = plate
    if plate_confidence is not None:
        d["plate_confidence"] = plate_confidence
    if crop_b64:
        d["crop_b64"] = crop_b64
    return d


# ── Integration point ──────────────────────────────────────────────────────────
# The CV pipeline (YOLOv8 + PaddleOCR) calls collect_and_send() once per frame
# batch, passing a list of detections built with format_detection() above.

def collect_and_send(detections: list[dict]):
    """Called by CV pipeline. Batches and sends."""
    send_payload(detections)


if __name__ == "__main__":
    # Smoke test — send a synthetic detection
    test = [format_detection("pothole", 0.91, "front", [120, 340, 280, 420])]
    send_payload(test)
```

### 12.5 Requirements file

Create `edge-agent/requirements.txt`:

```
httpx==0.27.0
python-dotenv==1.0.1
pyserial==3.5
pynmea2==1.19.0
```

---

## Phase 13 — Deployment

### 13.1 Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/urbaneye
git push -u origin main
```

### 13.2 Deploy to Vercel

- Go to vercel.com → New Project → Import your GitHub repo
- Vercel auto-detects Next.js — no config needed
- Add all environment variables from `.env.local` in the Vercel dashboard
- Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
- Deploy

### 13.3 Update edge agent .env

On the bus computer update:

```env
INGEST_URL=https://your-app.vercel.app/api/ingest
```

### 13.4 Final checks before going live

- [ ] All env vars set in Vercel dashboard
- [ ] Supabase PostGIS extension enabled
- [ ] `events_within_radius` Supabase function created
- [ ] Ingest route returns 200 for a valid test payload
- [ ] Ingest route returns 401 when `x-api-secret` is wrong or missing
- [ ] Ingest route returns 400 for a malformed payload
- [ ] Pusher events firing — check Pusher debug console
- [ ] Live map updates in real time when a test payload is sent
- [ ] Cloudinary crop upload working (check Cloudinary media library)
- [ ] Bus registry upserts correctly (last_lat, last_lng, last_seen update each ingest)
- [ ] Events table has PostGIS geometry column populated
- [ ] Radius query function returns correct results
- [ ] Heatmap renders with real event data
- [ ] Incident popups show crop image where available
- [ ] All map pages use dynamic import (ssr: false)
- [ ] Mobile responsive on all dashboard pages
- [ ] Edge agent smoke test sends a payload and it appears on the live map

---

## Build Order Summary

| Phase | What | Why first |
|---|---|---|
| 0 | Prerequisites | Accounts and tools |
| 1 | Project setup | Foundation |
| 2 | Database schema | Everything reads and writes here |
| 3 | Pusher setup | Real-time depends on this |
| 4 | Cloudinary | Crop storage before ingest |
| 5 | Ingest API | Core data pipeline — validates, stores, pushes |
| 6 | Events API | Dashboard reads from here |
| 7 | Bus registry API | Fleet status reads |
| 8 | Analytics API | Aggregated queries |
| 9 | Map components | Needs events API to exist |
| 10 | Heatmap | Needs events data |
| 11 | Dashboard pages | Built on all APIs and components |
| 12 | Edge agent | Needs deployed ingest endpoint |
| 13 | Deployment | Ship everything |

---

*Follow phases in order. Do not skip ahead. Each phase assumes the previous one is working.*

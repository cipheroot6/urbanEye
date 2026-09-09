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

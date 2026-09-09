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

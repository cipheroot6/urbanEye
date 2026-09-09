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

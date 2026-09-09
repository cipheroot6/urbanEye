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

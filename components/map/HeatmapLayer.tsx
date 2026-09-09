"use client"

import { useEffect, useRef } from "react"
import { DeckGL } from "@deck.gl/react"
import { HeatmapLayer } from "@deck.gl/aggregation-layers"
import Map from "react-map-gl/maplibre"
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

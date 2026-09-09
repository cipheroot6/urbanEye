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

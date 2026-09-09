"use client"
import dynamic from "next/dynamic"

export const CongestHeatmap = dynamic(() => import("@/components/map/HeatmapLayer").then(m => m.CongestHeatmap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-lg" />,
})

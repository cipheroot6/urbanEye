"use client"
import dynamic from "next/dynamic"

export const LiveMap = dynamic(() => import("@/components/map/LiveMap").then(m => m.LiveMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-lg" />,
})

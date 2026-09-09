import dynamic from "next/dynamic"

const LiveMap = dynamic(() => import("@/components/map/LiveMap").then(m => m.LiveMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-lg" />,
})

export default function MapPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Live Map</h1>
      <div className="flex-1 rounded-xl border overflow-hidden relative">
        <LiveMap initialEvents={[]} />
      </div>
    </div>
  )
}

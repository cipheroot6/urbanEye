import { LiveMap } from "@/components/map/LiveMapWrapper"




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

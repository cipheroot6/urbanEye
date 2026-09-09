import dynamic from "next/dynamic"

const LiveMap = dynamic(() => import("@/components/map/LiveMap").then(m => m.LiveMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-lg" />,
})

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Total Events Today</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Active Buses</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Incidents Last Hour</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Vehicles Counted</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl bg-card p-4 h-96 flex flex-col">
          <h2 className="font-semibold mb-4">Live Map</h2>
          <div className="flex-1 rounded-lg overflow-hidden relative">
            <LiveMap initialEvents={[]} />
          </div>
        </div>
        
        <div className="border rounded-xl bg-card p-4 flex flex-col">
          <h2 className="font-semibold mb-4">Recent Incidents</h2>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No incidents to display
          </div>
        </div>
      </div>
    </div>
  )
}

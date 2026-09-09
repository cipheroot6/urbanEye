import dynamic from "next/dynamic"

const CongestHeatmap = dynamic(() => import("@/components/map/HeatmapLayer").then(m => m.CongestHeatmap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted rounded-lg" />,
})

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl bg-card p-4 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Event counts bar chart</p>
        </div>
        <div className="border rounded-xl bg-card p-4 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Vehicle counts line chart</p>
        </div>
      </div>

      <div className="border rounded-xl bg-card p-4 h-96 flex flex-col">
        <h2 className="font-semibold mb-4">Defect Frequency Heatmap</h2>
        <div className="flex-1 rounded-lg overflow-hidden relative">
          <CongestHeatmap events={[]} />
        </div>
      </div>
    </div>
  )
}

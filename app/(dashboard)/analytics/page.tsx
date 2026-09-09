import { supabaseAdmin } from "@/lib/db"
import { CongestHeatmap } from "@/components/map/HeatmapWrapper"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage(props: { searchParams: Promise<{ from?: string, to?: string }> }) {
  const searchParams = await props.searchParams
  const from = searchParams.from ?? new Date(Date.now() - 7 * 86400000).toISOString() // default 7 days
  const to = searchParams.to ?? new Date().toISOString()

  // Fetch events for heatmap and counts
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("*")
    .gte("timestamp", from)
    .lte("timestamp", to)
    .order("timestamp", { ascending: false })

  const eventCounts = (events ?? []).reduce((acc: Record<string, number>, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1
    return acc
  }, {})

  // Fetch vehicle counts for line chart
  const { data: vehicleCounts } = await supabaseAdmin
    .from("vehicle_counts")
    .select("timestamp, total")
    .gte("timestamp", from)
    .lte("timestamp", to)
    .order("timestamp", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          Last 7 Days (Default view)
        </div>
      </div>
      
      <AnalyticsCharts eventCounts={eventCounts} vehicleCounts={vehicleCounts ?? []} />

      <div className="border rounded-xl bg-card p-4 h-96 flex flex-col">
        <h2 className="font-semibold mb-4">Defect Frequency Heatmap</h2>
        <div className="flex-1 rounded-lg overflow-hidden relative">
          <CongestHeatmap events={events ?? []} />
        </div>
      </div>
    </div>
  )
}

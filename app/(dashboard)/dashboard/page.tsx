import { LiveMap } from "@/components/map/LiveMapWrapper"
import { supabaseAdmin } from "@/lib/db"
import { EventRow } from "@/types"
import { formatTimestamp, confidenceBadgeColor } from "@/lib/utils"
import { DETECTION_LABELS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // 1. Fetch KPI Data
  // Today's date boundary
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const from = startOfDay.toISOString()

  // Total Events Today
  const { count: eventsToday } = await supabaseAdmin
    .from("events")
    .select("*", { count: "exact", head: true })
    .gte("timestamp", from)

  // Active Buses
  const { count: activeBuses } = await supabaseAdmin
    .from("buses")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  // Incidents Last Hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count: incidentsLastHour } = await supabaseAdmin
    .from("events")
    .select("*", { count: "exact", head: true })
    .gte("timestamp", oneHourAgo)
    .in("type", ["vehicle_incident", "rash_driving", "pedestrian_risk"])

  // Vehicles Counted Today
  const { data: vehicleCounts } = await supabaseAdmin
    .from("vehicle_counts")
    .select("total")
    .gte("timestamp", from)
  const totalVehicles = vehicleCounts?.reduce((sum, row) => sum + row.total, 0) ?? 0

  // 2. Fetch Recent Incidents
  const { data: recentEvents } = await supabaseAdmin
    .from("events")
    .select("*")
    .in("type", ["vehicle_incident", "rash_driving", "pedestrian_risk"])
    .order("timestamp", { ascending: false })
    .limit(10)

  // 3. Fetch Map Initial Data
  const { data: initialEvents } = await supabaseAdmin
    .from("events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Total Events Today</p>
          <p className="text-2xl font-bold">{eventsToday ?? 0}</p>
        </div>
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Active Buses</p>
          <p className="text-2xl font-bold">{activeBuses ?? 0}</p>
        </div>
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Incidents Last Hour</p>
          <p className="text-2xl font-bold">{incidentsLastHour ?? 0}</p>
        </div>
        <div className="p-4 border rounded-xl bg-card">
          <p className="text-sm text-muted-foreground">Vehicles Counted</p>
          <p className="text-2xl font-bold">{totalVehicles}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl bg-card p-4 h-[500px] flex flex-col">
          <h2 className="font-semibold mb-4">Live Map</h2>
          <div className="flex-1 rounded-lg overflow-hidden relative">
            <LiveMap initialEvents={initialEvents ?? []} />
          </div>
        </div>
        
        <div className="border rounded-xl bg-card flex flex-col overflow-hidden h-[500px]">
          <h2 className="font-semibold p-4 border-b">Recent Incidents</h2>
          <div className="flex-1 overflow-auto">
            {recentEvents && recentEvents.length > 0 ? (
              <div className="divide-y">
                {recentEvents.map((event) => (
                  <div key={event.id} className="p-4 flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {DETECTION_LABELS[event.type] ?? event.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Bus: {event.bus_id}</span>
                      <Badge className={confidenceBadgeColor(event.confidence)} variant="secondary">
                        {(event.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No incidents to display
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

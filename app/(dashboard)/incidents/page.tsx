import { supabaseAdmin } from "@/lib/db"
import { IncidentsClient } from "@/components/incidents/IncidentsClient"
import { INCIDENT_TYPES } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function IncidentsPage() {
  const { data: events } = await supabaseAdmin
    .from("events")
    .select("*")
    .in("type", INCIDENT_TYPES)
    .order("timestamp", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
      <p className="text-muted-foreground">High-priority alerts and incidents reported by the edge agents.</p>
      <div className="border rounded-xl bg-card overflow-hidden">
        <IncidentsClient initialEvents={events ?? []} />
      </div>
    </div>
  )
}

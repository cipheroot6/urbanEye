import { supabaseAdmin } from "@/lib/db"
import { formatTimestamp } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = "force-dynamic"

export default async function BusesPage() {
  const { data: buses } = await supabaseAdmin
    .from("buses")
    .select("*")
    .order("last_seen", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bus Fleet</h1>
      <p className="text-muted-foreground">Manage and track active edge agents.</p>
      
      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus ID</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Location</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!buses || buses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No buses registered in the system.
                </TableCell>
              </TableRow>
            ) : (
              buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.bus_id}</TableCell>
                  <TableCell>{bus.route_id ?? <span className="text-muted-foreground italic">Unassigned</span>}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={bus.status === "active" ? "default" : bus.status === "idle" ? "secondary" : "destructive"}
                      className={bus.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {bus.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {bus.last_lat && bus.last_lng ? `${bus.last_lat.toFixed(5)}, ${bus.last_lng.toFixed(5)}` : "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {bus.last_seen ? formatTimestamp(bus.last_seen) : "Never"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

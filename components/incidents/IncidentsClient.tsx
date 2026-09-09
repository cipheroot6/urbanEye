"use client"

import { useState } from "react"
import { EventRow } from "@/types"
import { DETECTION_LABELS } from "@/lib/constants"
import { formatTimestamp, formatCoords, confidenceBadgeColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function IncidentsClient({ initialEvents }: { initialEvents: EventRow[] }) {
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Bus ID</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Camera</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Image</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialEvents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No incidents found.
              </TableCell>
            </TableRow>
          ) : (
            initialEvents.map((event) => (
              <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedEvent(event)}>
                <TableCell className="whitespace-nowrap">{formatTimestamp(event.timestamp)}</TableCell>
                <TableCell className="font-medium">{DETECTION_LABELS[event.type] ?? event.type}</TableCell>
                <TableCell>{event.bus_id}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{formatCoords(event.lat, event.lng)}</TableCell>
                <TableCell className="capitalize">{event.camera}</TableCell>
                <TableCell>
                  <Badge className={confidenceBadgeColor(event.confidence)} variant="secondary">
                    {(event.confidence * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.crop_url ? (
                    <div className="h-8 w-12 bg-muted rounded overflow-hidden flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.crop_url} alt="crop" className="object-cover h-full w-full" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              {selectedEvent && `${DETECTION_LABELS[selectedEvent.type] ?? selectedEvent.type} reported by Bus ${selectedEvent.bus_id} at ${formatTimestamp(selectedEvent.timestamp)}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent?.crop_url ? (
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedEvent.crop_url} alt="Incident Full Size" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              No image available for this incident
            </div>
          )}
          
          {selectedEvent && (
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <span className="text-muted-foreground block text-xs">Coordinates</span>
                <span className="font-mono">{selectedEvent.lat}, {selectedEvent.lng}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Confidence Score</span>
                <span>{(selectedEvent.confidence * 100).toFixed(1)}%</span>
              </div>
              {selectedEvent.plate && (
                <div>
                  <span className="text-muted-foreground block text-xs">License Plate Detected</span>
                  <Badge variant="outline" className="font-mono mt-1">{selectedEvent.plate}</Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

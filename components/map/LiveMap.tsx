"use client"

import { useState, useCallback } from "react"
import { BaseMap } from "./BaseMap"
import { EventMarkers } from "./EventMarkers"
import { usePusher } from "@/hooks/usePusher"
import { PUSHER_EVENTS } from "@/lib/constants"
import type { EventRow } from "@/types"

type Props = { initialEvents: EventRow[] }

export function LiveMap({ initialEvents }: Props) {
  const [events, setEvents] = useState<EventRow[]>(initialEvents)

  const onNewIncident = useCallback((data: unknown) => {
    const event = data as EventRow
    setEvents((prev) => [event, ...prev].slice(0, 200)) // keep last 200
  }, [])

  usePusher(PUSHER_EVENTS.NEW_INCIDENT, onNewIncident)

  return (
    <div className="h-full w-full">
      <BaseMap>
        <EventMarkers events={events} />
      </BaseMap>
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"
import Pusher from "pusher-js"
import { PUSHER_CHANNEL } from "@/lib/constants"

type Handler = (data: unknown) => void

export function usePusher(event: string, handler: Handler) {
  const pusherRef = useRef<Pusher | null>(null)

  useEffect(() => {
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusherRef.current.subscribe(PUSHER_CHANNEL)
    channel.bind(event, handler)

    return () => {
      channel.unbind(event, handler)
      pusherRef.current?.unsubscribe(PUSHER_CHANNEL)
      pusherRef.current?.disconnect()
    }
  }, [event, handler])
}

"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { DETECTION_LABELS, DETECTION_COLORS } from "@/lib/constants"

type Props = {
  eventCounts: Record<string, number>
  vehicleCounts: { timestamp: string; total: number }[]
}

export function AnalyticsCharts({ eventCounts, vehicleCounts }: Props) {
  // Format data for bar chart
  const barData = Object.entries(eventCounts)
    .map(([type, count]) => ({
      name: DETECTION_LABELS[type] ?? type,
      count,
      fill: DETECTION_COLORS[type] ?? "#8884d8",
    }))
    .sort((a, b) => b.count - a.count)

  // Format data for line chart
  const lineData = vehicleCounts.map((v) => ({
    time: new Date(v.timestamp).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
    total: v.total,
  })).reverse()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <div className="border rounded-xl bg-card p-4 h-80 flex flex-col">
        <h3 className="font-semibold text-sm mb-4">Event Frequency by Type</h3>
        <div className="flex-1 min-h-0">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip cursor={{ fill: "#222" }} contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </div>
      </div>

      <div className="border rounded-xl bg-card p-4 h-80 flex flex-col">
        <h3 className="font-semibold text-sm mb-4">Traffic Flow (Vehicles Counted)</h3>
        <div className="flex-1 min-h-0">
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }} />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </div>
      </div>
    </div>
  )
}

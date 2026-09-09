"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ReportGenerator() {
  const [loading, setLoading] = useState(false)

  const handleDownloadJSON = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/events?limit=1000")
      const data = await res.json()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `urbaneye_report_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate report", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 mt-6">
      <Button onClick={handleDownloadJSON} disabled={loading}>
        {loading ? "Generating..." : "Download JSON Report (Last 1000 Events)"}
      </Button>
    </div>
  )
}

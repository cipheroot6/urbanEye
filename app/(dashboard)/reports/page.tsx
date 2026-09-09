import { ReportGenerator } from "@/components/shared/ReportGenerator"

export const dynamic = "force-dynamic"

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Reports & Export</h1>
      <p className="text-muted-foreground">
        Generate and download structured data exports for offline analysis, auditing, and compliance reporting.
      </p>
      
      <div className="border rounded-xl bg-card p-6">
        <h2 className="text-lg font-semibold mb-2">Data Export</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Download a complete dump of the most recent events captured by the edge agents. 
          The payload includes GPS coordinates, classification confidences, and image URLs.
        </p>
        
        <ReportGenerator />
      </div>
    </div>
  )
}

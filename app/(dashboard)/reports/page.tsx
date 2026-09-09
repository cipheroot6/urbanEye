export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <div className="border rounded-xl bg-card p-6 min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Export events as CSV or generate JSON reports.</p>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Generate Report</button>
      </div>
    </div>
  )
}

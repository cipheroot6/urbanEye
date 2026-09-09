import { Sidebar } from "@/components/shared/Sidebar"
import { MobileNav } from "@/components/shared/MobileNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      <MobileNav />
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  )
}

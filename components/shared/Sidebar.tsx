"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, AlertTriangle, BarChart2, Bus, FileText, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/buses", label: "Bus Fleet", icon: Bus },
  { href: "/reports", label: "Reports", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-60 border-r bg-card flex-col p-4 gap-1">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-bold tracking-tight">UrbanEye</h1>
        <p className="text-xs text-muted-foreground">Urban Intelligence Platform</p>
      </div>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </aside>
  )
}

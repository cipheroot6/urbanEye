export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  let query = supabaseAdmin
    .from("events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit)

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/db"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("buses")
    .select("*")
    .order("last_seen", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

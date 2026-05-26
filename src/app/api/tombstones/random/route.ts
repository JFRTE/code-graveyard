import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabase()

  // Get total count
  const { count } = await supabase
    .from('tombstones')
    .select('*', { count: 'exact', head: true })

  if (!count || count === 0) {
    return NextResponse.json({ error: '没有墓碑' }, { status: 404 })
  }

  // Pick a random offset
  const offset = Math.floor(Math.random() * count)

  const { data, error } = await supabase
    .from('tombstones')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset)
    .limit(1)
    .single()

  if (error || !data) {
    // Fallback: just get the first one
    const { data: fallback } = await supabase
      .from('tombstones')
      .select('*')
      .limit(1)
      .single()
    if (fallback) return NextResponse.json(fallback)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }

  return NextResponse.json(data)
}

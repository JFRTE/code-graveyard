import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()

  // Increment view count (fire and forget style)
  const { data } = await supabase
    .from('tombstones')
    .select('view_count')
    .eq('id', params.id)
    .single()

  if (data) {
    await supabase
      .from('tombstones')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', params.id)
  }

  return NextResponse.json({ success: true })
}

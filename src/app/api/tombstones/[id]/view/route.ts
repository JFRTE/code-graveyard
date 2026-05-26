import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()

  const { data, error: selectError } = await supabase
    .from('tombstones')
    .select('view_count')
    .eq('id', params.id)
    .single()

  if (selectError || !data) {
    return NextResponse.json({ error: '墓碑不存在' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('tombstones')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, view_count: (data.view_count || 0) + 1 })
}

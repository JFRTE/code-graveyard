import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ hasCandled: false })

  const supabase = getSupabase()
  const { data } = await supabase
    .from('candles')
    .select('id')
    .eq('tombstone_id', params.id)
    .eq('user_id', session.user.id)
    .limit(1)

  return NextResponse.json({ hasCandled: (data?.length || 0) > 0 })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const supabase = getSupabase()

  // Check if already candled
  const { data: existing } = await supabase
    .from('candles')
    .select('id')
    .eq('tombstone_id', params.id)
    .eq('user_id', session.user.id)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: '已经点过蜡烛了' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('candles')
    .insert({
      tombstone_id: params.id,
      user_id: session.user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment candle count (best effort)
  try {
    const { data: t } = await supabase.from('tombstones').select('candle_count').eq('id', params.id).single()
    if (t) await supabase.from('tombstones').update({ candle_count: (t.candle_count || 0) + 1 }).eq('id', params.id)
  } catch (_) {}

  // Create notification
  const { data: tombstone } = await supabase
    .from('tombstones')
    .select('user_id, code_name')
    .eq('id', params.id)
    .single()

  if (tombstone && tombstone.user_id !== session.user.id) {
    await supabase.from('notifications').insert({
      user_id: tombstone.user_id,
      type: 'candle',
      from_username: session.user.name || 'Anonymous',
      from_avatar_url: session.user.image || '',
      tombstone_id: params.id,
      tombstone_name: tombstone.code_name,
    }).catch(() => {})
  }

  return NextResponse.json(data, { status: 201 })
}

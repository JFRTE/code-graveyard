import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ hasFlowered: false })

  const supabase = getSupabase()
  const { data } = await supabase
    .from('flowers')
    .select('id')
    .eq('tombstone_id', params.id)
    .eq('user_id', session.user.id)
    .limit(1)

  return NextResponse.json({ hasFlowered: (data?.length || 0) > 0 })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  // Rate limit
  const rateLimit = await checkRateLimit(`flower:${session.user.id}`, 10, 60)
  if (!rateLimit.allowed) return NextResponse.json({ error: '操作太频繁，请稍后再试' }, { status: 429 })

  const supabase = getSupabase()

  // Check if already flowered
  const { data: existing } = await supabase
    .from('flowers')
    .select('id')
    .eq('tombstone_id', params.id)
    .eq('user_id', session.user.id)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: '已经献过花了' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('flowers')
    .insert({
      tombstone_id: params.id,
      user_id: session.user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Atomic increment flower count
  await supabase.rpc('increment_counter', { row_id: params.id, column_name: 'flower_count' })

  // Create notification
  const { data: tombstone } = await supabase
    .from('tombstones')
    .select('user_id, code_name')
    .eq('id', params.id)
    .single()

  if (tombstone && tombstone.user_id !== session.user.id) {
    await supabase.from('notifications').insert({
      user_id: tombstone.user_id,
      type: 'flower',
      from_username: session.user.name || 'Anonymous',
      from_avatar_url: session.user.image || '',
      tombstone_id: params.id,
      tombstone_name: tombstone.code_name,
    }).catch(() => {})
  }

  // Log activity
  await supabase.from('activity_log').insert({
    type: 'flower',
    user_id: session.user.id,
    username: session.user.name || 'Anonymous',
    avatar_url: session.user.image || '',
    tombstone_id: params.id,
    tombstone_name: tombstone?.code_name || '',
  }).catch(() => {})

  return NextResponse.json(data, { status: 201 })
}

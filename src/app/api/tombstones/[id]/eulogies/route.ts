import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Get eulogies
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('eulogies')
    .select('*')
    .eq('tombstone_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Post eulogy
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  // Rate limit
  const rateLimit = await checkRateLimit(`eulogy:${session.user.id}`, 5, 60)
  if (!rateLimit.allowed) return NextResponse.json({ error: '操作太频繁，请稍后再试' }, { status: 429 })

  const supabase = getSupabase()
  const body = await request.json()

  if (!body.content?.trim()) return NextResponse.json({ error: '内容不能为空' }, { status: 400 })

  const { data, error } = await supabase
    .from('eulogies')
    .insert({
      tombstone_id: params.id,
      user_id: session.user.id,
      username: session.user.name || 'Anonymous',
      avatar_url: session.user.image || '',
      content: body.content,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Atomic increment eulogy count
  // Atomic increment (best effort - falls back gracefully)
  try {
    57|  await supabase.rpc('increment_counter', { row_id: params.id, column_name: 'eulogy_count' })
  } catch (_) {}

  // Create notification for tombstone owner
  const { data: tombstone } = await supabase
    .from('tombstones')
    .select('user_id, code_name')
    .eq('id', params.id)
    .single()

  if (tombstone && tombstone.user_id !== session.user.id) {
    try {
      await supabase.from('notifications').insert({
      user_id: tombstone.user_id,
      type: 'eulogy',
      from_username: session.user.name || 'Anonymous',
      from_avatar_url: session.user.image || '',
      tombstone_id: params.id,
      tombstone_name: tombstone.code_name,
      })
    } catch (_) {}
  }

  // Log activity
  try {
    await supabase.from('activity_log').insert({
    type: 'eulogy',
    user_id: session.user.id,
    username: session.user.name || 'Anonymous',
    avatar_url: session.user.image || '',
    tombstone_id: params.id,
    tombstone_name: tombstone?.code_name || '',
    detail: body.content?.substring(0, 100) || '',
    })
  } catch (_) {}

  return NextResponse.json(data, { status: 201 })
}

// Delete eulogy
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const eulogyId = searchParams.get('eulogyId')

  if (!eulogyId) return NextResponse.json({ error: '缺少悼词ID' }, { status: 400 })

  // Check ownership of the eulogy
  const { data: existing } = await supabase
    .from('eulogies')
    .select('user_id')
    .eq('id', eulogyId)
    .single()

  if (!existing || existing.user_id !== session.user.id) {
    return NextResponse.json({ error: '无权删除' }, { status: 403 })
  }

  const { error } = await supabase
    .from('eulogies')
    .delete()
    .eq('id', eulogyId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

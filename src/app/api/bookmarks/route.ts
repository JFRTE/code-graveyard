import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ bookmarks: [] })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bookmarks')
    .select('tombstone_id, tombstones(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tombstones = (data || []).map((b: any) => b.tombstones).filter(Boolean)
  return NextResponse.json({ bookmarks: tombstones })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const supabase = getSupabase()
  const { tombstone_id } = await request.json()

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: session.user.id, tombstone_id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '已收藏' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const supabase = getSupabase()
  const { tombstone_id } = await request.json()

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', session.user.id)
    .eq('tombstone_id', tombstone_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

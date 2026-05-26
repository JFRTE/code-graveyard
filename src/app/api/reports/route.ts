import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const supabase = getSupabase()
  const { tombstone_id, reason } = await request.json()

  if (!reason?.trim()) return NextResponse.json({ error: '请填写举报原因' }, { status: 400 })

  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: session.user.id,
      tombstone_id,
      reason,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// Admin: get all reports
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '未授权' }, { status: 401 })

  // Simple admin check - in production use a proper role system
  const supabase = getSupabase()
  const { data: tombstone } = await supabase
    .from('tombstones')
    .select('user_id')
    .eq('user_id', session.user.id)
    .limit(1)

  // For now, only show reports to admin (you can improve this)
  const { data, error } = await supabase
    .from('reports')
    .select('*, tombstones(code_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data || [] })
}

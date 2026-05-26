import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const ADMIN_USERS = ['JFRTE'] // GitHub usernames

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

  // Admin check
  const username = session.user.name || ''
  if (!ADMIN_USERS.includes(username)) {
    return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reports')
    .select('*, tombstones(code_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data || [] })
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const ADMIN_USER_IDS = ['75133540'] // JFRTE

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  // Rate limit
  const rateLimit = await checkRateLimit(`report:${session.user.id}`, 3, 300)
  if (!rateLimit.allowed) return NextResponse.json({ error: '操作太频繁，请稍后再试' }, { status: 429 })

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

  // Admin check (use stable user ID, not mutable username)
  const userId = session.user.id || ''
  if (!ADMIN_USER_IDS.includes(userId)) {
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

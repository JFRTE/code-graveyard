import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabase()
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { id } = params

  // Insert candle record
  const { error } = await supabase.from('candles').insert({ tombstone_id: id, user_id: session.user.id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update candle count
  await supabase.rpc('increment_candle_count', { tombstone_id_param: id })
  return NextResponse.json({ message: '点蜡烛成功' }, { status: 201 })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabase()
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ hasCandled: false })

  const { id } = params
  const { data } = await supabase.from('candles').select('id').eq('tombstone_id', id).eq('user_id', session.user.id).single()
  return NextResponse.json({ hasCandled: !!data })
}

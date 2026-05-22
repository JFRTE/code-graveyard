import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { id } = await params

  const { data: existing } = await supabase.from('flowers').select('id').eq('tombstone_id', id).eq('user_id', session.user.id).single()
  if (existing) return NextResponse.json({ error: '你已经献过花了' }, { status: 400 })

  const { error } = await supabase.from('flowers').insert({ tombstone_id: id, user_id: session.user.id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.rpc('increment_flower_count', { tombstone_id_param: id })
  return NextResponse.json({ message: '献花成功' }, { status: 201 })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ hasFlowered: false })

  const { id } = await params
  const { data } = await supabase.from('flowers').select('id').eq('tombstone_id', id).eq('user_id', session.user.id).single()
  return NextResponse.json({ hasFlowered: !!data })
}

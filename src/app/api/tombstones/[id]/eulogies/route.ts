import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase.from('eulogies').select('*').eq('tombstone_id', id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { content } = body

  if (!content?.trim()) return NextResponse.json({ error: '悼词不能为空' }, { status: 400 })

  const { data, error } = await supabase.from('eulogies').insert({
    tombstone_id: id,
    user_id: session.user.id,
    username: session.user.name || 'Anonymous',
    avatar_url: session.user.image || '',
    content: content.trim(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.rpc('increment_eulogy_count', { tombstone_id_param: id })
  return NextResponse.json(data, { status: 201 })
}

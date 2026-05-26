import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const userId = searchParams.get('userId')
  const search = searchParams.get('search')
  const cause = searchParams.get('cause')
  const language = searchParams.get('language')
  const offset = (page - 1) * limit

  let query = supabase.from('tombstones').select('*').order('created_at', { ascending: false })

  if (userId) query = query.eq('user_id', userId)
  if (search) query = query.or(`code_name.ilike.%${search}%,description.ilike.%${search}%`)
  if (cause) query = query.eq('cause_of_death', cause)
  if (language) query = query.eq('language', language)

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count } = await supabase.from('tombstones').select('*', { count: 'exact', head: true })
  return NextResponse.json({ tombstones: data, total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) })
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const body = await request.json()
  const { code_name, code_content, language, cause_of_death, birth_date, death_date, description } = body

  if (!code_name || !code_content || !cause_of_death) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })

  const { data, error } = await supabase.from('tombstones').insert({
    user_id: session.user.id,
    username: session.user.name || 'Anonymous',
    avatar_url: session.user.image || '',
    code_name, code_content,
    language: language || 'unknown',
    cause_of_death,
    birth_date: birth_date || null,
    death_date: death_date || new Date().toISOString().split('T')[0],
    description: description || '',
    flower_count: 0,
    eulogy_count: 0,
    candle_count: 0,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
